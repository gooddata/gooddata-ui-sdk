import * as React from 'react';
import { mount, shallow } from 'enzyme';
import noop = require('lodash/noop');

import { PivotTable, PivotTableInner, getGridDataSource, RowLoadingElement } from '../PivotTable';
import { oneMeasureDataSource } from '../../tests/mocks';
import { pivotTableWithColumnAndRowAttributes } from '../../../../stories/test_data/fixtures';
import { LoadingComponent } from '../../simple/LoadingComponent';

describe('PivotTable', () => {
    it('should render PivotTableInner', () => {
        const wrapper = mount(
            <PivotTable
                dataSource={oneMeasureDataSource}
                getPage={noop as any}
            />
        );
        expect(wrapper.find(PivotTableInner)).toHaveLength(1);
    });

    describe('getGridDataSource', () => {
        it('should return AGGrid dataSource that calls getPage, successCallback and onSuccess', async () => {
            const resultSpec = pivotTableWithColumnAndRowAttributes.executionRequest.resultSpec;
            const getPage = jest.fn().mockReturnValue(Promise.resolve(pivotTableWithColumnAndRowAttributes));
            const startRow = 0;
            const endRow = 0;
            const successCallback = jest.fn();
            const onSuccess = jest.fn();

            const gridDataSource = getGridDataSource(resultSpec, getPage, onSuccess);
            await gridDataSource.getRows({ startRow, endRow, successCallback });
            expect(getPage).toHaveBeenCalledWith(resultSpec, [0, undefined], [0, undefined]);
            expect(successCallback.mock.calls[0]).toMatchSnapshot();
            expect(onSuccess.mock.calls[0]).toMatchSnapshot();
        });
    });

    describe('RowLoadingElement', () => {
        it('should show LoadingComponent for empty ', async () => {
            const wrapper = shallow(<RowLoadingElement node={{}} />);
            expect(wrapper.find(LoadingComponent)).toHaveLength(1);
        });

        it('should show value for existing data', async () => {
            const props = { node: { id: 1 }, data: [3.14, 2], colDef: { field: '0' } };
            const wrapper = shallow(<RowLoadingElement {...props} />);
            expect(wrapper.html()).toEqual('<span>3.14</span>');
        });
    });
});
