import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';


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

export default CanvasButton;