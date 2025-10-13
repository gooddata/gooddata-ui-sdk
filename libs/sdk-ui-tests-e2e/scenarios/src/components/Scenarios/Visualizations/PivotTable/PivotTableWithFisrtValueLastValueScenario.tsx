// (C) 2023-2025 GoodData Corporation

import {
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    newAbsoluteDateFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";

import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const measuresOfFirstValueLastValueWithBy = [
    ReferenceMd.FirstValueOfAmountBySalesRep,
    ReferenceMd.LastValueOfAmountBySalesRep,
];
const measuresOfFirstValueLastValueWithOrder = [
    ReferenceMd.FirstValueOfAmountOrderAsc,
    ReferenceMd.FirstValueOfAmountOrderDesc,
    ReferenceMd.LastValueOfAmountOrderAsc,
    ReferenceMd.LastValueOfAmountOrderDesc,
];
const measuresOfFirstValueLastValueWithAmount = [
    ReferenceMd.ForNextFirstValueOfAmount,
    ReferenceMd.ForNextLastValueOfAmount,
    ReferenceMd.ForPreviousFirstValueOfAmount,
    ReferenceMd.ForPreviousLastValueOfAmount,
];
const attributesOfSaleRepAndClosedYear = [
    ReferenceMd.SalesRep.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const filtersOfSaleRep1Value = [newPositiveAttributeFilter("attr.f_owner.salesrep", ["Adam Bradley"])];
const measuresOfFirstValueLastValueWithPrevious = [
    ReferenceMd.FirstValueOfAmountWithPrevious,
    ReferenceMd.LastValueOfAmountWithPrevious,
];
const filtersOfSaleRep3Values = [
    newPositiveAttributeFilter("attr.f_owner.salesrep", [
        "Alejandro Vabiano",
        "Adam Bradley",
        "Alexsandr Fyodr",
    ]),
];
const measuresOfFirstValueLastValueWithQuarter = [
    ReferenceMd.FirstValueOfAmountByQuarter,
    ReferenceMd.LastValueOfAmountByQuarter,
];
const attributesOfSaleRepAndClosedQuarter = [
    ReferenceMd.SalesRep.Default,
    ReferenceMd.DateDatasets.Closed.ClosedQuarterYear.Default,
];
const filtersOfClosedAndSaleRep = [
    newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2011-12-31"),
    newPositiveAttributeFilter("attr.f_owner.salesrep", ["Ellen Jones"]),
];
const measuresOfFirstValueLastValueWithRank = [
    ReferenceMd.Amount,
    ReferenceMd.FirstValueOfRankAmount,
    ReferenceMd.LastValueOfRankAmount,
];
const attributesOfClosedAndDepartment = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.Department.Default,
];
const filtersOfClosedYear = [newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2012-12-31")];
const measuresOfFirstValueLastValueWithRunSum = [
    ReferenceMd.Amount,
    ReferenceMd.RunsumFirstValueOfAmountWithCondition,
    ReferenceMd.RunsumLastValueOfAmountWithCondition,
];
const attributesOfSaleRepAndCreatedYear = [
    ReferenceMd.SalesRep.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];
const filtersOfCreatedYearAndSaleRep3Values = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2011-12-31"),
    newPositiveAttributeFilter("attr.f_owner.salesrep", [
        "Alejandro Vabiano",
        "Adam Bradley",
        "Alexsandr Fyodr",
    ]),
];
const measuresOfFirstValueLastValueWithRunVar = [
    ReferenceMd.Amount,
    ReferenceMd.FirstValueOfRunvarAmount,
    ReferenceMd.LastValueOfRunvarAmount,
];
const filtersOfCreatedYearAndSaleRep2Values = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2008-01-01", "2010-12-31"),
    newPositiveAttributeFilter("attr.f_owner.salesrep", ["Adam Bradley", "Alejandro Vabiano"]),
];

export interface IPivotTableFirstValueLastValueCoreProps {
    measure?: IMeasure<IMeasureDefinition>[] | undefined;
    row?: IAttribute[] | undefined;
    column?: IAttribute[] | undefined;
    config: IPivotTableConfig;
}

function PivotTableFirstValueLastValue({ measures, rows, filters }: IPivotTableFirstValueLastValueCoreProps) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return (
        <div style={{ height: 300 }} className="s-pivot-table">
            <PivotTable
                backend={backend}
                workspace={workspace}
                measures={measures}
                rows={rows}
                filters={filters}
            />
        </div>
    );
}

export function PivotTableOfFirstLastValueWithinAttribute() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithBy}
            rows={[ReferenceMd.DateDatasets.Created.CreatedYear.Default]}
        />
    );
}

export function PivotTableOfFirstLastValueWithOrder() {
    return <PivotTableFirstValueLastValue measures={measuresOfFirstValueLastValueWithOrder} />;
}

export function PivotTableOfFirstLastValueWithPop() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithAmount}
            rows={attributesOfSaleRepAndClosedYear}
            filters={filtersOfSaleRep1Value}
        />
    );
}

export function PivotTableOfFirstLastValueWithPrevious() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithPrevious}
            rows={[ReferenceMd.SalesRep.Default]}
            filters={filtersOfSaleRep3Values}
        />
    );
}

export function PivotTableOfFirstLastValueWithQuarter() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithQuarter}
            rows={attributesOfSaleRepAndClosedQuarter}
            filters={filtersOfClosedAndSaleRep}
        />
    );
}

export function PivotTableOfFirstLastValueWithRank() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithRank}
            rows={attributesOfClosedAndDepartment}
            filters={filtersOfClosedYear}
        />
    );
}

export function PivotTableOfFirstLastValueWithRunSum() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithRunSum}
            rows={attributesOfSaleRepAndCreatedYear}
            filters={filtersOfCreatedYearAndSaleRep3Values}
        />
    );
}

export function PivotTableOfFirstLastValueWithRunVar() {
    return (
        <PivotTableFirstValueLastValue
            measures={measuresOfFirstValueLastValueWithRunVar}
            rows={attributesOfSaleRepAndCreatedYear}
            filters={filtersOfCreatedYearAndSaleRep2Values}
        />
    );
}
