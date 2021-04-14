import React from 'react';
import { Rect, Text, Stage, Layer, Circle, Arrow, Group, Line, Label, Tag} from 'react-konva';


function NodePanel(props) {
  return(
    <Group>  
      {/* NodePanel Section */}
      <Rect
        x={15}
        y={375}
        width={200}
        height={250}
        fill="gray"
        cornerRadius={10}
      />
      {/* NodePanel Header */}
      <Text
        x={80}
        y={350}
        fontSize={20}
        text="Panel"
        fill="black"
      />  
      {/* Sensor Type Text */}
      <Text
        x={30}
        y={395}
        fontSize={20}
        text={"Sensor Type: " + props.displayID}
        fill="black"
      />  
    </Group>
  );
}

export default NodePanel;