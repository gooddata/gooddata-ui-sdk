// (C) 2019-2021 GoodData Corporation
// this line is to avoid the TS2580 error. We do have the required dependencies but the error still happens.
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

import bearFactory, { BearToBackendConvertors, BearTokenAuthProvider } from "@gooddata/sdk-backend-bear";
import { BaseVisualization, FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/esm/internal";
import { IBaseVisualizationProps } from "@gooddata/sdk-ui-ext/esm/internal/components/BaseVisualization";

(async function getAfmExecution() {
    // this will be part of the request
    const token = "";
    const projectId = "";
    const insightUri = "";

    const backend = bearFactory().withAuthentication(new BearTokenAuthProvider(token));
    const insight = await backend.workspace(projectId).insights().getInsight({ uri: insightUri });
    const visualizationClasses = await backend.workspace(projectId).insights().getVisualizationClasses();

    const visualizationClass = visualizationClasses.find(
        ({ visualizationClass }) => visualizationClass.url === insight.insight.visualizationUrl,
    )!;

    const props: IBaseVisualizationProps = {
        backend,
        insight,
        projectId,
        visualizationClass,
        visualizationCatalog: FullVisualizationCatalog,
        onError: () => {},
        onLoadingChanged: () => {},
        pushData: () => {},
        renderer: () => {},
    };

    const visualization = new BaseVisualization(props);
    const preparedExecution = visualization.getExecution();

    const afmExecution = BearToBackendConvertors.toAfmExecution(preparedExecution.definition);
    const executionResult = await preparedExecution.execute();

    console.log(afmExecution);
    console.log(executionResult);
    // how to get executionResponse or polling link?
})();
