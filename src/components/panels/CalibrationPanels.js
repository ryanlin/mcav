import React from "react";
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';

function CalibrationPanels(props) {


  return (
    <Group
      draggable
      x={props.x}
      y={props.y}
      onDblClick={() => {
        navigator.clipboard.writeText(props.matrix.join());
        alert("Matrix Copied");
      }}
      visible={props.visible}
    >
      <Rect
        width={80}
        height={100}
        fill="orange"
        cornerRadius={10}
      />
      <Text
        fontSize={14}
        text={props.matrix.join()}
      />
    </Group>

  )
}

export default CalibrationPanels; 