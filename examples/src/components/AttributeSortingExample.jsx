// (C) 2007-2018 GoodData Corporation

import React, { Component } from 'react';
import { ColumnChart, BucketApi } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { totalSalesIdentifier, locationCityDisplayFormIdentifier, projectId } from '../utils/fixtures';

export class AttributeSortingExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-attribute-sorting">
                <ColumnChart
                    projectId={projectId}
                    measures={[BucketApi.measure(totalSalesIdentifier)]}
                    viewBy={
                        BucketApi.visualizationAttribute(locationCityDisplayFormIdentifier)
                            .localIdentifier(locationCityDisplayFormIdentifier)
                    }
                    sortBy={[BucketApi.attributeSortItem(locationCityDisplayFormIdentifier, 'desc')]}
                />
            </div>
        );
    }
}

export default AttributeSortingExample;
