import {
    DataSource,
    MetadataSource
} from '@gooddata/data-layer';

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
}
