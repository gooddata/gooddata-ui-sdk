// (C) 2023-2025 GoodData Corporation
import React from "react";

import { IAttribute, IMeasure, IMeasureDefinition, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";

import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const measuresOfDatetimeAddWithAllGranularities = [
    ReferenceMd.DatetimeAddOfThisYear,
    ReferenceMd.DatetimeAddOfYear,
    ReferenceMd.DatetimeAddOfMonth,
    ReferenceMd.DatetimeAddOfDay,
    ReferenceMd.DatetimeAddOfWeek,
    ReferenceMd.DatetimeAddOfHour,
    ReferenceMd.DatetimeAddOfMinute,
];
const attributesOfClosedAndCreateYear = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];
const filtersOfClosed2011 = [newAbsoluteDateFilter("dt_closedate_timestamp", "2011-01-01", "2011-12-31")];
const measuresOfDatetimeAddWithBetween = [
    ReferenceMd.SumAmountWithDatetimeAddAndBetween,
    ReferenceMd.SumAmountWithDatetimeAddAndNotBetween,
];
const measuresOfDatetimeAddWithCount = [
    ReferenceMd.CountOfSalesRepWithDatetimeAddAndMax,
    ReferenceMd.CountOfSalesRepWithDatetimeAndPrevious,
    ReferenceMd.DatetimeAddWithIfElse,
    ReferenceMd.CountOfSalesRepAndDatetimeCondition,
];
const attributesOfSnapshotAndClosedYear = [
    ReferenceMd.DateDatasets.Snapshot.SnapshotYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const measuresOfDatetimeAddWithPop = [
    ReferenceMd.NoTimeTransformation,
    ReferenceMd.TimeTransformation,
    ReferenceMd.FilterTimeTransformationDatetimeAdd,
    ReferenceMd.TimeTransformationCombined,
];
const filtersOfCreated2010 = [newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2010-03-31")];
const measuresOfDatetimeDiffWithCompare = [
    ReferenceMd.CountOfSalesRepWithDiffAnd3DifferenceParams,
    ReferenceMd.CountOfSalesRepWithDiffAndMaxByAllOther,
    ReferenceMd.CountOfSalesRepsWithDiffAndMaxCondition,
    ReferenceMd.CountOfSalesRepWithDiffAndAdd,
];
const measuresOfDatetimeDiffWithMonth = [
    ReferenceMd.DiffOfMonth2SameParams,
    ReferenceMd.DiffOfMonth2DifferenceParams,
    ReferenceMd.DiffOfMonth2ParamsAndString,
    ReferenceMd.DiffOfMonth3Parameters,
    ReferenceMd.DiffOfMonth3ParamsAndString,
    ReferenceMd.DiffOfMonth3DifferenceParams,
];
const attributesOfClosedAndSnapshotMonth = [
    ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default,
    ReferenceMd.DateDatasets.Snapshot.SnapshotMonthYear.Default,
];
const measuresOfDatetimeDiffWithWeekCheckOthers = [
    ReferenceMd.DiffOfYear2Parameters,
    ReferenceMd.DiffOfYear3Parameters,
    ReferenceMd.DiffOfYearNext,
    ReferenceMd.DiffOfYearPrevious,
    ReferenceMd.DiffOfYearStringAndThis,
    ReferenceMd.DiffOfYearString,
    ReferenceMd.DiffOfYearPreviousAndNext,
];
const attributesOfClosedAndSnapshotYear = [
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Snapshot.SnapshotYear.Default,
];
const measuresOfDatetimeDiffWithWeekCheckParams = [
    ReferenceMd.DiffOfWeek2SameParams,
    ReferenceMd.DiffOfWeek3Parameters,
];
const attributesOfSnapshotWeek = [ReferenceMd.DateDatasets.Snapshot.SnapshotWeekYear.Default];
const measuresOfDatetimeDiffWithYear = [
    ReferenceMd.DiffOfYear2Parameters,
    ReferenceMd.DiffOfYear3Parameters,
    ReferenceMd.DiffOfYearNext,
    ReferenceMd.DiffOfYearPrevious,
    ReferenceMd.DiffOfYearStringAndThis,
    ReferenceMd.DiffOfYearString,
    ReferenceMd.DiffOfYearPreviousAndNext,
];

export interface PivotTableDateArithmeticsCoreProps {
    measure?: IMeasure<IMeasureDefinition>[] | undefined;
    row?: IAttribute[] | undefined;
    column?: IAttribute[] | undefined;
    config: IPivotTableConfig;
}

const PivotTableDateArithmetics: React.FC<PivotTableDateArithmeticsCoreProps> = (props) => {
    const { measures, rows, filters } = props;

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
};

export const PivotTableOfDatetimeAddWithAllGranularities = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithAllGranularities}
            rows={attributesOfClosedAndCreateYear}
            filters={filtersOfClosed2011}
        />
    );
};

export const PivotTableOfDatetimeAddWithBetween = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithBetween}
            rows={attributesOfClosedAndCreateYear}
            filters={filtersOfClosed2011}
        />
    );
};

export const PivotTableOfDatetimeAddWithCount = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithCount}
            rows={attributesOfSnapshotAndClosedYear}
        />
    );
};

export const PivotTableOfDatetimeAddWithPop = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeAddWithPop}
            rows={[ReferenceMd.DateDatasets.Created.CreatedMonthYear.Default]}
            filters={filtersOfCreated2010}
        />
    );
};

export const PivotTableOfDatetimeDiffWithCompare = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithCompare}
            rows={attributesOfClosedAndCreateYear}
        />
    );
};

export const PivotTableOfDatetimeDiffWithMonth = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithMonth}
            rows={attributesOfClosedAndSnapshotMonth}
        />
    );
};

export const PivotTableOfDatetimeDiffWithWeekCheckOthers = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithWeekCheckOthers}
            rows={attributesOfClosedAndSnapshotYear}
        />
    );
};

export const PivotTableOfDatetimeDiffWithWeekCheckParams = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithWeekCheckParams}
            rows={attributesOfSnapshotWeek}
        />
    );
};

export const PivotTableOfDatetimeDiffWithYear: React.FC = () => {
    return (
        <PivotTableDateArithmetics
            measures={measuresOfDatetimeDiffWithYear}
            rows={attributesOfClosedAndSnapshotYear}
        />
    );
};
