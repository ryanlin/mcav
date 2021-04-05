import React, { useState, useRef } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';

const circ_radius = 40

const CreateGraph = () => {
  const [circles, setCircles] = useState([]);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [connectors, setConnectors] = React.useState([]);
  const [fromShapeId, setFromShapeId] = React.useState(null);
  const [displayID, setDisplayID] = React.useState("N/A");
  
  return (
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
            var layer = layerRef.current;
            layer.find('.deleteMe').destroy();
            layer.find('Arrow').destroy();
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
            setCircles((prevCircles) => [
              ...prevCircles,
              {
                name: "deleteMe",
                x: e.target.x(), 
                y: e.target.y(),
                id: new Date(),
                sensorType: "gps"
                /*onDblClick: (e) => {
                  e.target.destroy(); 
                }*/
              }
            ]);
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
            setCircles((prevCircles) => [
              ...prevCircles,
              {
                name: "deleteMe",
                x: e.target.x(), 
                y: e.target.y(),
                id: new Date(),
                sensorType: "lidar"
                /*onDblClick: (e) => {
                  e.target.destroy(); 
                }*/
              }
            ]);
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
            stroke={eachCircle.sensorType === "gps" ? "blue" : "red"}
            // draggable={true}
            /* onDblClick={(e) => {
              e.target.destroy();
              var stage = stageRef.current;
              var a = stage.findOne('Rect');
            }} */
            onClick={() => {
              if (fromShapeId) {
                if (fromShapeId == eachCircle.id) {
                  setFromShapeId(null);
                  setDisplayID("N/A");
                }
                else {
                  const newConnector = {
                    from: fromShapeId,
                    to: eachCircle.id,
                    id: connectors.length
                  };
                  setConnectors(connectors.concat([newConnector]));
                  setFromShapeId(null);
                }
              } else {
                setFromShapeId(eachCircle.id);
                console.log(eachCircle.id);
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
        
        {connectors.map(con => {
          const from = circles.find(s => s.id === con.from);
          const to = circles.find(s => s.id === con.to);

          return (
            <Arrow
              key={con.id}
              points={[from.x, from.y, to.x, to.y]}
              stroke="black"
            />
            
          );
        })}
      </Layer>
    </Stage>
  );
};

export default CreateGraph;