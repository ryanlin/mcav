import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;

function CanvasButton(props) {
  return(
    <Label
      x={props.x}
      y={props.y}
      onClick={props.onClick}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
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
        text={props.value}
        fontFamily={"Calibri"}
        fontSize={18}
        padding={5}
        fill={"black"}
      />
    </Label>
  );
}

function onMouseOverButton(e, color, stageRef, layerRef) {
  var stage = stageRef.current;
  stage.container().style.cursor = 'pointer';
  var layer = layerRef.current;
  var tag = e.currentTarget.getChildren(function(node){
    return node.getClassName() === 'Tag';
  })
  tag[0].setAttr('fill', color);
  layer.draw();
}

function onMouseOutButton(e, color, stageRef, layerRef) {
  var stage = stageRef.current;
  stage.container().style.cursor = 'default';
  var layer = layerRef.current;
  var tag = e.currentTarget.getChildren(function(node){
    return node.getClassName() === 'Tag';
  })
  tag[0].setAttr('fill', color);
  layer.draw();
}

function clearCanvas(e, setCircles, setConnectors, setCalibrations, fromShapeId, displayID, layerRef) {
  var layer = layerRef.current;

  // Delete all arrows and circles
  layer.find('Arrow').destroy();
  layer.find('.deleteMe').destroy();
  layer.find('.CalibrationPanels').destroy();

  // Set states to empty
  setConnectors([]);
  setCircles([]);
  setCalibrations([]);

  // Clear arrays in preload.js
  api.clearGraph("clearGraph");

  // Set selected nodes to empty
  fromShapeId = null;
  displayID = "N/A";

  // Force rerender
  layer.draw();
}

function clearEdges(e, setConnectors, layerRef) {
  var layer = layerRef.current;

  // Delete all edges
  layer.find('Arrow').destroy();

  // Delete edge arrays in preload.js
  api.clearEdges("clearEdges");

  // Set states to empty
  setConnectors([]);

  // Force rerender
  layer.draw();
}

export {CanvasButton, onMouseOverButton, onMouseOutButton, clearCanvas, clearEdges};
