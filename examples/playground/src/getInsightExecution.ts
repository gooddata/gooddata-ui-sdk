// (C) 2021 GoodData Corporation

import { BearToBackendConvertors } from "@gooddata/sdk-backend-bear";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/esm/internal";
import {
    BaseVisualization,
    IBaseVisualizationProps,
} from "@gooddata/sdk-ui-ext/esm/internal/components/BaseVisualization";
import { getBackend } from "./getBackend";

export async function getInsightExecution(token: string, projectId: string, insightUri: string) {
    const backend = getBackend(token);
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
}
