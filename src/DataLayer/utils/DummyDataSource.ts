// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { IDataSource } from '../interfaces/DataSource';

export class DummyDataSource<T> implements IDataSource<T> {
    private data: T;
    private resolve: boolean;
    private resultSpec: AFM.IResultSpec;

    constructor(data: T, resolve: boolean = true) {
        this.data = data;
        this.resolve = resolve;
        this.resultSpec = {};
    }

    public getData(resultSpec: AFM.IResultSpec): Promise<T> {
        this.resultSpec = resultSpec;

        if (this.resolve) {
            return Promise.resolve(this.data);
        }

        return Promise.reject('DummyDataSource reject');
    }

    public getFingerprint() {
        return '';
    }

    public getResultSpec() {
        return this.resultSpec;
    }

    public getAfm() {
        return {};
    }
}
