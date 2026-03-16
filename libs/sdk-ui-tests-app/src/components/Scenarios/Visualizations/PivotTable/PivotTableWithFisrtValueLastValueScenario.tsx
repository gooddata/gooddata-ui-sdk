// (C) 2023-2026 GoodData Corporation

import {
    type IAbsoluteDateFilter,
    type IAttribute,
    type IMeasure,
    type IMeasureDefinition,
    type IPositiveAttributeFilter,
    newAbsoluteDateFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import * as ReferenceMd from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

const measuresOfFirstValueLastValueWithBy = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfAmountBySalesRep,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.LastValueOfAmountBySalesRep,
];
const measuresOfFirstValueLastValueWithOrder = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfAmountOrderAsc,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfAmountOrderDesc,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.LastValueOfAmountOrderAsc,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.LastValueOfAmountOrderDesc,
];
const measuresOfFirstValueLastValueWithAmount = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.ForNextFirstValueOfAmount,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.ForNextLastValueOfAmount,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.ForPreviousFirstValueOfAmount,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.ForPreviousLastValueOfAmount,
];
const attributesOfSaleRepAndClosedYear = [
    ReferenceMd.SalesRep.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const filtersOfSaleRep1Value = [newPositiveAttributeFilter("attr.f_owner.salesrep", ["Adam Bradley"])];
const measuresOfFirstValueLastValueWithPrevious = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfAmountWithPrevious,
    // @ts-expect-error Pre-existing issue, never reported
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
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfAmountByQuarter,
    // @ts-expect-error Pre-existing issue, never reported
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
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfRankAmount,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.LastValueOfRankAmount,
];
const attributesOfClosedAndDepartment = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.Department.Default,
];
const filtersOfClosedYear = [newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2012-12-31")];
const measuresOfFirstValueLastValueWithRunSum = [
    ReferenceMd.Amount,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.RunsumFirstValueOfAmountWithCondition,
    // @ts-expect-error Pre-existing issue, never reported
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
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FirstValueOfRunvarAmount,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.LastValueOfRunvarAmount,
];
const filtersOfCreatedYearAndSaleRep2Values = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2008-01-01", "2010-12-31"),
    newPositiveAttributeFilter("attr.f_owner.salesrep", ["Adam Bradley", "Alejandro Vabiano"]),
];

export interface IPivotTableFirstValueLastValueCoreProps {
    measures?: IMeasure<IMeasureDefinition>[] | undefined;
    rows?: IAttribute[] | undefined;
    filters?: (IPositiveAttributeFilter | IAbsoluteDateFilter)[] | undefined;
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
