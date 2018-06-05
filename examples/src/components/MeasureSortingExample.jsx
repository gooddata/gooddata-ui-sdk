// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, monthDateIdentifier, projectId } from '../utils/fixtures';
import { createMeasureBucketItem, createAttributeBucketItem, createMeasureSortItem } from '../utils/helpers';

export class MeasureSortingExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-measure-sorting">
                <ColumnChart
                    projectId={projectId}
                    measures={[createMeasureBucketItem(totalSalesIdentifier)]}
                    viewBy={createAttributeBucketItem(monthDateIdentifier)}
                    sortBy={[createMeasureSortItem(totalSalesIdentifier)]}
                />
            </div>
        );
    }
}

export default MeasureSortingExample;
