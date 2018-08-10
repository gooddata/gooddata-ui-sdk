// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { AFM } from '@gooddata/typings';
import { testUtils } from '@gooddata/js-utils';
import { ITableProps, PureTable } from '../PureTable';
import { SortableTable, ISortableTableState } from '../SortableTable';
import { IDataSourceProviderInjectedProps } from '../../afm/DataSourceProvider';
import { oneMeasureDataSource, emptyDataSource } from '../../tests/mocks';

const sortItem: AFM.IAttributeSortItem = {
    attributeSortItem: {
        direction: 'desc',
        attributeIdentifier: 'a1'
    }
};

describe('SortableTable', () => {
    function createComponent(props: ITableProps & IDataSourceProviderInjectedProps) {
        return shallow<ITableProps & IDataSourceProviderInjectedProps, ISortableTableState>(
            <SortableTable {...props} />
        );
    }

    const createProps = (customProps = {}): ITableProps & IDataSourceProviderInjectedProps => {
        return {
            height: 200,
            environment: 'dashboards',
            dataSource: oneMeasureDataSource,
            ...customProps
        };
    };

    it('should pass sort from state to PureTable', () => {
        const wrapper = createComponent(createProps());
        wrapper.setState({
            sortItems: [sortItem]
        });
        return testUtils.delay().then(() => {
            expect(wrapper.find(PureTable).prop('resultSpec')).toEqual({
                sorts: [sortItem]
            });
        });
    });

    it('should pass props to parent pushData', () => {
        const pushData = jest.fn();
        const wrapper = createComponent(createProps({
            pushData
        }));
        const pushedData: any = {
            properties: {
                sortItems: [sortItem]
            }
        };
        const table: SortableTable = wrapper.instance() as SortableTable;
        table.handlePushData(pushedData);
        expect(pushData).toHaveBeenCalledWith(pushedData);
    });

    it('should invalidate local sort item if its not related to current AFM', () => {
        const wrapper = createComponent(createProps({
            dataSource: emptyDataSource
        }));
        wrapper.setState({
            sortItems: [sortItem]
        });

        wrapper.setProps({
            dataSource: oneMeasureDataSource
        });

        return testUtils.delay().then(() => {
            expect(wrapper.state('sortItems')).toEqual([]);
            expect(wrapper.find(PureTable)).toHaveLength(1);
        });
    });
});
