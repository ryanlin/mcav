import React, { useState, useRef, useForm } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;
import * as actionListeners from "../functions.js";
import { DropDown, CalibrationPanels } from './panels';

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

  // Handlers
  const handleFileUpload = e => {
    setFileState(e.target.files[0]);
  };

  const onClickCalibrate = () => {
    var fullGraph = {
      numberOfNodes: circles.length,
      numberOfEdges: connectors.length,
      nodes: circles,
      edges: connectors
    };
    console.log(fullGraph);
    // api.calibration("calibration", fullGraph);
  }

  const selectTopic = (e) => {
    setTopic(e.target.value);
  }

  // API Receivers:
  api.receive("bagfile", (res) => {
    console.log("bagfile recieved");
    topicList = JSON.parse(JSON.stringify(res));
    console.log(topicList);

    setBagTopics(topicList);
  }, []);

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
                  sensorType: "lidar",
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
            y={400}
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
                      sourceNodeId: fromShapeId,
                      targetNodeId: eachCircle.id
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
            const sourceNodeId = circles.find(s => s.id === con.sourceNodeId);
            const targetNodeId = circles.find(s => s.id === con.targetNodeId);

            return (
              <Arrow
                key={con.id}
                points={[sourceNodeId.x, sourceNodeId.y, targetNodeId.x, targetNodeId.y]}
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
          top: 570,
          left: 65
        }}
        >
          Calibrate!
      </button>      
    </div>
  );
};

api.receive("clear", (res) => {
  console.log('recieved');
  console.log(res);
}, []);

// api.receive("bagfile", (res) => {
//   console.log("bagfile recieved");
//   topicList = JSON.parse(JSON.stringify(res));
//   console.log(topicList);

//   // TAIGA ADD TOPICS TO DROP DOWN MENU //

// }, []);

api.receive("calibration", (res) => {
  console.log("calibration recieved");
  console.log(res);
}, []);

function checkEdges(fromShapeId, eachCircle, edges) {
  for(var i = 0; i < edges.length; i++ ){
    if( (edges[i].sourceNodeId == fromShapeId || edges[i].sourceNodeId == eachCircle.id) &&
        (edges[i].targetNodeId == fromShapeId || edges[i].targetNodeId == eachCircle.id) ) {
      console.log(true);
      return true;
    }
  }
  console.log(false);
  return false;
}

export default CreateGraph;
