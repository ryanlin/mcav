import React from 'react';

function DropDown(props) {
  const options = props.options;
  const instruction = props.instruction;

  return(
    <select
      id={props.id}
      onChange = {props.onChange}
      style={{
        position: 'absolute',
        top: props.position.top,
        left: props.position.left
      }}
    >
      <option>{props.instruction}</option>
      {options.map( (option) => (
        <option>{option}</option>
      ))}
    </select>
  )
}

export default DropDown;

// Usage:
// import { UseState } from 'react';
//
// const INITIAL_STATE = []
// const[bagTopics, setBagTopics] = useState(INITIAL_STATE);
// const[topic, setTopic] = useState(INITIAL_STATE);
//
// // Event Handlers
// const selectTopic = (e) => {
//   setTopic(e.target.value);
// }
//
// // API Receivers:
//
// api.receive("bagfile", (res) => {
//   console.log("bagfile recieved");
//   topicList = JSON.parse(JSON.stringify(res));
//   console.log(topicList);
//
//   setBagTopics(topicList);
//
// }, []);
//
// <DropDown
//   id="topicSelect"
//   options={bagTopics}
//   onChange={selectTopic}
// />
