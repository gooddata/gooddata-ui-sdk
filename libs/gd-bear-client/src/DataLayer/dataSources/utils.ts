// (C) 2007-2018 GoodData Corporation
import { IDataSource } from "../interfaces/DataSource";

export function dataSourcesMatch<T>(first?: IDataSource<T>, second?: IDataSource<T>): boolean {
    const firstFingerprint = first ? first.getFingerprint() : null;
    const secondFingerprint = second ? second.getFingerprint() : null;

    return firstFingerprint === secondFingerprint;
}
