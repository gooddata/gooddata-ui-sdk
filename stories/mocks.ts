// (C) 2007-2018 GoodData Corporation
import { Execution } from '@gooddata/typings';

import { IDataSource } from '../src/interfaces/DataSource';

export class DataSourceMock implements IDataSource {
    constructor(private returnValue: Execution.IExecutionResponses) {
    }

    public getData() {
        return Promise.resolve(this.returnValue);
    }

    public getAfm() {
        return {};
    }

    public getPage() {
        return Promise.resolve(this.returnValue);
    }

    public getFingerprint() {
        return '{}';
    }
}

export function onErrorHandler(error: any) {
    console.error(error); // tslint:disable-line:no-console
}
