// Copyright (C) 2007-2018, GoodData(R) Corporation. All rights reserved.
import { ExperimentalExecutionsModule } from './execution/experimental-executions';
import { AttributesMapLoaderModule } from './utils/attributesMapLoader';
import { ExecuteAfmModule } from './execution/execute-afm';
import { XhrModule } from './xhr';
import { MetadataModule } from './metadata';

/**
 * Execution endpoints
 *
 * @module execution
 * @class execution
 *
 */
export class ExecutionModule {
    public readonly executeAfm: ExecuteAfmModule['executeAfm'];
    public readonly getExecutionResponse: ExecuteAfmModule['getExecutionResponse'];
    public readonly fetchExecutionResult: ExecuteAfmModule['fetchExecutionResult'];
    private readonly executeAfmModule: ExecuteAfmModule;
    private readonly xhr: XhrModule;
    private readonly md: MetadataModule;

    constructor(xhr: XhrModule, md: MetadataModule) {
        this.executeAfmModule = new ExecuteAfmModule(xhr);
        this.executeAfm = this.executeAfmModule.executeAfm.bind(this.executeAfmModule);
        this.getExecutionResponse = this.executeAfmModule.getExecutionResponse.bind(this.executeAfmModule);
        this.fetchExecutionResult = this.executeAfmModule.fetchExecutionResult.bind(this.executeAfmModule);
        this.xhr = xhr;
        this.md = md;
    }

    public getData(projectId: string, columns: any[], executionConfiguration: any = {}, settings: any = {}) {
        return this.getExperimentalExecutionsModule().getData(projectId, columns, executionConfiguration, settings);
    }

    public mdToExecutionDefinitionsAndColumns(projectId: string, mdObj: any, options = {}) {
        return this.getExperimentalExecutionsModule().mdToExecutionDefinitionsAndColumns(projectId, mdObj, options);
    }

    private getExperimentalExecutionsModule() {
        const loaderModule = new AttributesMapLoaderModule(this.md);

        return new ExperimentalExecutionsModule(
            this.xhr,
            loaderModule.loadAttributesMap.bind(loaderModule)
        );
    }
}
