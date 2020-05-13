// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { measureIdentifier, IMeasureValueFilter } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../../ldm";

const measures = [LdmExt.FranchiseFees, LdmExt.FranchisedSales];
const attributes = [Ldm.LocationName.Default];

// TODO: Decide whether MeasureValueFilterDropdown will accept these props
// interface IDropdownButtonProps {
//     isActive?: boolean;
//     measureTitle: string;
//     operator: string;
//     operatorTitle: string;
//     onClick: () => void;
//     value: {
//         to: string;
//         from: string;
//         value: string;
//     };
// }
// const DropdownButton: React.FC<IDropdownButtonProps> = props => {
//     const { onClick, measureTitle, isActive, operatorTitle, operator, value } = props;
//     const mainColor = isActive ? "#0e69c9" : "#1787ff";
//     const style = {
//         color: "#fff",
//         fontSize: "1rem",
//         backgroundColor: mainColor,
//         borderColor: mainColor,
//         borderRadius: ".5rem",
//         margin: ".15rem",
//         padding: ".5rem 1.5rem",
//         boxShadow: isActive ? "rgba(0, 0, 0, 0.25) 2px 4px 5px 0px" : "rgba(0, 0, 0, 0.2) 1px 3px 5px 0px",
//         transition:
//             "box-shadow .25s ease-in-out, background-color .25s ease-in-out, border-color .25s ease-in-out",
//     };

//     let status = "-";
//     if (isComparisonConditionOperator(operator)) {
//         status = `${operatorTitle} ${value.value}`;
//     } else if (isRangeConditionOperator(operator)) {
//         status = `${operatorTitle} ${value.from} - ${value.to}`;
//     }

//     return (
//         <button style={style} onClick={onClick}>
//             {measureTitle || "Measure"}
//             <br />
//             {status}
//         </button>
//     );
// };

const style = { height: 300 };

export const MeasureValueFilterDropdownCustomButtonExample: React.FC = () => {
    const [filter, setFilter] = useState<IMeasureValueFilter | undefined>();

    const onApply = (filter: IMeasureValueFilter) => {
        setFilter(filter);
    };

    return (
        <div>
            <MeasureValueFilterDropdown
                onApply={onApply}
                // TODO: Decide whether MeasureValueFilterDropdown will accept these props
                // button={DropdownButton}
                // measureTitle={franchiseSalesMeasure.measure.title}
                measureIdentifier={measureIdentifier(LdmExt.FranchiseFees)}
                filter={filter || undefined}
            />
            <hr className="separator" />
            <div style={style} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={filter ? [filter] : []} />
            </div>
        </div>
    );
};
