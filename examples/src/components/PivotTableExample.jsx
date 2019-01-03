// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { PivotTable, BucketApi } from '@gooddata/react-components';
import PropTypes from 'prop-types';

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

export class PivotTableExample extends Component {
    static propTypes = {
        className: PropTypes.string,
        withMeasures: PropTypes.bool,
        withAttributes: PropTypes.bool,
        withPivot: PropTypes.bool,
        hasError: PropTypes.bool
    }

    static defaultProps = {
        className: undefined,
        withMeasures: false,
        withAttributes: false,
        withPivot: false,
        hasError: false
    }

    render() {
        const { withMeasures, withAttributes, withPivot, hasError, className } = this.props;
        const measures = withMeasures ? [
            BucketApi.measure(franchiseFeesIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesAdRoyaltyIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format('#,##0'),
            BucketApi.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format('#,##0')
        ] : [];

        const attributes = withAttributes ? [
            BucketApi.attribute(locationStateDisplayFormIdentifier),
            BucketApi.attribute(locationNameDisplayFormIdentifier),
            BucketApi.attribute(menuCategoryAttributeDFIdentifier)
        ] : [];

        const columns = withPivot ? [
            BucketApi.attribute(quarterDateIdentifier),
            BucketApi.attribute(monthDateIdentifier)
        ] : [];

        return (
            <div style={{ height: 300 }} className={className}>
                <PivotTable
                    projectId={hasError ? 'incorrectProjectId' : projectId}
                    measures={measures}
                    rows={attributes}
                    columns={columns}
                    pageSize={20}
                />
            </div>
        );
    }
}

export default PivotTableExample;
