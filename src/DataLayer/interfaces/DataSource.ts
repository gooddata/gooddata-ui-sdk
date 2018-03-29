// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';

export interface IDataSource<T> {
    getData(resultSpec: AFM.IResultSpec): Promise<T>;
    getAfm(): AFM.IAfm;
    getFingerprint(): string;
}
