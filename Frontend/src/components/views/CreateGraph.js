import React, { useState, useRef, useForm } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
// import Spinner from 'react-bootstrap/Spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';

const {api} = window;

import { CanvasButton, onMouseOverButton, onMouseOutButton, clearCanvas, clearEdges, NodeTool, addGPSCircle, addLidarCircle, onMouseOverNodeTool, onMouseOutNodeTool, CalibrationPanels, onClickCalibrate } from '../panels';

import { Toolbar, NodePanelKonva, NodePanel, DropDown, GraphView } from '../creategraph';

const INITIAL_STATE = [];
const INITIAL_GRAPH = {
  numberOfNodes: 0,
  numberOfEdges: 0,
  nodes: [],
  edges: []
}
const TEST_TYPES = ["pose", "point-cloud", "image"];

var topicList = [];

const CreateGraph = (props) => {
  const [calibrations, setCalibrations] = useState(INITIAL_STATE);
  const [bagTopics, setBagTopics] = useState(INITIAL_STATE);
  const [fileState, setFileState] = useState(null);
  const [topic, setTopic] = useState("null");
  const [calibrationGraph, setCalibrationGraph] = useState(INITIAL_GRAPH);

  const stageRef = useRef(null);
  const layerRef = useRef(null);

  var [panelVisible, setPanelVisible] = useState(false);
  var [circles, setCircles] = useState(INITIAL_STATE);
  var [connectors, setConnectors] = React.useState(INITIAL_STATE);
  var [fromShapeId, setFromShapeId] = React.useState(null);

  /* temp bandaids */
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [importSpinnerVisible, setImportSpinnerVisible] = useState(false);
  const [importDisabled, setImportDisabled] = useState(false);

  /* When nodes or edges change, log them and set calibrationGraph */
  React.useEffect( () => {
    console.log("circles: ", circles, "\nconnectors: ", connectors);
    setCalibrationGraph({
      numberOfNodes: circles.length,
      numberOfEdges: connectors.length,
      nodes: circles,
      edges: connectors
    });
  }, [circles, connectors]);

  React.useEffect( () => {
    console.log("selected: ", circles[fromShapeId] || null);
  }, [fromShapeId]);

  React.useEffect( () => {
    console.log("calibrations: ", calibrations || null);
  }, [calibrations]);

  React.useEffect( () => {
    console.log("bagTopics: ", bagTopics || null);
  }, [bagTopics]);

  /* Bandaid List for DropDowns */
  const lists = [
    {
      key: 0,
      id: "topicSelect",
      options: bagTopics,
      instruction: "Select Topic",
      position: {top:460, left:30},
      property: "topic",
      onChange: (e) => setProperty(e, circles, fromShapeId, "topic")
    },
    {
      key: 0,
      id: "typeSelect",
      options: TEST_TYPES,
      instruction: "Select Type",
      position: {top:490, left:30},
      property: "type",
      onChange: (e) => setProperty(e, circles, fromShapeId, "type")
    }
  ];

  // Sets property of given node to value sent in event
  function  setProperty(e, nodes, selectionId, property) {
    let node = nodes.find( node => (node.id === selectionId) );
    node[property] = e.target.value;
    if(property === "topic") {
      node["rosbagPath"] = fileState.path;
    }
  }

  /*Handlers*/
  const handleFileUpload = e => {
    // upload files
    setFileState(e.target.files[0]);

    // console.log(e.target.files[0].path);
    // console.log(circles);
  }

  // Sets receive for graph from preload/ipcRenderer
  React.useEffect( () => {
    api.receive("loadGraph", (res) => {
      console.log("graph file received");
      console.log(res);

      setCircles(res.nodes);
      setConnectors(res.edges);
      setCalibrations(res.edges);

      // Get topics
      const bagPath = res.nodes[0].rosbagPath;
      setFileState({
        path: bagPath
      })
      console.log(bagPath);      
      api.rosbag("rosbag", bagPath);
    });
  }, []);

  // Sets receive for topics from preload/ipcRenderer
  React.useEffect( () => {
    api.receive("bagfile", (res) => {
      console.log("topics received");

      topicList = JSON.parse(JSON.stringify(res));

      if(Array.isArray(topicList))
      {
        setBagTopics(topicList);
      } else {
        setFileState({
          path: null
        })
        const nodes = circles;
        nodes.forEach( (node) => {
          node.rosbagPath = null;
        });
      }

      // bandaid reenable Import bag button
      setImportDisabled(false);

      // bandaid spinner stuff
      setImportSpinnerVisible(false);
    });
  }, []);


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
            rosbagPath={fileState ? fileState.path : null}
          />

          {/* Graph Canvas */}
          <GraphView
            nodes={circles}
            edges={connectors}
            selectedNodeId={fromShapeId}
            setEdges={setConnectors}
            setSelectedNodeId={setFromShapeId}
          />

          {/*Konva Panel*/}
          <NodePanelKonva
          />

          {/* Render Calibration Panels*/}
          {calibrations.map((edge, index) => {
            if(spinnerVisible){
              setSpinnerVisible(false);
            }
            var newMatrix = [];
            var stringPanel = "  ";
            if( edge.matrix != null ) {
              newMatrix = edge.matrix;
              for( var i = 1; i <= newMatrix.length; i++ ) {

                  var floatStr = ((Math.round(newMatrix[i-1] * 1000.0) / 1000.0).toFixed(3)).toString();
                  if(!floatStr.includes("-"))
                  {
                    floatStr = " " + floatStr;
                  }
                  stringPanel += floatStr;

                  if( i % 4 == 0 ) {
                    stringPanel += ",\n  ";
                  }
                  else if( i != newMatrix.length )
                  {
                    stringPanel += ", ";
                  }
              }
              stringPanel += " Error score: " + (Math.round(edge.errScore * Math.pow(10.0, 14.0)) / Math.pow(10.0, 14.0)).toString();
            }

            return (
            //if(edge.matrix != null) {
            //var newMatrix = edge.matrix ? edge.matrix : [];
              <CalibrationPanels
                key={index}
                x={edge.x}
                y={edge.y}
                matrix={stringPanel}
                //visible={panelVisible}
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
          top: 400,
          left: 30
        }}
        onChange={handleFileUpload}
        accept=".bag"
      >
      </input>

      <button
        id={"import-bag-button"}
        onClick={(e) => {
          console.log("rosbag clicked");
          console.log(fileState);
          if(fileState !== null) {
            // bandaid disable button
            setImportDisabled(true);
            setImportSpinnerVisible(true);
            api.rosbag("rosbag", fileState.path);
          }    
        }}
        style={{
          position: 'absolute',
          top: 430,
          left: 30
        }}
        disabled={importDisabled}
      >
        Import bag file
        <Loader
          id="calibrate-spinner"
          type="TailSpin"
          color="#00BFFF"
          height={12}
          width={12}
          timeout={2000000} // 20000 seconds
          visible={importSpinnerVisible}
          style={{
            display: "inline"
          }}
        />
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
        onClick={ (e) => {
          onClickCalibrate(e, circles, connectors, setCalibrations, setPanelVisible, setSpinnerVisible)
        }}
        style={{
          backgroundColor: "green",
          fontSize: "16px",
          padding: "10px 24px",
          borderRadius: "12px",
          color: "white",
          position: 'absolute',
          top: 525,
          left: 57
        }}
        >
          Calibrate!
          <Loader
            id="calibrate-spinner"
            type="TailSpin"
            color="#FFFFFF"
            height={12}
            width={12}
            timeout={2000000} // 2000 seconds
            visible={spinnerVisible}
            style={{
              display: "inline"
            }}
          />
      </button>

      {/* <button
        onClick={() => {
          const fileData = JSON.stringify(calibrationGraph, null, 4);
          const blob = new Blob([fileData], {type: "text/plain"});
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'filename.json';
          link.href = url;
          link.click();
        }}
        style={{
          position: 'absolute',
          top: 677,
          left: 79
        }}
        >
          Save Graph
      </button> */}
    </div>
  );
};

// If clicked on empty area on stage, deselect
const checkDeselect = (e, selectionId, setSelectionId, circles) => {
  if (e.target === e.target.getStage()) {
    setSelectionId(null);
  }
};


export default CreateGraph;
