import React from 'react';

import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { MainMenu, CreateGraph } from "./components";

import './index.css';

function App() {
  const [filePath, setFilePath] = React.useState(null);
  
  return (
    <div className="app">
      <h1>mcav 9000</h1>
      <hr/>
      <div label="Main">
        { filePath ?
          <CreateGraph
            filePath={filePath}
          /> :
          <MainMenu
            filePath={filePath}
            setFilePath={setFilePath}
          />
        }
      </div>
    </div>
  );
}

export default App;
