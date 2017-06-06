import { IHeader } from './Header';

export interface ISimpleExecutorResult {
    rawData?: string[][];
    isEmpty?: boolean;
    headers?: IHeader[];
}
