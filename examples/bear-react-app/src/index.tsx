// (C) 2019 GoodData Corporation
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import AppPivot from "./AppPivot";
import * as serviceWorker from "./serviceWorker";
import "@gooddata/sdk-ui/styles/css/main.css";
import "@gooddata/sdk-ui/styles/css/pivotTable.css";

ReactDOM.render(<App />, document.getElementById("root"));
//ReactDOM.render(<AppPivot />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
