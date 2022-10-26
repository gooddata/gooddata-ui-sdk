// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, measureLocalId, modifySimpleMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import * as Md from "../../../md/full";

const FranchisedSales = modifySimpleMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").defaultLocalId(),
);
const FranchisedSalesWithRatio = modifySimpleMeasure(FranchisedSales, (m) =>
    m.format("#,##0.00%").title("Franchise Sales shown in %").ratio().defaultLocalId(),
);

const measureTitle = "Franchised Sales in %";

const measures = [FranchisedSalesWithRatio];

const attributes = [Md.LocationName.Default];

const defaultFilter = {
    measureValueFilter: {
        measure: measures,
    },
};

export const MeasureValueFilterComponentRatioExample: React.FC = () => {
    const [filters, setFilters] = useState<IMeasureValueFilter[]>([]);

    const onApply = (filter: IMeasureValueFilter): void => {
        setFilters([filter ?? defaultFilter]);
    };

    return (
        <React.Fragment>
            <MeasureValueFilter
                onApply={onApply}
                filter={filters[0]}
                buttonTitle={measureTitle}
                warningMessage="The filter uses actual measure values, not percentage."
                measureIdentifier={measureLocalId(FranchisedSalesWithRatio)}
            />
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};

export default MeasureValueFilterComponentRatioExample;
