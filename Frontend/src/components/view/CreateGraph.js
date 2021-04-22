import React, { useState, useRef, useForm } from 'react';
import { render } from 'react-dom';
import {Rect, Stage, Layer, Text, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;
import { NodePanel, CanvasButton, onMouseOverButton, onMouseOutButton, clearCanvas, clearEdges, NodeTool, addGPSCircle, addLidarCircle, onMouseOverNodeTool, onMouseOutNodeTool, DropDown, selectTopic, CalibrationPanels, onClickCalibrate } from '../panels';

import { Toolbar } from '../creategraph';

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

  /*Handlers*/
  const handleFileUpload = e => {
    setFileState(e.target.files[0]);
    console.log(e.target.files[0].path);
    circles.forEach( circle => {
      circle.rosbagPath = e.target.files[0].path;
    });
    console.log(circles);
  }

  /*Helper Functions*/
  // Checks if an edge between two nodes is already created//
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

  return (
    <div>
      <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
        <Layer ref={layerRef}>
          {/*Toolbar*/}
          <Toolbar
            nodes={circles}
            edges={connectors}
            setNodes={setCircles}
            setEdges={setConnectors}
          />

          {/*Panel*/}
          <NodePanel
            displayID={displayID}
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
                  setDisplayID(eachCircle.type);
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
        onChange={(e) => selectTopic(e, setTopic)}
        instruction="Choose a Topic"
      />

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

export default CreateGraph;
