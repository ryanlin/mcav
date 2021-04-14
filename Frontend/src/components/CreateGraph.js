import React, { useState, useRef, useForm } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;
import { Toolbar, NodePanel, CanvasButton, NodeTool, DropDown, CalibrationPanels } from './panels';

const INITIAL_STATE = [];
const circ_radius = 40;

var topicList = [];

const CreateGraph = () => {
  const [calibrations, setCalibrations] = useState(INITIAL_STATE);
  const [bagTopics, setBagTopics] = useState(INITIAL_STATE);
  const [fileState, setFileState] = useState("null");
  const [topic, setTopic] = useState("null");
  var [saveFile, setSaveFile] = useState("null");

  const stageRef = useRef(null);
  const layerRef = useRef(null);

  var [panelVisible, setPanelVisible] = useState(false);
  var [circles, setCircles] = useState(INITIAL_STATE);
  var [connectors, setConnectors] = React.useState(INITIAL_STATE);
  var [fromShapeId, setFromShapeId] = React.useState(null);
  var [displayID, setDisplayID] = React.useState("N/A");

  // Handlers
  const handleFileUpload = e => {
    setFileState(e.target.files[0]);
    console.log(e.target.files[0].path);
    circles.forEach( circle => {
      circle.rosbagPath = e.target.files[0].path;
    });
    console.log(circles);
  }

  const onClickCalibrate = () => {

    var fullGraph = {
      numberOfNodes: circles.length,
      numberOfEdges: connectors.length,
      nodes: circles,
      edges: connectors
    };

		api.receive("calibration", (res) => {
      console.log("calibration recieved");

      mergeCalibrationOutputs(connectors, res);

      connectors.forEach( connector => {
        var sourceNode, targetNode;
        circles.forEach( circle => {
          if( circle.id == connector.sourceNodeID ) {
            sourceNode = circle;
          }
          else if( circle.id == connector.targetNodeID ) {
            targetNode = circle;
          }
        });
        var position = returnMatrixPosition(sourceNode, targetNode);
        connector.x = position.x;
        connector.y = position.y;
      });

      //CHANGE Matrix Panels//
	  	console.log(circles);
      console.log(connectors);

      setCalibrations(connectors);

      setPanelVisible(true);
		}, []);

    //console.log(fullGraph);
    api.calibration("calibration", fullGraph);
    setSaveFile(fullGraph);
  }

  const selectTopic = (e) => {
    setTopic(e.target.value);
  }

  const clearCanvas = () => {
    var layer = layerRef.current;

    // Delete all arrows and circles
    layer.find('Arrow').destroy();
    layer.find('.deleteMe').destroy();

    // Set states to empty
    setConnectors([]);
    setCircles([]);

    // Clear arrays in preload.js
    api.clearGraph("clearGraph");

    // Set selected nodes to empty
    fromShapeId = null;
    displayID = "N/A";

    // Force rerender
    layer.draw();
  }

  const clearEdges = () => {
    var layer = layerRef.current;
    layer.find('Arrow').destroy();
    api.clearEdges("clearEdges");
    setConnectors([]);
    layer.draw();
  }

  const onMouseOverButton = (e, color) => {
    var stage = stageRef.current;
    stage.container().style.cursor = 'pointer';
    var layer = layerRef.current;
    var tag = e.currentTarget.getChildren(function(node){
      return node.getClassName() === 'Tag';
    })
    tag[0].setAttr('fill', color);
    layer.draw();
  }

  const onMouseOutButton = (e, color) => {
    var stage = stageRef.current;
    stage.container().style.cursor = 'default';
    var layer = layerRef.current;
    var tag = e.currentTarget.getChildren(function(node){
      return node.getClassName() === 'Tag';
    })
    tag[0].setAttr('fill', color);
    layer.draw();
  }

  const addGPSCircle = (e) => {
    const newCircle = {
      name: "deleteMe",
      x: e.target.x(),
      y: e.target.y(),
      id: circles.length,
      sensorType: "gps",
      type: "pose",
      topic: "null"
    }; // New circle properties : dictionary

    // Add circle to circles hook
    setCircles(circles.concat([newCircle]));

    // Reset node Tool position
    var layer = layerRef.current;
    var draggableCircle = layer.findOne(".draggableCircle");
    draggableCircle.position({ x: 140, y: 180 });
  }

  const addLidarCircle = (e) => {
    const newCircle = {
      name: "deleteMe",
      x: e.target.x(),
      y: e.target.y(),
      id: circles.length,
      sensorType: "lidar",
      type: "pose",
      topic: "null"
    }; // New circle properties : dictionary

    // Add circle to circles hook
    setCircles(circles.concat([newCircle]));

    // Reset node Tool position
    var layer = layerRef.current;
    var draggableCircle = layer.findOne(".draggableCircle2");
    draggableCircle.position({ x: 140, y: 285 });
  }

  const onMouseOverNodeTool = () => {
    var stage = stageRef.current;
    stage.container().style.cursor = 'move';
  }

  const onMouseOutNodeTool = () => {
    var stage = stageRef.current;
    stage.container().style.cursor = 'default';
  }


  return (
    <div>
      <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
        <Layer ref={layerRef}>
          {/*Toolbar*/}
          <Toolbar />

          {/*Panel*/}
          <NodePanel
            displayID={displayID}
          />

          {/* Clear Canvas Button*/}
          <CanvasButton
            x={65}
            y={50}
            value="Clear Canvas"
            onClick={clearCanvas}
            onMouseOver={ (e) => onMouseOverButton(e,'red')}
            onMouseOut={(e) => onMouseOutButton(e, 'yellow')}
          />

          {/* Clear Edges Button*/}
          <CanvasButton
            id="clear-canvas-Label"
            x={70}
            y={95}
            value="Clear Edges"
            onClick={clearEdges}
            onMouseOver={ (e) => onMouseOverButton(e,'red')}
            onMouseOut={(e) => onMouseOutButton(e, 'yellow')}
          />

          {/* GPS Circle*/}
          <NodeTool
            name="draggableCircle"
            text="GPS"
            text_pos={ {x:35, y:170} }
            node_pos={ {x:140, y:180} }
            fill="green"
            stroke="blue"
            draggable
            onDragEnd={addGPSCircle}
            onMouseOver={onMouseOverNodeTool}
            onMouseOut={onMouseOutNodeTool}
          />

          {/* Lidar Circle*/}
          <NodeTool
            name="draggableCircle2"
            text="LIDAR"
            text_pos={ {x:30, y:275} }
            node_pos={ {x:140, y:285} }
            fill="green"
            stroke="red"
            draggable
            onDragEnd={addLidarCircle}
            onMouseOver={onMouseOverNodeTool}
            onMouseOut={onMouseOutNodeTool}
          />

          {/* Render Calibration Panels*/}
          {calibrations.map((edge) => {

            var newMatrix = [];
            var stringMatrix = [];
            if( edge.matrix != null ) {
              newMatrix = edge.matrix;
              for( var i = 1; i <= newMatrix.length; i++ ) {
                  stringMatrix.push((Math.floor(newMatrix[i-1] * 1000) / 1000).toString());
                  if( i % 4 == 0 ) {
                    stringMatrix[i-1] += "\n";
                  }
              }
            }

            return (
            //if(edge.matrix != null) {
            //var newMatrix = edge.matrix ? edge.matrix : [];
              <CalibrationPanels
                x={edge.x}
                y={edge.y}
                matrix={stringMatrix}
                visible={panelVisible}
              />
            );
            //}
          })}

          {/* Render Circles*/}
          {circles.map((eachCircle) => (
            <Circle
              name={eachCircle.name}
              x={eachCircle.x}
              y={eachCircle.y}
              id={eachCircle.id}
              radius={circ_radius}
              fill={fromShapeId === eachCircle.id ? "red" : "green"}
              sensorType={eachCircle.sensorType}
              topic={eachCircle.topic}
              type={eachCircle.type}
              stroke={eachCircle.sensorType === "gps" ? "blue" : "red"}

              onClick={() => {
                // If no selected circle, select this circle
                // If selected circle is this circle, deselect
                // Otherwise make edge with selected circle
                if(fromShapeId != null) {
                  // If already selected circle is the circle just clicked, deselect
                  if(fromShapeId == eachCircle.id) {
                    setFromShapeId(null);
                    setDisplayID("N/A");
                    eachCircle.topic = topic;
                    document.getElementById("topicSelect").selectedIndex = 0;
                  } // If already selected circle is another circle, make edge
                  else if( !checkEdges(fromShapeId, eachCircle, connectors) ) {
                    const newConnector = {
                      id: connectors.length,
                      sourceNodeID: fromShapeId,
                      targetNodeID: eachCircle.id
                    };
                    setConnectors(connectors.concat([newConnector]));
                    setFromShapeId(null);
                  }
                } else { // If no circle is already selected
                  setTopic(eachCircle.topic);
                  var a = document.getElementById("topicSelect"); // Topics DropDown Menu
                  for(var i = 0; i < a.options.length; i++) {
                    if(a.options[i].label == eachCircle.topic) {
                      a.selectedIndex = i;
                    }
                  }

                  // Set this circle as selected circle
                  setFromShapeId(eachCircle.id);
                  setDisplayID(eachCircle.sensorType);
                }
              }}

              onMouseOver={() => {
                var stage = stageRef.current;
                stage.container().style.cursor = 'pointer';
              }}

              onMouseOut={() => {
                var stage = stageRef.current;
                stage.container().style.cursor = 'default';
              }}
            />
          ))}

          {/* Render Edges*/}
          {connectors.map(con => {
            const sourceNodeID = circles.find(s => s.id === con.sourceNodeID);
            const targetNodeID = circles.find(s => s.id === con.targetNodeID);

            return (
              <Arrow
                key={con.id}
                points={[sourceNodeID.x, sourceNodeID.y, targetNodeID.x, targetNodeID.y]}
                stroke="black"
              />
            );
          })}
        </Layer>
      </Stage>


      <input
        type={"file"}
        style={{
          position: 'absolute',
          top: 433,
          left: 30
        }}
        onChange={handleFileUpload}
      >
      </input>

      <button
        onClick={() => {
          api.rosbag("rosbag", fileState.path);
          api.receive("bagfile", (res) => {
            console.log("bagfile recieved");
            topicList = JSON.parse(JSON.stringify(res));
            console.log(topicList);

            setBagTopics(topicList);

          }, []);
        }}
        style={{
          position: 'absolute',
          top: 456,
          left: 30
        }}
      >
        Import bag file
      </button>

      <DropDown
        id="topicSelect"
        options={bagTopics}
        onChange={selectTopic}
        instruction="Choose a Topic"
      />

      <button
        onClick={onClickCalibrate}
        style={{
          backgroundColor: "green",
          fontSize: "16px",
          padding: "10px 24px",
          borderRadius: "12px",
          color: "white",
          position: 'absolute',
          top: 530,
          left: 63
        }}
        >
          Calibrate!
      </button>

      <button
        onClick={() => {
          const fileData = JSON.stringify(saveFile, null, 4);
          const blob = new Blob([fileData], {type: "text/plain"});
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'filename.json';
          link.href = url;
          link.click();
        }}
        style={{
          position: 'absolute',
          top: 590,
          left: 79
        }}
        >
          Save Graph
      </button>
    </div>
  );
};

function mergeCalibrationOutputs(edgeList, calibrationOutput) {
  edgeList.forEach( edge => {
    calibrationOutput.forEach( output => {
      if( output.id == edge.id ) {
        edge.calibrationSucceeded = output.calibrationSucceeded;
        edge.matrix = output.matrix;
        edge.errScore = output.errScore;
      }
    });
  });
}

function returnMatrixPosition(node1, node2) {
  var slope = getSlope(node1.x, node1.y, node2.x, node2.y);
  var midpoint = getMidpoint(node1.x, node1.y, node2.x, node2.y);
  var position = midpoint;
  if( slope > 0 ) {
    position.x -= 40;
  }
  else if( slope < 0 ) {
    position.x += 40;
  }
  else {
    position.y += 40;
  }
  return position;
}

function getMidpoint(x1, y1, x2, y2) {
  var midpoint = new Object();
  midpoint.x=(x1+(x2-x1)*0.50);
  midpoint.y=(y1+(y2-y1)*0.50);
  return midpoint;
}

function getSlope(x1, y1, x2, y2) {
    var slope = (y2 - y1) / (x2 - x1);
    return slope;
}

// api.receive("bagfile", (res) => {
//   console.log("bagfile recieved");
//   topicList = JSON.parse(JSON.stringify(res));
//   console.log(topicList);

//   // TAIGA ADD TOPICS TO DROP DOWN MENU //

// }, []);

/*
api.receive("calibration", (res) => {
  console.log("calibration recieved");
  console.log(res);
}, []);
*/

function checkEdges(fromShapeId, eachCircle, edges) {
  for(var i = 0; i < edges.length; i++ ){
    if( (edges[i].sourceNodeID == fromShapeId || edges[i].sourceNodeID == eachCircle.id) &&
        (edges[i].targetNodeID == fromShapeId || edges[i].targetNodeID == eachCircle.id) ) {
      console.log(true);
      return true;
    }
  }
  console.log(false);
  return false;
}

export default CreateGraph;
