// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.
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
    constructor(private xhr: XhrModule, private md: MetadataModule) {}

    public getData(projectId: string, columns: any[], executionConfiguration: any = {}, settings: any = {}) {
        return this.getExperimentalExecutionsModule().getData(projectId, columns, executionConfiguration, settings);
    }

    public mdToExecutionDefinitionsAndColumns(projectId: string, mdObj: any, options = {}) {
        return this.getExperimentalExecutionsModule().mdToExecutionDefinitionsAndColumns(projectId, mdObj, options);
    }

    public executeAfm(projectId: string, execution: any) {
        return (new ExecuteAfmModule(this.xhr)).executeAfm(projectId, execution);
    }

    private getExperimentalExecutionsModule() {
        const loaderModule = new AttributesMapLoaderModule(this.md);

        return new ExperimentalExecutionsModule(
            this.xhr,
            loaderModule.loadAttributesMap.bind(loaderModule)
        );
    }
}
