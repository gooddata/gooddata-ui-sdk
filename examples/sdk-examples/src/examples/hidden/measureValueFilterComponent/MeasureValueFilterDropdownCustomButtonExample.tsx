// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable, MeasureValueFilterDropdown } from "@gooddata/sdk-ui";

import {
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    locationNameDisplayFormIdentifier,
} from "../../../constants/fixtures";
import {
    newMeasure,
    newAttribute,
    isComparisonConditionOperator,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";

const franchiseFeesMeasure = newMeasure(franchiseFeesIdentifier, m =>
    m.format("#,##0").title("Franchise Fees"),
);

const franchiseSalesMeasure = newMeasure(franchisedSalesIdentifier, m =>
    m.format("#,##0").title("Franchise Sales"),
);

const measures = [franchiseFeesMeasure, franchiseSalesMeasure];

const attributes = [newAttribute(locationNameDisplayFormIdentifier)];

interface IDropdownButtonProps {
    isActive?: boolean;
    measureTitle: string;
    operator: string;
    operatorTitle: string;
    onClick: () => void;
    value: {
        to: string;
        from: string;
        value: string;
    };
}

const DropdownButton: React.FC<IDropdownButtonProps> = props => {
    const { onClick, measureTitle, isActive, operatorTitle, operator, value } = props;
    const mainColor = isActive ? "#0e69c9" : "#1787ff";
    const style = {
        color: "#fff",
        fontSize: "1rem",
        backgroundColor: mainColor,
        borderColor: mainColor,
        borderRadius: ".5rem",
        margin: ".15rem",
        padding: ".5rem 1.5rem",
        boxShadow: isActive ? "rgba(0, 0, 0, 0.25) 2px 4px 5px 0px" : "rgba(0, 0, 0, 0.2) 1px 3px 5px 0px",
        transition:
            "box-shadow .25s ease-in-out, background-color .25s ease-in-out, border-color .25s ease-in-out",
    };

    let status = "-";
    if (isComparisonConditionOperator(operator)) {
        status = `${operatorTitle} ${value.value}`;
    } else if (isRangeConditionOperator(operator)) {
        status = `${operatorTitle} ${value.from} - ${value.to}`;
    }

    return (
        <button style={style} onClick={onClick}>
            {measureTitle || "Measure"}
            <br />
            {status}
        </button>
    );
};

const style = { height: 300 };

export const MeasureValueFilterDropdownCustomButtonExample: React.FC = () => {
    const [state, setState] = useState({ filter: null });

    const onApply = filter => {
        setState({ filter });
    };

    const { filter } = state;

    return (
        <div>
            <MeasureValueFilterDropdown
                button={DropdownButton}
                onApply={onApply}
                measureTitle={franchiseSalesMeasure.measure.title}
                measureIdentifier={franchiseSalesMeasure.measure.localIdentifier}
                filter={filter || null}
            />
            <hr className="separator" />
            <div style={style} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filter ? [filter] : []} />
            </div>
        </div>
    );
};
