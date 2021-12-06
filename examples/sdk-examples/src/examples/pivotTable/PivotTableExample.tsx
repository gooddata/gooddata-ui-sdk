// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { Md, MdExt } from "../../md";

interface IPivotTableExampleProps {
    className?: string;
    withMeasures?: boolean;
    withAttributes?: boolean;
    withPivot?: boolean;
    hasError?: boolean;
}

const style = { height: 300 };

export const PivotTableExample: React.FC<IPivotTableExampleProps> = ({
    withMeasures,
    withAttributes,
    withPivot,
    className,
}) => {
    const measures = withMeasures
        ? [
              MdExt.FranchiseFees,
              MdExt.FranchiseFeesAdRoyalty,
              MdExt.FranchiseFeesInitialFranchiseFee,
              MdExt.FranchiseFeesOngoingRoyalty,
          ]
        : [];

    const attributes = withAttributes ? [Md.LocationState, Md.LocationName.Default, Md.MenuCategory] : [];

    const columns = withPivot ? [Md.DateQuarter, Md.DateMonth.Short] : [];

    return (
        <div style={style} className={className}>
            <PivotTable measures={measures} rows={attributes} columns={columns} pageSize={20} />
        </div>
    );
};
