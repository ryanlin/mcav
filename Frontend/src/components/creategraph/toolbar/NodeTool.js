import React from 'react';
import { Text, Circle } from 'react-konva';

const CIRCLE_RADIUS = 40;

function NodeTool(props) {

  return (
    <React.Fragment>
      {/* header text */}
      <Text
        x={props.text_pos.x}
        y={props.text_pos.y}
        fontSize={20}
        text={props.text}
        fill="blue"
      />

      {/* draggable */}
      <Circle
        key={props.id}
        id={props.id}
        name={props.name}
        original_pos={props.circ_pos}
        x={props.circ_pos.x}
        y={props.circ_pos.y}
        radius={CIRCLE_RADIUS}
        fill={"green"}
        stroke={"purple"}
        draggable

        onDragEnd={props.onDragEnd}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      />
    </React.Fragment>
  )
}

// Change tag color and cursor when moused over.
const onMouseOver = (e) => {
  // Change Cursor
  let stage = e.currentTarget.getStage();
  stage.container().style.cursor = 'move';

  // Force draw/render scene
  e.currentTarget.getLayer().draw();
}

// Change tag color and cursor when mouse leaves.
const onMouseOut = (e) => {
  // Change Cursor
  let stage = e.currentTarget.getStage();
  stage.container().style.cursor = 'default';

  // Force draw/render scene
  e.currentTarget.getLayer().draw();
}

export default NodeTool;
