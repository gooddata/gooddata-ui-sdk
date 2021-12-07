// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesAdRoyalty"),
);
const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0").localId("franchiseFeesInitialFranchiseFee"),
);
const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId("franchiseFeesOngoingRoyalty"),
);

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
              FranchiseFees,
              FranchiseFeesAdRoyalty,
              FranchiseFeesInitialFranchiseFee,
              FranchiseFeesOngoingRoyalty,
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
