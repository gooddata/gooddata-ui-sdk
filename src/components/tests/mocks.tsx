import * as React from 'react';

export const initChartDataLoading = jest.fn(() => Promise.resolve({
    metadata: {},
    result: {}
}));

export const initTableDataLoading = jest.fn(() => Promise.resolve({
    result: {},
    metadata: {},
    sorting: {}
}));

class DummyComponent extends React.Component<null, null> {
    render() {
        return <div />;
    }
}

export class LineFamilyChartTransformation extends DummyComponent {}
export class PieChartTransformation extends DummyComponent {}
export class TableTransformation extends DummyComponent {}
export class ResponsiveTable extends DummyComponent {}
export class Visualization extends DummyComponent {}
