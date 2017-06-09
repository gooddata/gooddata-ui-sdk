import { IHeader } from '@gooddata/data-layer/dist/interfaces/Header';

export interface ISimpleExecutorResult {
    rawData?: string[][];
    isEmpty?: boolean;
    headers?: IHeader[];
}
