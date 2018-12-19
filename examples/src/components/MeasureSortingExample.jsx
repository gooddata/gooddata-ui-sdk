// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, monthDateIdentifier, projectId } from '../utils/fixtures';

export class MeasureSortingExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-measure-sorting">
                <ColumnChart
                    projectId={projectId}
                    measures={[BucketApi.measure(totalSalesIdentifier).localIdentifier(totalSalesIdentifier)]}
                    viewBy={
                        BucketApi.visualizationAttribute(monthDateIdentifier)
                            .localIdentifier(monthDateIdentifier)
                    }
                    sortBy={[BucketApi.measureSortItem(totalSalesIdentifier, 'desc')]}
                />
            </div>
        );
    }
}

export default MeasureSortingExample;
