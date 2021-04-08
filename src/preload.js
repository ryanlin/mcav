const { contextBridge, ipcRenderer } = require("electron");
var { PythonShell } = require('python-shell');
let fs = require('fs');
//var { actionListeners } = require('electron').remote.require("./functions.js");
//import * as actionListeners from "./functions.js";

//Global Variables//
var frontendGraph = new Object();
var backendGraph = new Object();
var fullGraph = new Object();
var topicList = [];
var rosbagPath;
var numOfNodes = 0;
var numOfEdges;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
	name: process.versions["node"],
	test: (channel, nodes, edges) => {
	  let validChannels = ["test"];
	  if( validChannels.includes(channel) ) {
	    test(nodes, edges);
		  }
	},
	clearGraph: (channel) => {
	  let validChannels = ["clearGraph"];
	  if( validChannels.includes(channel) ) {
	    clearGraph();
	  }
	},
	clearEdges: (channel) => {
	  let validChannels = ["clearEdges"];
	  if( validChannels.includes(channel) ) {
	    clearEdges();
	  }
	},
	addNode: (channel) => {
		let validChannels = ["addNode"];
		if( validChannels.includes(channel) ) {
			addNode();
		}
	},
	rosbag: (channel, input) => {
		let validChannels = ["rosbag"];
		if( validChannels.includes(channel)) {
			rosbagRun(input);
		}
	},
	json: (channel, rosPath, jsonPath, gpsTopic, lidarTopic) => {
		let validChannels = ["json"];
		if( validChannels.includes(channel)) {
			createJsonFileFrontEnd(rosPath, jsonPath, gpsTopic, lidarTopic);
		}
	},
	calPlusJson: (channel, topicList) => {
		let validChannels = ["calPlusJson"];
		if( validChannels.includes(channel)) {
			calPlusJson(topicList);
		}
	},
  calibration: (channel, inputGraph) => {
    let validChannels = ["calibration"];
    if( validChannels.includes(channel)) {
      calibration(inputGraph);
    }
  },
	saveGraph: (channel, jsonPath) => {
		let validChannels = ["saveGraph"];
		if( validChannels.includes(channel)) {
			saveGraph(jsonPath);
		}
	},
  test2: test2(),
  send: (channel, ...data) => {
    const allowedChannels = ["check", "confirm"];
    if(allowedChannels.includes(channel)) {
      console.log('send');
      ipcRenderer.send(channel, ...data);
    }
  },
  send2: (channel) => {
    const allowedChannels = ["check", "confirm"];
    if(allowedChannels.includes(channel)) {
      console.log('send2');
      ipcRenderer.send(channel, frontendGraph);
    }
  },
  receive: (channel, cb) => {
    const allowedChannels = ["clear", "req", "bagfile", "calibration"];
    if(allowedChannels.includes(channel)) {
      console.log('calling reciever');
      ipcRenderer.on(channel, (event, ...args) => cb(...args));
    }
  }
  }
)

function test(nodes, edges) {
  frontendGraph.numOfNodes = nodes.length
  frontendGraph.numOfEdges = edges.length;
  numOfNodes = nodes.length;
  numOfEdges = edges.length;
  frontendGraph.nodes = JSON.parse(JSON.stringify(nodes));
  frontendGraph.edges = JSON.parse(JSON.stringify(edges));
  console.log(JSON.stringify(frontendGraph));
}

function test2() {
  return(JSON.stringify(frontendGraph));
}

function clearGraph() {
  frontendGraph = new Object();
  backendGraph = new Object();
  fullGraph = new Object();
}

function clearEdges() {
  frontendGraph.edges = [];
  backendGraph.edges = [];
  fullGraph.edges = [];
}

function addNode() {
	numOfNodes++;
	nodes.innerHTML += '<div id=\"nodePanel\"' + numOfNodes + '>' +
						'<span id=\"nodeResults\" class=\"nodeResults\"> Topics For Node ' + (numOfNodes-1).toString() + ' </span>' + '<select id=\"nodeList\" class=\"nodeList\"></select>' + '</br>'
					   '</div>';

	if( topicList.length > 0 )
 	{
		fillNodeList(numOfNodes-1);
	}
}

function rosbagRun(input) {

  console.log(input);
  if( input.substring(input.length-4, input.length) != ".bag" )
  {
  	console.log("Import Failed: imported file is not a rosbag file");
  }
  else
  {
	  rosbagPath = input;

	  let options = {
		mode: 'text',
		args: [input]
	  };

	  PythonShell.run('src/python/bagpy_list_topics.py', options, function (err, results) {
		//importBtn.className = "btn btn-secondary ld-over";
		//importBtn.addEventListener('click', importBagFileListener );
		if(err) {
			//importResult.textContent = "Import Failed: " + err.toString();
      console.log("Import Failed: " + err.toString());
			throw err;
		}
		else {
			//importResult.textContent = "Import Successful";
      console.log("Import Successful");
			topicList = [];

			findTopics(results);
      console.log(topicList);
      ipcRenderer.send("bagfile", topicList);
			for( var i = 0; i < numOfNodes; i++ ) {
				//fillNodeList(i);
        //console.log()
			}
		}
	  });
  }

}

function findTopics(results)
{
	for( var i = 0; i < results.length; i++ ) {
		// Add a new row to the table using the correct activityNumber
		var checkStr = results[i].slice(3, results[i].length-4);
		checkStr = checkStr.trim();

		if( checkStr.length >= 0 && checkStr.charAt(0) == '/') {
			topicList.push( checkStr );
		}
	}
}

function fillNodeList(i)
{
	var nodeList = document.getElementsByClassName("nodeList")[i];
	nodeList.innerHTML = '';
	for( var j = 0; j < topicList.length; j++ ) {
				nodeList.innerHTML += '<option>' + '\n' + topicList[j] + '</option>';
	}
}

function calPlusJson(topicList)
{
	createJsonFrontEndTestFile(rosbagPath, topicList);
	//createJsonFrontEnd(rosPath, topicList);
	calibrateUsingJson();
}

function createJsonFrontEnd(rosPath, topicList) {

  frontendGraph.numberOfNodes = numOfNodes;
  frontendGraph.numberOfEdges = numOfEdges;
	frontendGraph.nodes = [];
	frontendGraph.edges = [];

	for( var n = 0; n < numOfNodes; n++ ) {
		var node = new Object();
		node.id = n;
		node.type = "pose";
		node.topic = topicList[n];
		node.rosbagPath = rosPath;

		frontendGraph.nodes.push(node);
	}

	if( numOfEdges > 0 )
	{
		for( var e = 0; e < numOfEdges; e++ ) {
			var edge = new Object();
			edge.id = e;
			edge.sourceNodeID = e;
			edge.targetNodeID = e+1;

			frontendGraph.edges.push(edge);
		}
	}
}

function createJsonFrontEndTestFile(rosPath, topicList) {

	createJsonFrontEnd( rosPath, topicList );

	//Write json file for front end//
	var dictString = JSON.stringify(frontendGraph);

	fs.writeFile("output_json/frontend_test.json", dictString, function(err, result) {
    	if(err) console.log('error', err);
	});
}

function calibration(inputGraph) {

  //clearCalTable();
  console.log("checking");
  console.log(inputGraph);
	if( inputGraph.numberOfNodes == undefined || inputGraph.numberOfNodes == 0 || inputGraph.numberOfNodes == 1 )
	{
		//const calBtn = document.getElementById("calBtn");
		//calBtn.className = "btn btn-primary ld-over";
		//calBtn.addEventListener('click', calibrateListener );
		//calResult.textContent = "GRAPH ERROR: Need at least 2 nodes with 1 edge between them.";
    console.log("GRAPH ERROR: Need at least 2 nodes with 1 edge between them.");
	}
	else
	{
    frontendGraph = inputGraph;
    console.log(inputGraph);
		var jsonStr = JSON.stringify(inputGraph);

		let options = {
			mode: 'text',
			args: [jsonStr]
		};

		PythonShell.run('Backend/calibration_service/calibration_service.py', options, function (err, results) {
			// const calBtn = document.getElementById("calBtn");
			// calBtn.className = "btn btn-primary ld-over";
			// calBtn.addEventListener('click', calibrateListener );
			if (err) {
				//calResult.textContent = "Calibration ERROR: " + err.toString();
        console.log("CALIBRATION ERROR: " + err.toString());
				throw err;
			}
			else {
        var calResult = JSON.parse(results[2]);
        console.log(calResult);
        console.log(calResult[0]);
        console.log(calResult[0].matrix);
        ipcRenderer.send("calibration", calResult);
				// calResult.textContent = "Calibration SUCCESS: ";
				// resultTable.innerHTML += '<tr><td>' + "Output: " + '</td></tr>';
				//TO DO: Debug bagreader so that it doesnt print anything while reading bag files//
				var matrixResults = [];
				for( var i = 2; i < results.length; i++ ) {
				  //resultTable.innerHTML += '<tr><td>' + results[i] + '</td></tr>';
				  matrixResults.push( results[i] );
				}

				matrixResults[0] = matrixResults[0].replaceAll("\'", "\"");
				matrixResults[0] = matrixResults[0].replaceAll("True", "true");
				matrixResults[0] = matrixResults[0].replaceAll("False", "false");

				var matr = matrixResults[0];

				backendGraph = JSON.parse(matr);

				//createFullGraph();
        //ipcRenderer.send("calibration", fullGraph);
			}
		});

	}
}

function calibrateUsingJson() {
	/*
	resultTable.innerHTML += '<tr><td>' + "rosbag path: " + frontendGraph.nodes[0].rosbagPath + '</td></tr>';
	for( var n = 0; n < numOfNodes; n++ ) {
		resultTable.innerHTML += '<tr><td>' + "node" + n.toString() + " topic: " + frontendGraph.nodes[n].topic + '</td></tr>';
	}
	*/
	clearCalTable();

	if( frontendGraph.numberOfNodes === undefined || frontendGraph.numberOfNodes == 0 || frontendGraph.numberOfNodes == 1 )
	{
		const calBtn = document.getElementById("calBtn");
		calBtn.className = "btn btn-primary ld-over";
		calBtn.addEventListener('click', calibrateListener );
		calResult.textContent = "Calibration ERROR: Need at least 2 nodes with 1 edge between them.";
	}
	else
	{
		var jsonStr = JSON.stringify(frontendGraph);

		let options = {
			mode: 'text',
			args: [jsonStr]
		};

		PythonShell.run('python/python_test.py', options, function (err, results) {
			const calBtn = document.getElementById("calBtn");
			calBtn.className = "btn btn-primary ld-over";
			calBtn.addEventListener('click', calibrateListener );
			if (err) {
				calResult.textContent = "Calibration ERROR: " + err.toString();
				throw err;
			}
			else {
				calResult.textContent = "Calibration SUCCESS: ";
				resultTable.innerHTML += '<tr><td>' + "Output: " + '</td></tr>';
				//TO DO: Debug bagreader so that it doesnt print anything while reading bag files//
				var matrixResults = [];
				for( var i = 2; i < results.length; i++ ) {
				  resultTable.innerHTML += '<tr><td>' + results[i] + '</td></tr>';
				  matrixResults.push( results[i] );
				}

				matrixResults[0] = matrixResults[0].replaceAll("\'", "\"");
				matrixResults[0] = matrixResults[0].replaceAll("True", "true");
				matrixResults[0] = matrixResults[0].replaceAll("False", "false");

				var matr = matrixResults[0];

				backendGraph = JSON.parse(matr);

				createFullGraph();
			}
		});
	}
}

function clearCalTable() {
	resultTable.innerHTML = "";
	calResult.textContent = "";
}

function clearBagFileTable() {
	for( var i = 0; i < numOfNodes; i++ ) {
			var nodeList = document.getElementsByClassName("nodeList")[i];
			nodeList.innerHTML = "";
		}
}

function createFullGraph() {

	fullGraph = JSON.parse(JSON.stringify(frontendGraph));

	for( var n = 0; n < numOfEdges; n++ ) {
		fullGraph.edges[n].orientation = backendGraph.orientation;
		fullGraph.edges[n].translation = backendGraph.translation;
		fullGraph.edges[n].errScore = backendGraph.errScore;
	}
}

function saveGraph(jsonPath) {

	let options = {
	    mode: 'text',
    	args: [jsonPath, JSON.stringify(fullGraph)]
    };

    PythonShell.run('python/save_json.py', options, function (err, results) {
		if (err) throw err;

		else {
			saveResult.textContent = "Graph Saved";
		}
	});
}

function importBagFileListener(event) {
	importBtn.className += "running";
	importBtn.removeEventListener('click', importBagFileListener);
	var rosPath = document.getElementById("myFile").files[0].path
	rosbagRun(rosPath, numOfNodes);
}

function calibrateListener(event) {
	const calBtn = document.getElementById("calBtn");
	calBtn.className += "running";
	calBtn.removeEventListener('click', calibrateListener);

	var topicList = [];
	for( var i = 0; i < numOfNodes; i++ )
	{
		var nodeList = document.getElementsByClassName("nodeList")[i];
		topicList.push( nodeList.value );
	}

	calPlusJson(topicList);
}
