const {api} = window;

var numOfNodes = 0;

export function createNewNode(event) {
	numOfNodes++;
	api.addNode("addNode");
}

export function getNumberOfNodes() {
	return numOfNodes;
}

export function importBagFileListener(event) {
	if( document.getElementById("myFile").value != "" )
	{
		importBtn.className += "running";
		importBtn.removeEventListener('click', importBagFileListener);
		var rosPath = document.getElementById("myFile").files[0].path;
		api.rosbag("rosbag", rosPath);
	}
	else
	{
		importResult.textContent = "Import Failed: Please input a rosbag file";
	}
}

export function calibrateListener(event) {

	calBtn.className += "running";
	calBtn.removeEventListener('click', calibrateListener);

	var topicList = [];
	for( var i = 0; i < numOfNodes; i++ )
	{
		var nodeList = document.getElementsByClassName("nodeList")[i];
		topicList.push( nodeList.value );
	}

	api.calPlusJson("calPlusJson", topicList);
}

export function saveJsonFile(event) {
	var jsonPath = "output_json/" + document.getElementById("jsonName").value;
	api.saveGraph("saveGraph", jsonPath);
}

export function importBag(rosPath) {
	if( rosPath != "" )
	{
		var rosPath = document.getElementById("myFile").files[0].path;
		api.rosbag("rosbag", rosPath);
	}
	else
	{
		importResult.textContent = "Import Failed: Please input a rosbag file";
	}
}

export function handleClick(nodes) {
	console.log("clicked");
	api.send2("confirm", nodes);
}
