/**
 * Navigation Bar For our first demo
 * Modified from: https://github.com/techomoro/ReactMultiPageWebsite/blob/master/src/components/Navigation.jsx
 */

import React from "react";
import { Link, withRouter } from "react-router-dom";

function DemoNav(props) {
  return (
    <div className="navigation">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            MCaV Demo1
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ml-auto">
              <li
                className={`nav-item  ${
                  props.location.pathname === "/" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/">
                  Main Menu
                  <span className="sr-only">(current)</span>
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/create_graph" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/create_graph">
                  Create Graph
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/visual_map" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/visual_map">
                  Visualize Map
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/calibration" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/calibration">
                  Calibration
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default withRouter(DemoNav);