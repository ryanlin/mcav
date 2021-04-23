import React from 'react';
import UploadButton from '../welcome/UploadButton';

function MainMenuOption(props) {
  return (
    <div className="graph-option-container">
      <UploadButton
        text={props.optionName}
        onClick={props.onClick}
      />

      <div className="menu-description-container">
        <div>{props.optionDescr}</div>
      </div>
    </div>
  )
}

function MainMenu(props) {
  const options = [
    {
      key: 0,
      name: "Create Graph",
      descr:"REQUIRED:\nRos1 bag file or MCAV file",
      onClick: props.setFilePath  //TODO: DUMMY! REPLACE W "props.setFilePath"
    },
    {
      key: 0,
      name: "Create Map",
      descr:"REQUIRED:\nCalibrated sensor parameters or Ros1 bagfile",
      onClick: props.setFilePath
    }
  ]

  return(
    <div className="main-menu">
      <h1 className="menu-title"> MCaV MAIN MENU </h1>
      <div className="menu-container">
        {options.map( (option, index) => (
          <MainMenuOption
            key={index}
            optionName={option.name}
            optionDescr={option.descr}
            onClick={option.onClick}
          />
        ))}
      </div>
    </div>
  )
}

export default MainMenu;