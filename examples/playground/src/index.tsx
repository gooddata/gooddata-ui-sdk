// (C) 2019-2021 GoodData Corporation
// this line is to avoid the TS2580 error. We do have the required dependencies but the error still happens.
import { uriRef } from "@gooddata/sdk-model";

declare const require: any;
if (process.env.WDYR === "true") {
    // we do not want to fetch this dependency while the functionality is disabled
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
        include: [/WithLoading/],
    });
}
import "babel-polyfill";
import React from "react";
import { getInsightExecution } from "./getInsightExecution";
import { getWidgetExecution } from "./getWidgetExecution";

const token = "";
const projectId = "";
const insightUri = "";

const widgetUri = "";
const filterContextUri = "";
const dashboardUri = "";

// this is just a cookie hack for the playground - it will not be used like this in node
document.cookie = `GDCAuthSST=${token};path=/gdc/account`;

(async () => {
    await getInsightExecution(token, projectId, insightUri);
    console.log('#############################################')
    await getWidgetExecution(token, projectId, uriRef(dashboardUri), uriRef(widgetUri), uriRef(filterContextUri));
})();
