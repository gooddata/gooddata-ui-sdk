// (C) 2020-2022 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { TotalsOrPlaceholders, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as ReferenceMd from "../../../../md/full";
import { newTotal } from "@gooddata/sdk-model";

const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const attributes = [ReferenceMd.Product.Name, ReferenceMd.Department];
const columns = [ReferenceMd.ForecastCategory, ReferenceMd.Region];

const totalsAll: TotalsOrPlaceholders = [
    newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
    newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
];

const totalsOne: TotalsOrPlaceholders = [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)];

interface IPivotTableAggregationsMenuCoreProps {
    totals?: TotalsOrPlaceholders;
}

const PivotTableAggregationsMenuCore: React.FC<IPivotTableAggregationsMenuCoreProps> = (props) => {
    const { totals } = props;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return (
        /* size 1800 is because AG virtualized and it made some problems in cypress */
        <div
            style={{ width: 1800, height: 300, marginTop: 20, resize: "both", overflow: "scroll" }}
            className="s-pivot-table-aggregations-menu"
        >
            <PivotTable
                backend={backend}
                workspace={workspace}
                measures={measures}
                rows={attributes}
                columns={columns}
                config={{
                    menu: {
                        aggregations: true,
                        aggregationsSubMenu: true,
                    },
                }}
                totals={totals}
            />
        </div>
    );
};

export const PivotTableAggregationsMenuScenario = () => {
    return <PivotTableAggregationsMenuCore />;
};

export const PivotTableAggregationsMenuAllTotalScenario = () => {
    return <PivotTableAggregationsMenuCore totals={totalsAll} />;
};

export const PivotTableAggregationsMenuOneTotalScenario = () => {
    return <PivotTableAggregationsMenuCore totals={totalsOne} />;
};
