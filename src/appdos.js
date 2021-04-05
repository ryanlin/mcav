import React from 'react';

import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { MainMenu, CreateGraph, } from "./components";

import './index.css';

class AppDos extends React.Component {
  render() {
    return (
      <div className="app">
        <Router>
          <Switch>
            <Route path="/" exact component = {() => <MainlMenu />} />
            <Route path="/create_graph" exact component = {() => <CreateGraph />} />
          </Switch>

          <Link to="/create_graph">{window.api.name}</Link>
        </Router>

        <br/>
        <MainMenu />
      </div>
    );
  }
}

export default AppDos;