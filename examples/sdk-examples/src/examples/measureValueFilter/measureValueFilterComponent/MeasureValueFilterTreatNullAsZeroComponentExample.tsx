// (C) 2007-2020 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { measureLocalId, newMeasureValueFilter } from "@gooddata/sdk-model";
import { LdmExt } from "../../../md";

const measureTitle = "Sum of Number";

const defaultMeasureValueFilter = newMeasureValueFilter(LdmExt.sumOfNumber, "BETWEEN", -30, 30, 0);

const measures = [LdmExt.sumOfNumber];

const attributes = [LdmExt.nameAttribute];

const MeasureValueFilterTreatNullAsZeroComponentExample: React.FC = () => {
    const [filters, setFilters] = useState([defaultMeasureValueFilter]);

    return (
        <React.Fragment>
            <MeasureValueFilter
                onApply={(f) => setFilters([f])}
                filter={filters[0]}
                buttonTitle={measureTitle}
                displayTreatNullAsZeroOption
                measureIdentifier={measureLocalId(LdmExt.sumOfNumber)}
            />
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};

export default MeasureValueFilterTreatNullAsZeroComponentExample;
