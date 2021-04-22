import React from 'react';
import { Text, Rect } from 'react-konva';
import { CanvasOption, NodeTool } from '.';

//const {api} = window;

function Toolbar(props) {
  const canvas_options = [
    {
      key: 0,
      id: "clear-canvas-option",
      x: 65,
      y: 50,
      value: "Clear Canvas",
      onClick: (e) => clearCanvas(e, props.setNodes, props.setEdges, props.setCalibrations)
    },
    {
      key: 1,
      id: "clear-edges-option",
      x: 70,
      y: 95,
      value: "Clear Edges",
      onClick: (e) => clearEdges(e, props.setEdges)
    }
  ];

  const node_tools = [
    {
      key: 0,
      id: "node_tool",
      name: "draggableCircle",
      text: "GPS",
      text_pos: {x:35, y:170},
      circ_pos: {x:140, y:180},
      onDragEnd: (e) => addNode(e, props.nodes, props.setNodes)
    }
  ];

  return (
    <React.Fragment>
      {/* Toolbar Header */}
      <Text
        x={80}
        y={10}
        fontSize={20}
        text="Toolbar"
        fill="black"
      />

      {/* Toolbar Panel */}
      <Rect
        x={15}
        y={35}
        width={200}
        height={300}
        fill="gray"
        cornerRadius={10}
      />

      {/* CanvasButtons */}
      {canvas_options.map( (option) => (
        <CanvasOption
          key={option.key}
          id={option.id}
          x={option.x}
          y={option.y}
          value={option.value}
          onClick={option.onClick}
        />
      ))}


      {/* NodeTools */}
      {node_tools.map( (node, index) => (
        <NodeTool
          key={index}
          id={index}
          name={node.name}
          text={node.text}
          text_pos={node.text_pos}
          circ_pos={node.circ_pos}
          onDragEnd={node.onDragEnd}
        />
      ))}
    </React.Fragment>
  )
}

// Adds node to nodes hook
function addNode(e, nodes, setNodes) {
  // New circle properties : dictionary
  const newCircle = {
    key: nodes.length,
    id: nodes.length,
    x: e ? e.target.x() : 50,
    y: e ? e.target.y() : 50,
    type: "null",
    topic: "null"
  };

  // Add circle to circles hook
  setNodes(nodes.concat([newCircle]));

  // Reset node Tool position
  const tool = e.currentTarget;
  tool.position(tool.getAttr("original_pos"));
}

// Clears Canvas
function clearCanvas(e, setNodes, setEdges, setCalibrations) {
  const empty = [];
  setEdges(empty);
  setNodes(empty);
  setCalibrations(empty);

  // Clear arrays in preload.js
  api.clearGraph("clearGraph");

  // Force draw/render scene
  e.target.getLayer().draw();
}

// Clears Edges
function clearEdges(e, setEdges) {
  const empty = [];
  setEdges(empty);

  // Delete edge arrays in preload.js
  //api.clearEdges("clearEdges");

  // Force draw/render scene
  e.target.getLayer().draw();
}

export default Toolbar;
