import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "semantic-ui-css/semantic.min.css";
import WrappedApp from "./App";

ReactDOM.render(
  <React.StrictMode>
    <div id="main" className="main ui">
      <h1 class="ui dividing centered header">Chat App</h1>
      <div class="ui one column center aligned page grid">
        <div class="column ten wide">
          <WrappedApp />
        </div>
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
