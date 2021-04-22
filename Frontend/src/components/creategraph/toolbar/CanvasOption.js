import React from 'react';
import { Text, Label, Tag } from 'react-konva';

function CanvasOption(props) {

  return (
    <Label
      x={props.x}
      y={props.y}
      onClick={props.onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {/* body of button */}
      <Tag
        fill={"yellow"}
        shadowColor={'black'}
        shadowBlur={10}
        shadowOffsetX={10}
        shadowOffsetY={10}
        shadowOpacity={0.5}
        cornerRadius={10}
      />

      {/* button text */}
      <Text
        text={props.value}
        fontFamily={"Calibri"}
        fontSize={18}
        padding={5}
        fill={"black"}
      />
    </Label>
  )
}

// Change tag color and cursor when moused over.
const onMouseOver = (e) => {
  let tag = e.currentTarget.getTag();
  tag.setAttr('fill', 'red');

  // Change Cursor
  let stage = e.currentTarget.getStage();    
  stage.container().style.cursor = 'pointer';

  // Force draw/render scene
  tag.getLayer().draw();
}

// Change tag color and cursor when mouse leaves.
const onMouseOut = (e) => {
  // Change Color
  let tag = e.currentTarget.getTag();
  tag.setAttr('fill', 'yellow');

  // Change Cursor
  let stage = e.currentTarget.getStage();    
  stage.container().style.cursor = 'default';

  // Force draw/render scene
  tag.getLayer().draw();
}

export default CanvasOption;