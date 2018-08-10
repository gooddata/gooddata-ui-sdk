// (C) 2007-2018 GoodData Corporation
import * as React from 'react';

import { IDataSource } from '../../interfaces/DataSource';
import {
    oneMeasureResponse,
    oneMeasureAfm,
    tooLargeResponse,
    responseWithTotals,
    executionObjectWithTotals,
    oneMeasureOneDimensionResponse,
    twoMeasuresOneDimensionResponse,
    twoMeasuresAfm,
    emptyResponse
} from '../../execution/fixtures/ExecuteAfm.fixtures';

export const initChartDataLoading = jest.fn(() => Promise.resolve({
    metadata: {},
    result: {}
}));

export const initTableDataLoading = jest.fn(() => Promise.resolve({
    result: {},
    metadata: {},
    sorting: {}
}));

export class DummyComponent extends React.Component<any, any> {
    public render() {
        return <div />;
    }
}

export class LineFamilyChartTransformation extends DummyComponent {}
export class PieChartTransformation extends DummyComponent {}
export class TableTransformation extends DummyComponent {}
export class HeadlineTransformation extends DummyComponent {}
export class ResponsiveTable extends DummyComponent {}
export class IndigoTable extends DummyComponent {}
export class Visualization extends DummyComponent {}
export class BaseChart extends DummyComponent {}
export class Table extends DummyComponent {}
export class LoadingComponent extends DummyComponent {}
export class ErrorComponent extends DummyComponent {}

export const oneMeasureDataSource: IDataSource = {
    getData: () => Promise.resolve(oneMeasureResponse),
    getPage: () => Promise.resolve(oneMeasureResponse),
    getAfm: () => oneMeasureAfm,
    getFingerprint: () => JSON.stringify(oneMeasureResponse)
};

export const oneMeasurePagableOnlyDataSource: IDataSource = {
    getData: () => Promise.resolve(null),
    getPage: () => Promise.resolve(oneMeasureResponse),
    getAfm: () => oneMeasureAfm,
    getFingerprint: () => JSON.stringify(oneMeasureResponse)
};

export const oneMeasureOneDimensionDataSource: IDataSource = {
    getData: () => Promise.resolve(oneMeasureOneDimensionResponse),
    getPage: () => Promise.resolve(oneMeasureOneDimensionResponse),
    getAfm: () => oneMeasureAfm,
    getFingerprint: () => JSON.stringify(oneMeasureOneDimensionResponse)
};

export const twoMeasuresOneDimensionDataSource: IDataSource = {
    getData: () => Promise.resolve(twoMeasuresOneDimensionResponse),
    getPage: () => Promise.resolve(twoMeasuresOneDimensionResponse),
    getAfm: () => twoMeasuresAfm,
    getFingerprint: () => JSON.stringify(twoMeasuresOneDimensionResponse)
};

export const executionObjectWithTotalsDataSource: IDataSource = {
    getData: () => Promise.resolve(responseWithTotals),
    getPage: () => Promise.resolve(responseWithTotals),
    getAfm: () => executionObjectWithTotals.execution.afm,
    getFingerprint: () => JSON.stringify(responseWithTotals)
};

export const emptyDataSource: IDataSource = {
    getData: () => Promise.resolve(emptyResponse),
    getPage: () => Promise.resolve(emptyResponse),
    getAfm: () => ({}),
    getFingerprint: () => JSON.stringify(emptyResponse)
};

export const tooLargeDataSource: IDataSource = {
    getData: () => Promise.reject(tooLargeResponse),
    getPage: () => Promise.reject(tooLargeResponse),
    getAfm: () => ({}),
    getFingerprint: () => JSON.stringify(tooLargeDataSource)
};

export const delayedTooLargeDataSource: IDataSource = {
    // tslint:disable-next-line:variable-name
    getData: () => (new Promise((_resolve, reject) => {
        setTimeout(reject(tooLargeResponse), 20);
    })),
    // tslint:disable-next-line:variable-name
    getPage: () => (new Promise((_resolve, reject) => {
        setTimeout(reject(tooLargeResponse), 20);
    })),
    getAfm: () => ({}),
    getFingerprint: () => JSON.stringify(tooLargeDataSource)
};
