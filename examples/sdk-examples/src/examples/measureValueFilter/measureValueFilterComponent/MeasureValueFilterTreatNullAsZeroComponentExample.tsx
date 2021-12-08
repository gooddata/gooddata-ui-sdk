// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { measureLocalId, newAttribute, newMeasure, newMeasureValueFilter } from "@gooddata/sdk-model";

const sumOfNumberIdentifier = "fact.csv_4dates.number";
const nameAttributeIdentifier = "label.csv_4dates.name";
const sumOfNumber = newMeasure(sumOfNumberIdentifier, (m) =>
    m.aggregation("sum").localId("sumOfNumber").alias("Sum of Number"),
);
const nameAttribute = newAttribute(nameAttributeIdentifier, (a) => a.localId("nameAttribute"));

const measureTitle = "Sum of Number";

const defaultMeasureValueFilter = newMeasureValueFilter(sumOfNumber, "BETWEEN", -30, 30, 0);

const measures = [sumOfNumber];

const attributes = [nameAttribute];

const MeasureValueFilterTreatNullAsZeroComponentExample: React.FC = () => {
    const [filters, setFilters] = useState([defaultMeasureValueFilter]);

    return (
        <React.Fragment>
            <MeasureValueFilter
                onApply={(f) => setFilters([f])}
                filter={filters[0]}
                buttonTitle={measureTitle}
                displayTreatNullAsZeroOption
                measureIdentifier={measureLocalId(sumOfNumber)}
            />
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filters} />
            </div>
        </React.Fragment>
    );
};

export default MeasureValueFilterTreatNullAsZeroComponentExample;
