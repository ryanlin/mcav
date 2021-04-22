import React from 'react';
import { Arrow } from 'react-konva';


function VisualEdge(props) {
  // if (!props.edge || (props.nodes.length < 1) ) {
  //   return null;
  // }

  const nodes = props.nodes;
  const edge = props.edge;
  
  const sourceNode = nodes.find(s => s.id === edge.sourceNodeID);
  const targetNode = nodes.find(s => s.id === edge.targetNodeID);

  return (
    <React.Fragment>
      <Arrow
        key={props.edge.id}
        points={[sourceNode.x, sourceNode.y, targetNode.x, targetNode.y]}
        stroke="black"
      />
    </React.Fragment>
  )
}

export default VisualEdge;