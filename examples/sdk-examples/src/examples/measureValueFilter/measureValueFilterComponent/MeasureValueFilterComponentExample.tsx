// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { IMeasureValueFilter, measureLocalId, modifyMeasure } from "@gooddata/sdk-model";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import * as Md from "../../../md/full";

const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const measureTitle = "Franchised Sales";
const measures = [FranchisedSales];

const attributes = [Md.LocationName.Default];

const defaultFilter = {
    measureValueFilter: {
        measure: measures,
    },
};

export const MeasureValueFilterComponentExample: React.FC = () => {
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
                measureIdentifier={measureLocalId(FranchisedSales)}
            />
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};

export default MeasureValueFilterComponentExample;
