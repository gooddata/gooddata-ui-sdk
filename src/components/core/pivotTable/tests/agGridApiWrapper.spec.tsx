// (C) 2007-2019 GoodData Corporation
import * as React from 'react';
import { mount } from 'enzyme';
import { AgGridReact } from 'ag-grid-react';

import ApiWrapper from '../agGridApiWrapper';
import { GridReadyEvent } from 'ag-grid';
import { ICustomGridOptions } from '../../PivotTable';

describe('agGridApiWrapper', () => {
    function renderComponent(customProps = {}) {
        const gridOptions: ICustomGridOptions = {
            rowModelType: 'infinite'
        };

        const defaultProps = { gridOptions };

        return mount(
            <AgGridReact
                {...defaultProps}
                {...customProps}
            />
        );
    }

    describe('getHeaderHeight', () => {
        it('should return height of grid header', (done) => {
            const onGridReady = (params: GridReadyEvent) => {
                const headerHeight = ApiWrapper.getHeaderHeight(params.api);
                expect(typeof headerHeight).toEqual('number');
                done();
            };

            renderComponent({ onGridReady });
        });
    });

    describe('getRowHeight', () => {
        it('should return height of grid row', (done) => {
            const onGridReady = (params: GridReadyEvent) => {
                const rowHeight = ApiWrapper.getRowHeight(params.api);
                expect(typeof rowHeight).toEqual('number');
                done();
            };

            renderComponent({ onGridReady });
        });
    });
});
