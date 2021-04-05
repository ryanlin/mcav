import React from 'react';

class VisualMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // empty
    };
  }


  render() {
    return (
      <div className="main-menu">
        <h1 className="menu-title"> VisualMap </h1>
        <div className="menu-container">
          {/** i guess we can just write straight html
            * and not worry about render and proper
            * structure until later
            **/}
        </div>
      </div>
    );
  }
}

export default VisualMap;