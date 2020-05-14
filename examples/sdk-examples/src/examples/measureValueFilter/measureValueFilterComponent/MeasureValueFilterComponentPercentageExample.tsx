// (C) 2007-2020 GoodData Corporation
import React from "react";

import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { LdmExt } from "../../../ldm";

const measureTitle = "Franchised Sales Ratio";

const measures = [LdmExt.FranchisedSales];

const attributes = [LdmExt.LocationName];

// TODO: SDK8 Add this to filters after RAIL-2311 has been resolved, and change to "ALL"
// const defaultFilter = newMeasureValueFilter(LdmExt.FranchisedSales, "GREATER_THAN", 5000000);

export class MeasureValueFilterComponentPercentageExample extends React.PureComponent {
    public state = {
        filters: [],
    };

    public onApply = (filter: IMeasureValueFilter) => {
        this.setState({ filters: [filter] });
    };

    public render() {
        const { filters } = this.state;

        return (
            <React.Fragment>
                <MeasureValueFilter
                    onApply={this.onApply}
                    filter={filters[0]}
                    buttonTitle={measureTitle}
                    usePercentage
                />
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-pivot-table">
                    <PivotTable measures={measures} rows={attributes} filters={filters} />
                </div>
            </React.Fragment>
        );
    }
}

export default MeasureValueFilterComponentPercentageExample;
