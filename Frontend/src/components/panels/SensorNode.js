import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';


function SensorNode(props) {
  return(
    <Group>
      <Text
        x={35}
        y={170}
        fontSize={20}
        text={"GPS"}
        fill="blue"
      />
    </Group>
  );
}

export default SensorNode;