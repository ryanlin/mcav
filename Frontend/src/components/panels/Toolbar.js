import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';


function Toolbar(props) {
  
  return(
    <Group>
      {/* Toolbar Header */}
      <Text
        x={80}
        y={10}
        fontSize={20}
        text="Toolbar"
        fill="black"
      />

      {/* Toolbar Section */}
      <Rect
        x={15}
        y={35}
        width={200}
        height={300}
        fill="gray"
        cornerRadius={10}
      />
    </Group>
  );
}

export default Toolbar;