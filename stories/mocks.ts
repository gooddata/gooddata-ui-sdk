import { ISimpleExecutorResult } from 'gooddata';
import {
    DataSource,
    MetadataSource,
    VisualizationObject
} from '@gooddata/data-layer';

import { ErrorStates } from '../src/constants/errorStates';

export class DataSourceMock implements DataSource.IDataSource<ISimpleExecutorResult> {
    private returnValue: ISimpleExecutorResult;

    constructor(returnValue: ISimpleExecutorResult) {
        this.returnValue = returnValue;
    }

    public getData() {
        return Promise.resolve(this.returnValue);
    }

    public getAfm() {
        return {};
    }

    public getFingerprint() {
        return '{}';
    }
}

export class MetadataSourceMock implements MetadataSource.IMetadataSource {
    private visualizationMetadataResult: VisualizationObject.IVisualizationObject;

    constructor(visualizationMetadataResult: VisualizationObject.IVisualizationObject) {
        this.visualizationMetadataResult = visualizationMetadataResult;
    }

    public getVisualizationMetadata(): Promise<VisualizationObject.IVisualizationMetadataResult> {
        return Promise.resolve({
            metadata: this.visualizationMetadataResult,
            measuresMap: {}
        });
    }

    public getFingerprint(): string {
        return JSON.stringify(this.visualizationMetadataResult);
    }
}

export function onErrorHandler(error: any) {
    if (error.status !== ErrorStates.OK) {
        console.error(error); // tslint:disable-line:no-console
    }
}
