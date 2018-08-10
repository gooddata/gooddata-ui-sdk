// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { Table } from '../Table';
import { PureTable } from '../PureTable';
import { SortableTable } from '../SortableTable';
import { oneMeasureDataSource } from '../../tests/mocks';

describe('Table', () => {
    it('should render sortable table for dashboard environment', () => {
        const component = shallow(
            <Table environment="dashboards" dataSource={oneMeasureDataSource} />
        );

        expect(component.find(SortableTable)).toBeTruthy();
    });

    it('should render pure table for "none" environment', () => {
        const component = shallow(
            <Table environment="none" dataSource={oneMeasureDataSource} />
        );

        expect(component.find(PureTable)).toBeTruthy();
    });
});
