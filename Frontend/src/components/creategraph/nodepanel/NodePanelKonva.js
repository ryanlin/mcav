import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';


function NodePanelKonva(props) {
  return(
    <Group>  
      {/* NodePanel Section */}
      <Rect
        x={15}
        y={295}
        width={200}
        height={200}
        fill="gray"
        cornerRadius={10}
      />
      {/* NodePanel Header */}
      <Text
        x={85}
        y={270}
        fontSize={20}
        text="Panel"
        fill="black"
      />  
    </Group>
  );
}

export default NodePanelKonva;