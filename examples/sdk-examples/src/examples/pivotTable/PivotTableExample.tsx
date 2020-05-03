// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

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
    hasError,
    className,
}) => {
    const backend = useBackend();

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
            <PivotTable
                backend={backend}
                workspace={hasError ? "incorrectProjectId" : workspace}
                measures={measures}
                rows={attributes}
                columns={columns}
                pageSize={20}
            />
        </div>
    );
};
