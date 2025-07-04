// (C) 2020-2025 GoodData Corporation
import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";
import { TotalsOrPlaceholders, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import { newTotal } from "@gooddata/sdk-model";

const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const attributes = [ReferenceMd.Product.Name, ReferenceMd.Department];
const columns = [ReferenceMd.ForecastCategory, ReferenceMd.Region];

const totalsAll: TotalsOrPlaceholders = [
    newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
    newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
];

const totalsOne: TotalsOrPlaceholders = [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)];

const columnTotalsAll: TotalsOrPlaceholders = [
    newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
    newTotal("sum", ReferenceMd.Won, ReferenceMd.ForecastCategory),
];

const columnTotalsOne: TotalsOrPlaceholders = [
    newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
];

const rowSubtotalsOne: TotalsOrPlaceholders = [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region)];

const pivotTableConfig: IPivotTableConfig = {
    menu: {
        aggregations: true,
    },
};

const columnPivotTableConfig: IPivotTableConfig = {
    menu: {
        aggregations: true,
        aggregationsSubMenuForRows: true,
    },
};

interface IPivotTableAggregationsMenuCoreProps {
    config: IPivotTableConfig;
    totals?: TotalsOrPlaceholders;
}

function PivotTableAggregationsMenuCore({ totals, config }: IPivotTableAggregationsMenuCoreProps) {
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
                config={config}
                totals={totals}
            />
        </div>
    );
}

export function PivotTableAggregationsMenuScenario() {
    return <PivotTableAggregationsMenuCore config={pivotTableConfig} />;
}

export function PivotTableAggregationsMenuAllTotalScenario() {
    return <PivotTableAggregationsMenuCore config={pivotTableConfig} totals={totalsAll} />;
}

export function PivotTableAggregationsMenuOneTotalScenario() {
    return <PivotTableAggregationsMenuCore config={pivotTableConfig} totals={totalsOne} />;
}

export function PivotTableColumnsAggegationsMenuScenario() {
    return <PivotTableAggregationsMenuCore config={columnPivotTableConfig} />;
}

export function PivotTableAggregationsMenuOneColumnTotalScenario() {
    return <PivotTableAggregationsMenuCore config={columnPivotTableConfig} totals={columnTotalsOne} />;
}

export function PivotTableColumnsAggregationsMenuAllTotalScenario() {
    return <PivotTableAggregationsMenuCore config={columnPivotTableConfig} totals={columnTotalsAll} />;
}

export function PivotTableColumnsAggregationsMenuOneSubtotalScenario() {
    return <PivotTableAggregationsMenuCore config={columnPivotTableConfig} totals={rowSubtotalsOne} />;
}
