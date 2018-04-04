// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import * as stringify from 'json-stable-stringify';
import { IDataSource } from '../interfaces/DataSource';

export {
    IDataSource
};

export type ExecFactory<T> = (resultSpec: AFM.IResultSpec) => Promise<T>;

export class DataSource<T> implements IDataSource<T> {
    constructor(
        private execFactory: ExecFactory<T>,
        private afm: AFM.IAfm,
        private fingerprint?: string
    ) {}

    public getData(resultSpec: AFM.IResultSpec): Promise<T> {
        return this.execFactory(resultSpec);
    }

    public getAfm(): AFM.IAfm {
        return this.afm;
    }

    public getFingerprint(): string {
        return this.fingerprint ? this.fingerprint : stringify(this.afm);
    }
}
