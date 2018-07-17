// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import * as stringify from 'json-stable-stringify';
import { IDataSource } from '../interfaces/DataSource';
import { DEFAULT_LIMIT } from '../../execution/execute-afm';

export {
    IDataSource
};

export type ExecFactory<T> = (resultSpec: AFM.IResultSpec) => Promise<T>;

export class DataSource<T> implements IDataSource<T> {
    private executionPromises: {
        [key: string]: Promise<Execution.IExecutionResponse>
    };

    constructor(
        private execFactory: ExecFactory<T>,
        private afm: AFM.IAfm,
        private fingerprint?: string,
        private responseFactory?: (resultSpec: AFM.IResultSpec) => Promise<Execution.IExecutionResponse>,
        private resultFactory?:
            (executionResultUri: string, offset: number[], limit: number[]) => Promise<Execution.IExecutionResult>
    ) {
        this.executionPromises = {};
    }

    public getData(resultSpec: AFM.IResultSpec): Promise<T> {
        return this.execFactory(resultSpec);
    }

    public getPage(
        resultSpec: AFM.IResultSpec,
        offset: number[] = [],
        limit: number[] = []
    ): Promise<Execution.IExecutionResponses> {
        const resultSpecFingerprint = stringify(resultSpec);
        if (!this.responseFactory) {
            throw new Error('Missing responseFactory!');
        }
        if (!this.executionPromises[resultSpecFingerprint]) {
            this.executionPromises[resultSpecFingerprint] = this.responseFactory(resultSpec);
        }

        return this.executionPromises[resultSpecFingerprint].then(
            (executionResponse: Execution.IExecutionResponse) => {
                if (!this.resultFactory) {
                    throw new Error('Missing resultFactory!');
                }

                const safeOffset = offset.map((offsetItem = 0) => offsetItem);

                const safeLimit = limit.map((limitItem = DEFAULT_LIMIT) => {
                    const safeLimitItem = Math.min(limitItem, DEFAULT_LIMIT);
                    if (safeLimitItem < limitItem) {
                        // tslint:disable-next-line:no-console
                        console.warn('The maximum limit per page is ' + DEFAULT_LIMIT);
                    }
                    return safeLimitItem;
                });

                return this.resultFactory(
                    executionResponse.links.executionResult,
                    safeOffset,
                    safeLimit
                ).then(
                        (executionResult: Execution.IExecutionResult) => ({
                            executionResult,
                            executionResponse
                        })
                    );
            }
        );
    }

    public getAfm(): AFM.IAfm {
        return this.afm;
    }

    public getFingerprint(): string {
        return this.fingerprint ? this.fingerprint : stringify(this.afm);
    }
}
