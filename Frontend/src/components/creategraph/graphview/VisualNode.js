import React from 'react';
import { Circle } from 'react-konva';

const INITIAL_COLOR = 'green';
const ONSELECT_COLOR = 'blue';

function VisualNode(props) {
  const [nodeColor, setNodeColor] = React.useState(INITIAL_COLOR);

  React.useEffect(() => {
    setNodeColor( props.isSelected ? ONSELECT_COLOR : INITIAL_COLOR);
    //console.log("useEffect: ", props.node, " - ", nodeColor);
  }, [props.isSelected]);

  if (!props.node) {
    return null;
  }

  return (
    <React.Fragment>
      <Circle
        key={props.id}
        x={props.node.x}
        y={props.node.y}

        width={50}
        height={50}
        cornerRadius={10}
        fill={nodeColor}
        // fill={props.isSelected ? ONSELECT_COLOR : INITIAL_COLOR}
        stroke={"purple"}

        onClick={props.onClick}
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
  stage.container().style.cursor = 'pointer';

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

export default VisualNode;