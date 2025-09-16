// (C) 2023-2025 GoodData Corporation

import {
    IAbsoluteDateFilter,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    IPositiveAttributeFilter,
    newAbsoluteDateFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const measuresOfMaxCase = [ReferenceMd.Amount, ReferenceMd.SumOfAmountWithCaseAndMax];
const attributesOfCountyAndClosedCreated = [
    ReferenceMd.CountyName,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
];
const filtersOfCountyAndClosedDate = [
    newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2011-12-31"),
    newPositiveAttributeFilter("county_name", ["Clark", "Dutchess"]),
];
const measuresOfMaxWithMacroYear = [
    ReferenceMd.SumOfAmountBetweenMaxCreatedYearAndPreviousYear,
    ReferenceMd.SumOfAmountNotBetweenMaxCreatedYearAndThisYear,
];
const attributesOfCreatedAndClosedYear = [
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const measuresOfMinWithByAllOther = [
    ReferenceMd.Amount,
    ReferenceMd.SumOfAmountWithMinAndByAllOther,
    ReferenceMd.SumOfAmountWithMinAndByAllOtherExcept,
];
const filtersOfCreatedAndClosedYear = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2010-01-01", "2012-12-31"),
    newAbsoluteDateFilter("dt_closedate_timestamp", "2010-01-01", "2012-12-31"),
];
const filtersOfCreated2011 = [newAbsoluteDateFilter("dt_oppcreated_timestamp", "2011-01-01", "2011-12-31")];
const measuresOfMinWithIfThen = [ReferenceMd.Amount, ReferenceMd.SumOfAmountWithIfHavingAndMin];
const attributesOfCountyAndCreatedClosed = [
    ReferenceMd.CountyName,
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
];
const filtersOfCountyAndCreatedDate = [
    newAbsoluteDateFilter("dt_oppcreated_timestamp", "2009-01-01", "2010-12-31"),
    newPositiveAttributeFilter("county_name", ["Clark", "Dutchess"]),
];

export interface PivotTableMaxMinCoreProps {
    measures?: IMeasure<IMeasureDefinition>[] | undefined;
    rows?: IAttribute[] | undefined;
    column?: IAttribute[] | undefined;
    filters?: (IAbsoluteDateFilter | IPositiveAttributeFilter)[];
}

function PivotTableMaxMin(props: PivotTableMaxMinCoreProps) {
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
}

export function PivotTableOfMaxWithCaseWhen() {
    return (
        <PivotTableMaxMin
            measures={measuresOfMaxCase}
            rows={attributesOfCountyAndClosedCreated}
            filters={filtersOfCountyAndClosedDate}
        />
    );
}

export function PivotTableOfMaxWithMacroYear() {
    return (
        <PivotTableMaxMin
            measures={measuresOfMaxWithMacroYear}
            rows={attributesOfCreatedAndClosedYear}
            filters={filtersOfCreated2011}
        />
    );
}

export function PivotTableOfMinWithByAllOther() {
    return (
        <PivotTableMaxMin
            measures={measuresOfMinWithByAllOther}
            rows={attributesOfCreatedAndClosedYear}
            filters={filtersOfCreatedAndClosedYear}
        />
    );
}

export function PivotTableOfMinWithIfThen() {
    return (
        <PivotTableMaxMin
            measures={measuresOfMinWithIfThen}
            rows={attributesOfCountyAndCreatedClosed}
            filters={filtersOfCountyAndCreatedDate}
        />
    );
}
