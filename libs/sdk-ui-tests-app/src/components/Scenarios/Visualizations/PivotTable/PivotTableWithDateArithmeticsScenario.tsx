// (C) 2023-2026 GoodData Corporation

import {
    type IAbsoluteDateFilter,
    type IAttribute,
    type IMeasure,
    type IMeasureDefinition,
    type IPositiveAttributeFilter,
    newAbsoluteDateFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import * as ReferenceMd from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

const measuresOfDatetimeAddWithAllGranularities = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfThisYear,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfYear,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfMonth,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfDay,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfWeek,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfHour,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddOfMinute,
];
const attributesOfClosedAndCreateYear = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];
const filtersOfClosed2011 = [newAbsoluteDateFilter("dt_closedate_timestamp", "2011-01-01", "2011-12-31")];
const measuresOfDatetimeAddWithBetween = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.SumAmountWithDatetimeAddAndBetween,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.SumAmountWithDatetimeAddAndNotBetween,
];
const measuresOfDatetimeAddWithCount = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepWithDatetimeAddAndMax,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepWithDatetimeAndPrevious,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DatetimeAddWithIfElse,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepAndDatetimeCondition,
];
const attributesOfSnapshotAndClosedYear = [
    ReferenceMd.DateDatasets.Snapshot.SnapshotYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const measuresOfDatetimeAddWithPop = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.NoTimeTransformation,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.TimeTransformation,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.FilterTimeTransformationDatetimeAdd,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.TimeTransformationCombined,
];
const filtersOfCreated2010 = [newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2010-03-31")];
const measuresOfDatetimeDiffWithCompare = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepWithDiffAnd3DifferenceParams,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepWithDiffAndMaxByAllOther,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepsWithDiffAndMaxCondition,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.CountOfSalesRepWithDiffAndAdd,
];
const measuresOfDatetimeDiffWithMonth = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfMonth2SameParams,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfMonth2DifferenceParams,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfMonth2ParamsAndString,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfMonth3Parameters,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfMonth3ParamsAndString,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfMonth3DifferenceParams,
];
const attributesOfClosedAndSnapshotMonth = [
    ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default,
    ReferenceMd.DateDatasets.Snapshot.SnapshotMonthYear.Default,
];
const measuresOfDatetimeDiffWithWeekCheckOthers = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYear2Parameters,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYear3Parameters,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearNext,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearPrevious,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearStringAndThis,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearString,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearPreviousAndNext,
];
const attributesOfClosedAndSnapshotYear = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Snapshot.SnapshotYear.Default,
];
const measuresOfDatetimeDiffWithWeekCheckParams = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfWeek2SameParams,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfWeek3Parameters,
];
const attributesOfSnapshotWeek = [ReferenceMd.DateDatasets.Snapshot.SnapshotWeekYear.Default];
const measuresOfDatetimeDiffWithYear = [
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYear2Parameters,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYear3Parameters,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearNext,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearPrevious,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearStringAndThis,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearString,
    // @ts-expect-error Pre-existing issue, never reported
    ReferenceMd.DiffOfYearPreviousAndNext,
];

export interface IPivotTableDateArithmeticsCoreProps {
    measures?: IMeasure<IMeasureDefinition>[] | undefined;
    rows?: IAttribute[] | undefined;
    columns?: IAttribute[] | undefined;
    filters?: (IAbsoluteDateFilter | IPositiveAttributeFilter)[];
}

function PivotTableDateArithmetics({ measures, rows, filters }: IPivotTableDateArithmeticsCoreProps) {
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

export function PivotTableOfDatetimeAddWithAllGranularities() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithAllGranularities}
            rows={attributesOfClosedAndCreateYear}
            filters={filtersOfClosed2011}
        />
    );
}

export function PivotTableOfDatetimeAddWithBetween() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithBetween}
            rows={attributesOfClosedAndCreateYear}
            filters={filtersOfClosed2011}
        />
    );
}

export function PivotTableOfDatetimeAddWithCount() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithCount}
            rows={attributesOfSnapshotAndClosedYear}
        />
    );
}

export function PivotTableOfDatetimeAddWithPop() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithPop}
            rows={[ReferenceMd.DateDatasets.Created.CreatedMonthYear.Default]}
            filters={filtersOfCreated2010}
        />
    );
}

export function PivotTableOfDatetimeDiffWithCompare() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithCompare}
            rows={attributesOfClosedAndCreateYear}
        />
    );
}

export function PivotTableOfDatetimeDiffWithMonth() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithMonth}
            rows={attributesOfClosedAndSnapshotMonth}
        />
    );
}

export function PivotTableOfDatetimeDiffWithWeekCheckOthers() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithWeekCheckOthers}
            rows={attributesOfClosedAndSnapshotYear}
        />
    );
}

export function PivotTableOfDatetimeDiffWithWeekCheckParams() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithWeekCheckParams}
            rows={attributesOfSnapshotWeek}
        />
    );
}

export function PivotTableOfDatetimeDiffWithYear() {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithYear}
            rows={attributesOfClosedAndSnapshotYear}
        />
    );
}
