// (C) 2007-2020 GoodData Corporation
import { ExperimentalExecutionsModule } from "./execution/experimental-executions.js";
import { AttributesMapLoaderModule } from "./utils/attributesMapLoader.js";
import { ExecuteAfmModule } from "./execution/execute-afm.js";
import { XhrModule } from "./xhr.js";
import { MetadataModule } from "./metadata.js";
import { GdcVisualizationObject, GdcCatalog } from "@gooddata/api-model-bear";

/**
 * Execution endpoints
 *
 *
 */
export class ExecutionModule {
    public readonly executeAfm: ExecuteAfmModule["executeAfm"];
    public readonly getExecutionResponse: ExecuteAfmModule["getExecutionResponse"];

    public readonly _executeVisualization: ExecuteAfmModule["_executeVisualization"];
    public readonly _getVisExecutionResponse: ExecuteAfmModule["_getVisExecutionResponse"];

    public readonly getPartialExecutionResult: ExecuteAfmModule["getPartialExecutionResult"];
    public readonly getExecutionResult: ExecuteAfmModule["getExecutionResult"];
    private readonly executeAfmModule: ExecuteAfmModule;
    private readonly xhr: XhrModule;
    private readonly md: MetadataModule;

    constructor(xhr: XhrModule, md: MetadataModule) {
        this.executeAfmModule = new ExecuteAfmModule(xhr);
        this.executeAfm = this.executeAfmModule.executeAfm.bind(this.executeAfmModule);
        this.getExecutionResponse = this.executeAfmModule.getExecutionResponse.bind(this.executeAfmModule);
        this._executeVisualization = this.executeAfmModule._executeVisualization.bind(this.executeAfmModule);
        this._getVisExecutionResponse = this.executeAfmModule._getVisExecutionResponse.bind(
            this.executeAfmModule,
        );
        this.getPartialExecutionResult = this.executeAfmModule.getPartialExecutionResult.bind(
            this.executeAfmModule,
        );
        this.getExecutionResult = this.executeAfmModule.getExecutionResult.bind(this.executeAfmModule);
        this.xhr = xhr;
        this.md = md;
    }

    public getData(
        projectId: string,
        columns: any[],
        executionConfiguration: any = {},
        settings: any = {},
    ): Promise<any> {
        return this.getExperimentalExecutionsModule().getData(
            projectId,
            columns,
            executionConfiguration,
            settings,
        );
    }

    public mdToExecutionDefinitionsAndColumns(
        projectId: string,
        mdObj: GdcVisualizationObject.IVisualizationObjectContent,
        options: { attributesMap?: Record<string, unknown>; removeDateItems?: boolean } = {},
    ): Promise<GdcCatalog.IColumnsAndDefinitions> {
        return this.getExperimentalExecutionsModule().mdToExecutionDefinitionsAndColumns(
            projectId,
            mdObj,
            options,
        );
    }

    private getExperimentalExecutionsModule() {
        const loaderModule = new AttributesMapLoaderModule(this.md);

        return new ExperimentalExecutionsModule(this.xhr, loaderModule.loadAttributesMap.bind(loaderModule));
    }
}
