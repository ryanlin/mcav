import React from 'react';

const INIT_IDX = 0; // initial index

function DropDown(props) {
  const [selectedIndex, setSelectedIndex] = React.useState(INIT_IDX);
  const options = props.options;  // options in dropdown menu : array

  // When props.selectedId changes, selectedIndex is changed
  React.useEffect(() => {
    const select = document.getElementById(props.id); // the select element; 
    const node = props.nodes.find(n=>(n.id===props.selectedId)); //selected Node
    const node_val = (node) ? node[props.property] : null;  // e.g node.topic
    const option_index = options.findIndex(option=>(option === node_val));
    const curr_index = (option_index >= INIT_IDX) ? option_index+1 : INIT_IDX; 

    // console.log("options: ", options);
    // console.log("node_val:",node_val, "option_index: ", option_index);
    // console.log("curr: ", curr_index);

    // Set selected index to show
    setSelectedIndex(curr_index);
    if ( select !== null ) {
      select.selectedIndex = curr_index;        
    }
  }, [props.selectedId]);

  return(
    <select
      key={props.id}
      id={props.id}
      selectedindex={selectedIndex}
      onChange={props.onChange}
      style={{
        position: 'absolute',
        top: props.position.top,
        left: props.position.left
      }}
    >
      <option key={0}>{props.instruction}</option>
      {options.map( (option, index) => (
        <option key={index+1}>{option}</option>
      ))}
    </select>
  )
}

export default DropDown;
