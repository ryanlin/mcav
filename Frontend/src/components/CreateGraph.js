import React, { useState, useRef, useForm } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;
import { DropDown, CalibrationPanels } from './panels';

const TEST_CALIBRATIONS = [];

const INITIAL_STATE = [];
const INITIAL_CALIBRATIONS = {
  "edges": []
};

const circ_radius = 40;

var topicList = [];

const CreateGraph = () => {
  const [bagTopics, setBagTopics] = useState(INITIAL_STATE);
  const [fileState, setFileState] = useState("null");
  const [topic, setTopic] = useState("null");

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  var [circles, setCircles] = useState(INITIAL_STATE);
  var [connectors, setConnectors] = React.useState(INITIAL_STATE);
  var [fromShapeId, setFromShapeId] = React.useState(null);
  var [displayID, setDisplayID] = React.useState("N/A");
  var [saveFile, setSaveFile] = useState("null");
  const [calibrations, setCalibrations] = useState(TEST_CALIBRATIONS);
  var [panelVisible, setPanelVisible] = useState(false);

  // Handlers
  const handleFileUpload = e => {
    setFileState(e.target.files[0]);
    console.log(e.target.files[0].path);
    circles.forEach( circle => {
      circle.rosbagPath = e.target.files[0].path;
    });
    console.log(circles);
  };

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
      console.log(connectors);

      connectors.forEach( connector => {
        console.log(connector);
        var sourceNode, targetNode;
        circles.forEach( circle => {
          console.log(circle);
          if( circle.id == connector.sourceNodeID ) {
            sourceNode = circle;
            console.log(sourceNode);
          }
          else if( circle.id == connector.targetNodeID ) {
            targetNode = circle;
            console.log(targetNode);
          }
        });
        var position = returnMatrixPosition(sourceNode, targetNode);
        console.log(position);
        connector.x = position.x;
        connector.y = position.y;
      });

      //CHANGE Matrix Panels//
      console.log(connectors);

      setCalibrations(connectors);

      setPanelVisible(true);
      /*
      connectors.forEach( connector => {
        const newCalibration = {
          x: connector.x,
          y: connector.y,
          matrix: connector.matrix,
          visible: true
        };
        setCalibrations(calibrations.concat([newCalibration]));
        // <CalibrationPanels
        //   x={edge.x}
        //   y={edge.y}
        //   matrix={edge.matrix}
        //   visible={panelVisible}
        // />
      });
      console.log(calibrations);
      console.log(connectors);
      */

    }, []);
    //console.log(fullGraph);
    api.calibration("calibration", fullGraph);
    setSaveFile(fullGraph);
  }

  const selectTopic = (e) => {
    setTopic(e.target.value);
  }

  // API Receivers:
  /*api.receive("bagfile", (res) => {
    console.log("bagfile recieved");
    topicList = JSON.parse(JSON.stringify(res));
    console.log(topicList);

    setBagTopics(topicList);
  }, []);*/

/*
  api.receive("calibration", (res) => {
    console.log("calibration recieved");
    console.log(res);
  }, []);
*/

  return (
    <div>
      <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
        <Layer ref={layerRef}>
          <Rect
            x={15}
            y={35}
            width={200}
            height={300}
            fill="gray"
            cornerRadius={10}
          />
          <Rect
            x={15}
            y={375}
            width={200}
            height={250}
            fill="gray"
            cornerRadius={10}
          />
          <Label
            x={65}
            y={50}
            onClick={(e) => {
              console.log(JSON.stringify(circles));
              var layer = layerRef.current;
              layer.find('Arrow').destroy();
              layer.find('.deleteMe').destroy();
              setConnectors([]);
              setCircles([]);
              api.clearGraph("clearGraph");
              fromShapeId = null;
              displayID = "N/A";
              layer.draw();
            }}
            onMouseOver={(e) => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'pointer';
              var layer = layerRef.current;
              var tag = e.currentTarget.getChildren(function(node){
                return node.getClassName() === 'Tag';
              })
              tag[0].setAttr('fill', 'red');
              layer.draw();
            }}
            onMouseOut={(e) => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'default';
              var layer = layerRef.current;
              var tag = e.currentTarget.getChildren(function(node){
                return node.getClassName() === 'Tag';
              })
              tag[0].setAttr('fill', 'yellow');
              layer.draw();
            }}
          >
            <Tag
              fill={"yellow"}
              shadowColor={'black'}
              shadowBlur={10}
              shadowOffsetX={10}
              shadowOffsetY={10}
              shadowOpacity={0.5}
              cornerRadius={10}
            />
            <Text
              text={"Clear Canvas"}
              fontFamily={"Calibri"}
              fontSize={18}
              padding={5}
              fill={"black"}
            />
          </Label>
          <Label
            x={70}
            y={95}
            onClick={(e) => {
              var layer = layerRef.current;
              layer.find('Arrow').destroy();
              api.clearEdges("clearEdges");
              setConnectors([]);
              layer.draw();
            }}
            onMouseOver={(e) => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'pointer';
              var layer = layerRef.current;
              var tag = e.currentTarget.getChildren(function(node){
                return node.getClassName() === 'Tag';
              })
              tag[0].setAttr('fill', 'red');
              layer.draw();
            }}
            onMouseOut={(e) => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'default';
              var layer = layerRef.current;
              var tag = e.currentTarget.getChildren(function(node){
                return node.getClassName() === 'Tag';
              })
              tag[0].setAttr('fill', 'yellow');
              layer.draw();
            }}
          >
            <Tag
              fill={"yellow"}
              shadowColor={'black'}
              shadowBlur={10}
              shadowOffsetX={10}
              shadowOffsetY={10}
              shadowOpacity={0.5}
              cornerRadius={10}
            />
            <Text
              text={"Clear Edges"}
              fontFamily={"Calibri"}
              fontSize={18}
              padding={5}
              fill={"black"}
            />
          </Label>

          <Circle
            name="draggableCircle"
            x={140}
            y={180}
            radius={circ_radius}
            fill="green"
            stroke="blue"
            draggable
            onDragEnd={(e) => {
              const newCircle = {
                name: "deleteMe",
                x: e.target.x(),
                y: e.target.y(),
                id: circles.length,
                sensorType: "gps",
                type: "pose",
                topic: "null"
              };
              setCircles(circles.concat([newCircle]));
              console.log(circles.length);
              var stage = stageRef.current;
              var draggableCircle = stage.findOne(".draggableCircle");
              draggableCircle.position({ x: 140, y: 180 });
            }}
            onMouseOver={() => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'move';
            }}
            onMouseOut={() => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'default';
            }}
          />

          <Circle
            name="draggableCircle2"
            x={140}
            y={285}
            radius={circ_radius}
            fill="green"
            stroke="red"
            draggable
            onDragEnd={(e) => {
                const newCircle = {
                  name: "deleteMe",
                  x: e.target.x(),
                  y: e.target.y(),
                  id: circles.length,
                  type: "pose",
                  sensorType: "lidar",
                  type: "pose",
                  topic: "null"
                };
              setCircles(circles.concat([newCircle]));
              var stage = stageRef.current;
              var draggableCircle = stage.findOne(".draggableCircle2");
              draggableCircle.position({ x: 140, y: 285 });
            }}
            onMouseOver={() => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'move';
            }}
            onMouseOut={() => {
              var stage = stageRef.current;
              stage.container().style.cursor = 'default';
            }}
          />

          <Text
            x={80}
            y={10}
            fontSize={20}
            text="Toolbar"
            fill="black"
          />

          <Text
            x={80}
            y={350}
            fontSize={20}
            text="Panel"
            fill="black"
          />

          <Text
            x={30}
            y={395}
            fontSize={20}
            text={"Sensor Type: " + displayID}
            fill="black"
          />

          <Text
            x={35}
            y={170}
            fontSize={20}
            text={"GPS"}
            fill="blue"
          />

          <Text
            x={30}
            y={275}
            fontSize={20}
            text={"LIDAR"}
            fill="red"
          />

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
              // draggable={true}
              /* onDblClick={(e) => {
                e.target.destroy();
                var stage = stageRef.current;
                var a = stage.findOne('Rect');
              }} */
              onClick={() => {
                if(fromShapeId != null) {
                  if(fromShapeId == eachCircle.id) {
                    setFromShapeId(null);
                    setDisplayID("N/A");
                    eachCircle.topic = topic;
                    document.getElementById("topicSelect").selectedIndex = 0;
                  }
                  else if( !checkEdges(fromShapeId, eachCircle, connectors) ) {
                    const newConnector = {
                      id: connectors.length,
                      sourceNodeID: fromShapeId,
                      targetNodeID: eachCircle.id
                    };
                    setConnectors(connectors.concat([newConnector]));
                    setFromShapeId(null);
                  }
                } else {
                  setTopic(eachCircle.topic);
                  var i;
                  var a = document.getElementById("topicSelect");
                  for(i = 0; i < a.options.length; i++) {
                    if(a.options[i].label == eachCircle.topic) {
                      a.selectedIndex = i;
                    }
                  }
                  setFromShapeId(eachCircle.id);
                  setDisplayID(eachCircle.sensorType);
                  //console.log(JSON.stringify(circles));
                  api.test("test", circles, connectors);
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
          console.log(fileState.path);
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
  console.log(edgeList);
  console.log(calibrationOutput);
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

api.receive("clear", (res) => {
  console.log('recieved');
  console.log(res);
}, []);

function returnMatrixPosition(node1, node2) {
  console.log(node1);
  console.log(node2);
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
  console.log(position);
  return position;
}

function getMidpoint(x1, y1, x2, y2) {
  var midpoint = new Object();
  midpoint.x=(x1+(x2-x1)*0.50);
  midpoint.y=(y1+(y2-y1)*0.50);
  console.log(midpoint);
  return midpoint;
}

function getSlope(x1, y1, x2, y2) {
    var slope = (y2 - y1) / (x2 - x1);
    console.log(slope);
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
