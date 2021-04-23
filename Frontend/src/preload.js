const { contextBridge, ipcRenderer } = require("electron");
var { PythonShell } = require('python-shell');
let fs = require('fs');

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
	rosbag: (channel, input) => {
		let validChannels = ["rosbag"];
		if( validChannels.includes(channel)) {
			rosbagRun(input);
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
	receive: (channel, cb) => {
    	const allowedChannels = ["bagfile", "calibration"];
    	if(allowedChannels.includes(channel)) {
      		ipcRenderer.on(channel, (event, ...args) => cb(...args));
    	}
  	}
})

//Clears local graph variables//
function clearGraph() {
	frontendGraph = new Object();
	backendGraph = new Object();
	fullGraph = new Object();
}

//Clears local edge lists//
function clearEdges() {
	frontendGraph.edges = [];
	backendGraph.edges = [];
	fullGraph.edges = [];
}

//Calls a python script that extracts topics from an imported rosbag file//
function rosbagRun(input) {

	if( input.substring(input.length-4, input.length) != ".bag" )
	{
		console.log("Import Failed: imported file is not a rosbag file");
		alert("Import Failed: imported file is not a rosbag file");
	}
	else
	{
		rosbagPath = input;

		let options = {
		mode: 'text',
		args: [input]
		};

		PythonShell.run('Backend/extract_topics/bagpy_list_topics.py', options, function (err, results) {
			if(err) {
				console.log("Import Failed: " + err.toString());
				alert("Import Failed: " + err.toString());
				throw err;
			}
			else {
				console.log("Import Successful");
				topicList = [];

				findTopics(results);
				ipcRenderer.send("bagfile", topicList);
			}
		});
	}
}

//Returns list of rostopics from the bagpy result message//
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

//Performs back-end calibration script with the passed JSON graph from the front-end//
function calibration(inputGraph) {
	
	var jsonStr = JSON.stringify(inputGraph);
	//console.log("Passed Graph: \n" + jsonStr);

	if( inputGraph.numberOfNodes == undefined || inputGraph.numberOfNodes <= 1 || inputGraph.numberOfEdges == 0)
	{
		console.log("GRAPH ERROR: Need at least 2 nodes with 1 edge between them.");
		alert("GRAPH ERROR: Need at least 2 nodes with 1 edge between them.");
	}
	else
	{
    	frontendGraph = inputGraph;

		let options = {
			mode: 'text',
			args: [jsonStr]
		};

		PythonShell.run('Backend/calibration_service/calibration_service.py', options, function (err, results) {
			if (err) {
				console.log("CALIBRATION ERROR: " + err.toString());
				alert("CALIBRATION ERROR: " + err.toString());
				throw err;
			}
			else {
				var calResult = JSON.parse(results[0]);

				ipcRenderer.send("calibration", calResult);

				//Gets list of returned matrices//
				// var matrixResults = [];
				// for( var i = 2; i < results.length; i++ ) {
				//   matrixResults.push( results[i] );
				// }

				// matrixResults[0] = matrixResults[0].replaceAll("\'", "\"");
				// matrixResults[0] = matrixResults[0].replaceAll("True", "true");
				// matrixResults[0] = matrixResults[0].replaceAll("False", "false");

				// var matr = matrixResults[0];

				// backendGraph = JSON.parse(matr);
       	//createFullGraph();
			}
		});
	}
}

//Merges back-end results to front-end graph//
function createFullGraph() {

	fullGraph = JSON.parse(JSON.stringify(frontendGraph));

	for( var n = 0; n < numOfEdges; n++ ) {
		fullGraph.edges[n].matrix = backendGraph.matrix;
		fullGraph.edges[n].errScore = backendGraph.errScore;
	}
}

//Calls back-end script to save the full graph json string to a file//
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

