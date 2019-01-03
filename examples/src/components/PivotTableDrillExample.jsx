// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { PivotTable, HeaderPredicateFactory, Model } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier
} from '../utils/fixtures';

export class PivotTableDrillExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drillEvent: null
        };
    }

    onDrill = (drillEvent) => {
        // eslint-disable-next-line no-console
        console.log('onFiredDrillEvent', drillEvent, JSON.stringify(drillEvent.drillContext.intersection, null, 2));
        this.setState({
            drillEvent
        });
        return true;
    }

    render() {
        const { drillEvent } = this.state;

        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .format('#,##0'),
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0'),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0'),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
        ];

        const drillableItems = [
            HeaderPredicateFactory.identifierMatch(menuCategoryAttributeDFIdentifier)
        ];

        const attributes = [
            Model.attribute(locationStateDisplayFormIdentifier),
            Model.attribute(locationNameDisplayFormIdentifier),
            Model.attribute(menuCategoryAttributeDFIdentifier)
        ];

        const columns = [
            Model.attribute(quarterDateIdentifier),
            Model.attribute(monthDateIdentifier)
        ];

        return (
            <div>
                {drillEvent === null ? null : <h3>You have Clicked <span className="s-drill-value">{drillEvent.drillContext.value}</span> </h3>}
                <div style={{ height: 300 }} className="s-pivot-table-drill">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        pageSize={20}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                    />
                </div>
            </div>
        );
    }
}

export default PivotTableDrillExample;
