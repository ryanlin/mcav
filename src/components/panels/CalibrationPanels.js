import React from "react";
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';

function CalibrationPanels(props) {


  return (
    <Group
      draggable
    >
      <Rect
        x={285}
        y={35}
        width={80}
        height={100}
        fill="orange"
        cornerRadius={10}
      />
      <Text
        x={285}
        y={35}
        fontSize={14}
        text={props.matrix.join()}
      />
    </Group>

  )
}

export default CalibrationPanels; 