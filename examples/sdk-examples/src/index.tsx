// (C) 2019 GoodData Corporation
import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";

// import "@gooddata/sdk-ui/styles/css/main.css";
// import "@gooddata/sdk-ui/styles/css/attributeFilter.css";
// import "@gooddata/sdk-ui/styles/css/dateFilter.css";
// import "@gooddata/sdk-ui/styles/css/headline.css";
// import "@gooddata/sdk-ui/styles/css/charts.css";
// import "@gooddata/sdk-ui/styles/css/measureValueFilter.css";
// import "@gooddata/sdk-ui/styles/css/menu.css";
// import "@gooddata/sdk-ui/styles/css/pivotTable.css";
// import "@gooddata/goodstrap/lib/styles.scss";
// import "react-datepicker/dist/react-datepicker.css";

import { App } from "./App";
import { AppProviders } from "./context";

const root = document.createElement("div");
root.className = "root";
document.body.appendChild(root);
ReactDOM.render(
    <AppProviders>
        <App />
    </AppProviders>,
    root,
);
