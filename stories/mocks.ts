import {
    DataSource,
    MetadataSource
} from '@gooddata/data-layer';

import { ErrorStates } from '../src/constants/errorStates';

export class DataSourceMock implements DataSource.IDataSource {
    private returnValue;
    constructor(returnValue) {
        this.returnValue = returnValue;
    }
    getData() {
        return Promise.resolve(this.returnValue);
    }
    getAfm() {
        return {};
    }
    getFingerprint() {
        return '{}';
    }
}

export class MetadataSourceMock implements MetadataSource.IMetadataSource{
    private returnValue;
    constructor(returnValue) {
        this.returnValue = returnValue;
    }
    getVisualizationMetadata() {
        return Promise.resolve({
            metadata: this.returnValue,
            measuresMap: {}
        });
    }
    getFingerprint() {
        return JSON.stringify(this.returnValue);
    }
}

export function onErrorHandler(error) {
    if (error.status !== ErrorStates.OK) {
        console.error(error);
    }
}
