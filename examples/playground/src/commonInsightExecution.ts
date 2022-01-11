// (C) 2021 GoodData Corporation

import { BearToBackendConvertors } from "@gooddata/sdk-backend-bear";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/esm/internal";
import {
    BaseVisualization,
    IBaseVisualizationProps,
} from "@gooddata/sdk-ui-ext/esm/internal/components/BaseVisualization";
import { getBackend } from "./getBackend";
import { IInsight } from "@gooddata/sdk-model";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { fillMissingTitles, ignoreTitlesForSimpleMeasures, ILocale } from "@gooddata/sdk-ui";

export async function getExecution(token: string, projectId: string, insight: IInsight) {
    const backend = getBackend(token);
    const visualizationClasses = await backend.workspace(projectId).insights().getVisualizationClasses();

    const visualizationClass = visualizationClasses.find(
        ({ visualizationClass }) => visualizationClass.url === insight.insight.visualizationUrl,
    )!;

    const locale = (await backend.currentUser().settings().getSettings()).locale as ILocale;
    const insightWithMissingTitles = ignoreTitlesForSimpleMeasures(fillMissingTitles(insight, locale));

    const props: IBaseVisualizationProps = {
        backend,
        insight: insightWithMissingTitles,
        projectId,
        visualizationClass,
        visualizationCatalog: FullVisualizationCatalog,
        onError: () => {},
        onLoadingChanged: () => {},
        pushData: () => {},
        renderer: () => {},
        locale,
    };

    const visualization = new BaseVisualization(props);
    const preparedExecution = visualization.getExecution();

    const afmExecution = BearToBackendConvertors.toAfmExecution(preparedExecution.definition);
    const executionResult: IExecutionResult = await preparedExecution.execute();
    const resultLink = (executionResult as any).execResponse.links.executionResult;

    console.log("afmExecution", afmExecution);
    console.log("executionResult link", resultLink);

    await fetch(resultLink)
        .then((res) => res.json())
        .then((data) => console.log("executionResult data", data));
}
