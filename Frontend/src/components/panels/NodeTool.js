import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';

const CIRCLE_RADIUS = 40;


function NodeTool(props) {
  return(
    <Group>
      <Text
        x={props.text_pos.x}
        y={props.text_pos.y}
        fontSize={20}
        text={props.text}
        fill="blue"
      />
      <Circle
        name={props.name}
        x={props.node_pos.x}
        y={props.node_pos.y}
        radius={CIRCLE_RADIUS}
        fill={props.fill}
        stroke={props.stroke}
        draggable

        onDragEnd={props.onDragEnd}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOUt}
      />
    </Group>
  );
}

export default NodeTool;