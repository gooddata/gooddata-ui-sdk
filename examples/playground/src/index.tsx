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
const projectId = "p0j47iyr6cwpyrzs8ab4aib0p1ufbiie";
const insightUri = "/gdc/md/p0j47iyr6cwpyrzs8ab4aib0p1ufbiie/obj/75567";

const widgetUri = "/gdc/md/p0j47iyr6cwpyrzs8ab4aib0p1ufbiie/obj/75720";
const filterContextUri = "/gdc/md/p0j47iyr6cwpyrzs8ab4aib0p1ufbiie/obj/75725";
const dashboardUri = "/gdc/md/p0j47iyr6cwpyrzs8ab4aib0p1ufbiie/obj/75726";

// this is just a cookie hack for the playground - it will not be used like this in node
document.cookie = `GDCAuthSST=${token};path=/gdc/account`;

(async () => {
    try {
        await getInsightExecution(token, projectId, insightUri);
    } catch (e) {
        console.log("insight", e);
    }

    console.log('#############################################')

    try {
        await getWidgetExecution(token, projectId, uriRef(dashboardUri), uriRef(widgetUri), uriRef(filterContextUri));
    } catch (e) {
        console.log("widget", e);
    }

})();
