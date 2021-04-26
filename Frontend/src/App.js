import React from 'react';
//import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { MainMenu, CreateGraph } from "./components";

import './index.css';

function App() {
  const [tempSwitch, setTempSwitch] = React.useState(null);
  
  return (
    <div className="app">
      <h1>mcav 9000</h1>
      <hr/>
      <div label="Main">
        { tempSwitch ?
          <CreateGraph
            filePath={tempSwitch}
          /> :
          <MainMenu
            filePath={tempSwitch}
            setFilePath={() => setTempSwitch(true)}
          />
        }
      </div>
    </div>
  );
}

export default App;
