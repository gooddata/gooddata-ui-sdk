// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, locationCityDisplayFormIdentifier, projectId } from '../utils/fixtures';
import { createMeasureBucketItem, createAttributeBucketItem, createAttributeSortItem } from '../utils/helpers';

export class AttributeSortingExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-attribute-sorting">
                <ColumnChart
                    projectId={projectId}
                    measures={[createMeasureBucketItem(totalSalesIdentifier)]}
                    viewBy={createAttributeBucketItem(locationCityDisplayFormIdentifier)}
                    sortBy={[createAttributeSortItem(locationCityDisplayFormIdentifier, 'desc')]}
                />
            </div>
        );
    }
}

export default AttributeSortingExample;
