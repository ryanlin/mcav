import React from 'react';
import { VisualNode, VisualEdge } from '.';

function GraphView(props) {
  return (
    <React.Fragment>
      {/* Render Nodes as Circles */}
      {props.nodes.map( (node, index) => (
        <VisualNode
          key={index}
          node={node}
          isSelected={node.id === props.selectedNodeId}
          onClick={
            (e) => determineSelection(e, props.selectedNodeId,
            props.setSelectedNodeId, props.edges, props.setEdges, node.id, node)
          }
        />
      ))}

      {/* Render Edges as Arrows*/}
      {props.edges.map( (edge, index) => (
        <VisualEdge
          key={index}
          edge={edge}
          nodes={props.nodes}
        />
      ))}

    </React.Fragment>
  )
}

// Determine what to do onClick based on selection status
function determineSelection(e, selectionId, setSelectionId, edges, setEdges, clickedId, clickedNode)
{
  // Is something already selected?
  if(selectionId !== null) {
    if(selectionId === clickedId) {
      // If selected node is same as clicked node, deselect
      setSelectionId(null);
    }
    else if( !checkEdges(selectionId, clickedId, edges) ){
      // If selected node is different from clicked node,
      // and if no edge between the two nodes, create an edge
      const newEdge = {
        key: edges.length,
        id: "edge" + edges.length,
        sourceNodeKey: selectionId,
        targetNodeKey: clickedId
      };
      setEdges(edges.concat([newEdge]));
      setSelectionId(null);
    }
    else {
      // Set clicked node as selected node
      setSelectionId(clickedId);
    }
  }
  else {
    // Set clicked node as selected node
    setSelectionId(clickedId)
  }
}

// Checks if an edge between two nodes already exists
function checkEdges(sourceId, targetId, edges) {
  const duplicate = edges.find( s => (
    ( (s.sourceNodeKey === sourceId) || (s.sourceNodeKey === targetId) ) &&
    ( (s.targetNodeKey === sourceId) || (s.targetNodeKey === targetId) )
  ))

  if (duplicate) {
    return true;
  }

  return false;
}

export default GraphView;