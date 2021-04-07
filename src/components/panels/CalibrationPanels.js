import React from 'react';
import { useState } from 'react';
import { Group, Layer, Rect } from 'react-konva';

const INITIAL_PANEL_PROPS = [
  {
    id:0
  },
  {
    id:2
  }
]

function CalibrationPanels(props) {
  const calibrations = props.calibrations
  const edges = props.edges

  const CalibrationPanel = (props) => {
    return(
      <Group>
        <Rect
          x={props.x}
          y={props.y}
        />
        <Text>{props.x}</Text>
      </Group>
    )
  };
  
  // console.log(calibrations)
  // console.log(edges)
  return (
    <Layer>
      {
        calibrations.edges.map( (calibedge) => (
          <CalibrationPanel
            x={edges[calibedge.id].sourceNode}
            y={edges[calibedge.id].sourceNode}
          />
        ))
      }
    </Layer>
  )
}


export default CalibrationPanels;