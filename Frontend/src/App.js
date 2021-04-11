import React from 'react';

import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { MainMenu, CreateGraph, } from "./components";

import './index.css';

class App extends React.Component {
  render() {
    return (
      <div className="app">
        <Router>
          <Switch>
            <Route path="/create_graph" exact component = {() => <CreateGraph />} />
            <Route path="" exact component = {() => <MainMenu />} />
          </Switch>

          <br/>
          <Link to="create_graph">Create Graph</Link>
        </Router>
      </div>
    );
  }
}

export default App;
