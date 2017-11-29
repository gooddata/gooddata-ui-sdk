import { Execution } from '@gooddata/typings';

import { ErrorStates } from '../src/constants/errorStates';
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

    public getFingerprint() {
        return '{}';
    }
}

export function onErrorHandler(error: any) {
    if (error.status !== ErrorStates.OK) {
        console.error(error); // tslint:disable-line:no-console
    }
}
