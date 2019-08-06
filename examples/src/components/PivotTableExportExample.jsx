// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import ExampleWithExport from "./utils/ExampleWithExport";

import {
    dateDataSetUri,
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
} from "../utils/fixtures";

export class PivotTableExportExample extends Component {
    render() {
        const measures = [
            Model.measure(franchiseFeesIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFees"),
            Model.measure(franchiseFeesAdRoyaltyIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesAdRoyalty"),
            Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
                .format("#,##0")
                .localIdentifier("franchiseFeesInitialFranchiseFee"),
            Model.measure(franchiseFeesIdentifierOngoingRoyalty)
                .format("#,##0")
                .localIdentifier("franchiseFeesOngoingRoyalty"),
        ];

        const attributes = [
            Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("locationState"),
            Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("locationName"),
            Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier("menu"),
        ];

        const columns = [
            Model.attribute(quarterDateIdentifier).localIdentifier("quarter"),
            Model.attribute(monthDateIdentifier).localIdentifier("month"),
        ];

        const sortBy = [Model.attributeSortItem("menu", "asc")];

        const filters = [Model.absoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div style={{ height: 300 }} className="s-pivot-table-sorting">
                        <PivotTable
                            projectId={projectId}
                            measures={measures}
                            rows={attributes}
                            columns={columns}
                            pageSize={20}
                            sortBy={sortBy}
                            filters={filters}
                            onExportReady={onExportReady}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default PivotTableExportExample;
