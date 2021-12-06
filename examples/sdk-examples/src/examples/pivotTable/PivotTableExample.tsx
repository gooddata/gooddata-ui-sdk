// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { Ldm, LdmExt } from "../../md";

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
              LdmExt.FranchiseFees,
              LdmExt.FranchiseFeesAdRoyalty,
              LdmExt.FranchiseFeesInitialFranchiseFee,
              LdmExt.FranchiseFeesOngoingRoyalty,
          ]
        : [];

    const attributes = withAttributes ? [Ldm.LocationState, Ldm.LocationName.Default, Ldm.MenuCategory] : [];

    const columns = withPivot ? [Ldm.DateQuarter, Ldm.DateMonth.Short] : [];

    return (
        <div style={style} className={className}>
            <PivotTable measures={measures} rows={attributes} columns={columns} pageSize={20} />
        </div>
    );
};
