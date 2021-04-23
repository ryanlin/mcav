import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';

const CIRCLE_RADIUS = 40;

function NodeTool(props) {
  return(
    <Group>
      <Circle
        name={props.name}
        x={props.node_pos.x}
        y={props.node_pos.y}
        radius={CIRCLE_RADIUS}
        fill={props.fill}
        stroke={props.stroke}
        draggable

        onDragEnd={props.onDragEnd}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOUt}
      />
    </Group>
  );
}

function addGPSCircle(e, circles, setCircles, layerRef){
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

function addLidarCircle(e, circles, setCircles, layerRef) {
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

function onMouseOverNodeTool(e, stageRef) {
  var stage = stageRef.current;
  stage.container().style.cursor = 'move';
}

function onMouseOutNodeTool(e, stageRef) {
  var stage = stageRef.current;
  stage.container().style.cursor = 'default';
}

export {NodeTool, addGPSCircle, addLidarCircle, onMouseOverNodeTool, onMouseOutNodeTool};
