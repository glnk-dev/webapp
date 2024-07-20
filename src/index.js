import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

const getBasename = () => {
  if (window.location.hostname === 'localhost') {
    const path = window.location.pathname.split('/');
    path.pop();
    return path.join('/');
  }
  if (window.location.hostname.endsWith('github.io')) {
    return '/webapp';
  }
  return '/';
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router basename={getBasename()}>
      <App />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
