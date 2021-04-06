import React, { useState, useRef } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';

const circ_radius = 40

const CreateGraph = () => {
  var [circles, setCircles] = useState([]);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  var [connectors, setConnectors] = React.useState([]);
  var [fromShapeId, setFromShapeId] = React.useState(null);
  var [displayID, setDisplayID] = React.useState("N/A");
  const [topic, setTopic] = useState("null");

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
              window.api.clearGraph("clearGraph");
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
              window.api.clearEdges("clearEdges");
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
                sensorTopic: "null"
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
                  sensorTopic: "null"
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
              sensorTopic={eachCircle.sensorTopic}
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
                    eachCircle.sensorTopic = topic;
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
                  setTopic(eachCircle.sensorTopic);
                  var i;
                  var a = document.getElementById("topicSelect");
                  for(i = 0; i < a.options.length; i++) {
                    if(a.options[i].label == eachCircle.sensorTopic) {
                      a.selectedIndex = i;
                    }
                  }
                  setFromShapeId(eachCircle.id);
                  setDisplayID(eachCircle.sensorType);
                  //console.log(JSON.stringify(circles));
                  window.api.test("test", circles, connectors);
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
      <select
        id={"topicSelect"}
        onChange = {(e) => {
          setTopic(e.target.value);
        }}
        style={{
          position: 'absolute',
          top: 440,
          left: 30
        }}
      >
        <option>Choose a Topic</option>
        <option>Topic1</option>
        <option>Topic2</option>
      </select>
    </div>
  );
};

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
