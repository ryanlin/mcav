import React, { useState, useRef, useForm } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;
import { CanvasButton, onMouseOverButton, onMouseOutButton, clearCanvas, clearEdges, NodeTool, addGPSCircle, addLidarCircle, onMouseOverNodeTool, onMouseOutNodeTool, CalibrationPanels, onClickCalibrate } from '../panels';

import { Toolbar, NodePanel, DropDown, GraphView } from '../creategraph';

const INITIAL_STATE = [];
const TEST_TYPES = ["pose", "point-cloud", "image"];

var topicList = [];

const CreateGraph = (props) => {
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

  /* temp debugging log */
  React.useEffect( () => {
    console.log("circles: ", circles, "\nconnectors: ", connectors);
  }, [circles, connectors]);

  React.useEffect( () => {
    console.log("selected: ", circles[fromShapeId] || null);
  }, [fromShapeId]);

  /* Bandaid List for DropDowns */
  const lists = [
    {
      key: 0,
      id: "topicSelect",
      options: bagTopics,
      instruction: "Select Topic",
      position: {top:480, left:30},
      property: "topic",
      onChange: (e) => setProperty(e, circles, fromShapeId, "topic")
    },
    {
      key: 0,
      id: "typeSelect",
      options: TEST_TYPES,
      instruction: "Select Type",
      position: {top:500, left:30},
      property: "type",
      onChange: (e) => setProperty(e, circles, fromShapeId, "type")
    }
  ];

  /*Handlers*/
  const handleFileUpload = e => {
    setFileState(e.target.files[0]);
    console.log(e.target.files[0].path);
    circles.forEach( circle => {
      circle.rosbagPath = e.target.files[0].path;
    });
    console.log(circles);
  }

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onMouseDown={(e) => checkDeselect(e, fromShapeId, setFromShapeId, circles)}
      >
        <Layer ref={layerRef}>
          {/*Toolbar*/}
          <Toolbar
            nodes={circles}
            edges={connectors}
            setNodes={setCircles}
            setEdges={setConnectors}
            setCalibrations={setCalibrations}
            rosbagPath={props.filePath}
          />

          <GraphView
            nodes={circles}
            edges={connectors}
            selectedNodeId={fromShapeId}
            setEdges={setConnectors}
            setSelectedNodeId={setFromShapeId}
          />

          {/*Panel*/}
          <NodePanel
            displayID={displayID}
          />

          {/* Render Calibration Panels*/}
          {calibrations.map((edge, index) => {

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
                key={index}
                x={edge.x}
                y={edge.y}
                matrix={stringMatrix}
                visible={panelVisible}
              />
            );
            //}
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

      {/* NodePanel Dropdowns */}
      {lists.map( (list, index) => (
        <DropDown
          key={index}
          id={list.id}
          options={list.options}
          position={list.position}
          instruction={list.instruction}
          property={list.property}
          onChange={list.onChange}
          selectedId={fromShapeId}
          nodes={circles}
        />
      ))}

      <button
        onClick={(e) => onClickCalibrate(circles, connectors, setCalibrations, setPanelVisible, setSaveFile)}
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

// If clicked on empty area on stage, deselect
const checkDeselect = (e, selectionId, setSelectionId, circles) => {
  if (e.target === e.target.getStage()) {
    setSelectionId(null);
  }
};

// Sets property of given node to event value
function  setProperty(e, nodes, selectionId, property) {
  let node = nodes.find( node => (node.id === selectionId) );
  node[property] = e.target.value;
}

export default CreateGraph;
