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
        //navigator.clipboard.writeText(props.matrix.join());
        navigator.clipboard.writeText(props.matrix);
        alert("Matrix Copied");
      }}
      visible={props.visible}
    >
      <Rect
        width={200}
        height={70}
        fill="orange"
        cornerRadius={10}
      />
      <Text
        fontSize={14}
        text={"test"}
        text={props.matrix}
        //test={props.matrix}
      />
    </Group>
  )
}

//Event handler for clicking the calibrate button//
function onClickCalibrate(circles, connectors, setCalibrations, setPanelVisible) {
  var fullGraph = {
    numberOfNodes: circles.length,
    numberOfEdges: connectors.length,
    nodes: circles,
    edges: connectors
  };

  enableCalibrationListener(circles, connectors, setCalibrations, setPanelVisible);

  //console.log(fullGraph);
  api.calibration("calibration", fullGraph);
}

//Listen for calibration channel to return a response//
function enableCalibrationListener(circles, connectors, setCalibrations, setPanelVisible) {
  api.receive("calibration", (res) => {
    console.log("calibration recieved");

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
  var slope = getSlope(node1.x, node1.y, node2.x, node2.y);
  var midpoint = getMidpoint(node1.x, node1.y, node2.x, node2.y);
  var position = midpoint;
  position.x -= 100;
  position.y -= 35;
  /*if( slope > 0 ) {
    position.x -= 40;
  }
  else if( slope < 0 ) {
    position.x += 40;
  }
  else {
    position.y += 40;
  }*/
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
function getSlope(x1, y1, x2, y2) {
    var slope = (y2 - y1) / (x2 - x1);
    return slope;
}

export {CalibrationPanels, onClickCalibrate};
