import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Gallery from "./Gallery";
import PaintingPage from "./PaintingPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Gallery} />
          <Route path="/work/:slug" component={PaintingPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
