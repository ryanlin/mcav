import React from 'react';
import { FileUploadButton } from "../buttons";

function MainMenuOption(props) {
  
  return (
    <div className="graph-option-container">
      <FileUploadButton
        optionName={props.optionName}
        optionDescr={props.optionDescr}
      />

      <div className="menu-description-container">
        <div>{props.optionDescr}</div>
      </div>

    </div>
  )
}

class MainMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      optionNames: ["Create Graph", "Create Map"],
      optionDescr: ["REQUIRED:\nRos1 bag file or MCAV file",
                    "REQUIRED:\nCalibrated sensor parameters or Ros1 bagfile"],
      selectedFiles: null
    };
  }

  renderMainMenuOption(i) {
    return (
      <MainMenuOption 
        optionName = {this.state.optionNames[i]}
        optionDescr = {this.state.optionDescr[i]}
      />
    )
  }

  render() {
    return (
      <div className="main-menu">
        <h1 className="menu-title"> MCaV MAIN MENU </h1>
        <div className="menu-container">
          {this.renderMainMenuOption(0)}
          {this.renderMainMenuOption(1)}
        </div>
      </div>
    );
  }
}

export default MainMenu;