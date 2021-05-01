import React from "react";
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';
const {api} = window;

function CalibrationPanels(props) {
  return (
    <Group
      name="CalibrationPanels"
      draggable
      x={props.x}
      y={props.y}
      onDblClick={() => {
        navigator.clipboard.writeText(props.matrix);
        alert("Matrix Copied");
      }}
      visible={props.visible}
    >
      <Rect
        width={230}
        height={70}
        fill="orange"
        cornerRadius={10}
      />
      <Text
        fontSize={14}
        text={"test"}
        text={props.matrix}
      />
    </Group>
  )
}

//Event handler for clicking the calibrate button//
function onClickCalibrate(e, circles, connectors, setCalibrations, setPanelVisible, setSpinnerVisible) {
  //Create json graph variable to be calibrated in the backend//
  var fullGraph = {
    numberOfNodes: circles.length,
    numberOfEdges: connectors.length,
    nodes: circles,
    edges: connectors
  };

  // Bandaid fix for spinner enable
  setSpinnerVisible(true);

  // Bandaid fix for button action listener disable
  e.target.disabled = true;

  enableCalibrationListener(e, circles, connectors, setCalibrations, setPanelVisible, setSpinnerVisible);

  api.calibration("calibration", fullGraph);
}

//Listen for calibration channel to return a response//
function enableCalibrationListener(e, circles, connectors, setCalibrations, setPanelVisible, setSpinnerVisible) {
  api.receive("calibration", (res) => {
    console.log("calibration recieved");

    if(Array.isArray(res))
    {
      mergeCalibrationOutputs(connectors, res);

      connectors.forEach( connector => {
        var sourceNode, targetNode;
        circles.forEach( circle => {
          if( circle.key == connector.sourceNodeKey ) {
            sourceNode = circle;
          }
          else if( circle.key == connector.targetNodeKey ) {
            targetNode = circle;
          }
        });
        var position = returnMatrixPosition(sourceNode, targetNode);
        connector.x = position.x;
        connector.y = position.y;
      });

      //CHANGE Matrix Panels//
      console.log(circles);
      console.log(connectors);

      setCalibrations(connectors);

      setPanelVisible(true);
    }

    // Bandaid fix for spinner
    setSpinnerVisible(false);

    // Bandaid fix for action listener re-enable
    e.target.disabled = false;

  }, []);
}

//Takes in a list of edges and matches their id's to the id's of the edges in the calibration output//
function mergeCalibrationOutputs(edgeList, calibrationOutput) {
  edgeList.forEach( edge => {
    calibrationOutput.forEach( output => {
      if( output.key == edge.key ) {
        edge.calibrationSucceeded = output.calibrationSucceeded;
        edge.matrix = output.matrix;
        edge.errScore = output.errScore;
      }
    });
  });
}

//Calculates the position to render a calibration pannel to the GUI//
function returnMatrixPosition(node1, node2) {
  var midpoint = getMidpoint(node1.x, node1.y, node2.x, node2.y);
  var position = midpoint;

  //Render center of calibration panel to center of edge//
  //TO DO: Dynamically change position based on panel's width and height//
  position.x -= 100;
  position.y -= 35;
  return position;
}

//Calculates the midpoint between two points//
function getMidpoint(x1, y1, x2, y2) {
  var midpoint = new Object();
  midpoint.x=(x1+(x2-x1)*0.50);
  midpoint.y=(y1+(y2-y1)*0.50);
  return midpoint;
}

//Calculates the slope between two points//
//CURRENTLY NOT USED//
function getSlope(x1, y1, x2, y2) {
    var slope = (y2 - y1) / (x2 - x1);
    return slope;
}

export {CalibrationPanels, onClickCalibrate};
