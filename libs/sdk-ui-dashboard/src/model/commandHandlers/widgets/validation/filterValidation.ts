// (C) 2021 GoodData Corporation
import { InsightDateDatasets, queryDateDatasetsForInsight } from "../../../queries";
import { call, SagaReturnType, select } from "redux-saga/effects";
import { query } from "../../../state/_infra/queryCall";
import { newCatalogDateDatasetMap } from "../../../../_staging/metadata/objRefMap";
import { invalidArgumentsProvided } from "../../../events/general";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { resolveDisplayFormMetadata } from "../../../utils/displayFormResolver";
import isEmpty from "lodash/isEmpty";
import { selectFilterContextAttributeFilters } from "../../../state/filterContext/filterContextSelectors";
import { ICatalogDateDataset, IDashboardAttributeFilter, IInsightWidget } from "@gooddata/sdk-backend-spi";

/**
 * This generator validates that a date dataset with the provided ref can be used for date filtering of insight in
 * particular insight widget. If the result is positive, a normalized ref of the date dataset will be returned - this ref
 * should be used going forward, stored in state etc etc. If the result is negative a DashboardCommandFailed will be
 * thrown.
 *
 * The validation will trigger the QueryInsightDateDatasets to obtain a list of all available, valid date datasets for
 * the insight widget - that's where the actual complex logic takes place.
 *
 * Note that the query is a cached query - first execution will cache all available date dataset information in state and
 * the subsequent calls will be instant.
 *
 * @param ctx - dashboard context in which the validation is done
 * @param widget - insight that whose date filter is about to change
 * @param dateDataSet - ref of a date dataset to validate
 * @param correlationId - correlation id to use in any events that may be raised during the validation
 */
export function* validateDatasetForInsightWidgetDateFilter(
    ctx: DashboardContext,
    widget: IInsightWidget,
    dateDataSet: ObjRef,
    correlationId: string | undefined,
): SagaIterator<ICatalogDateDataset> {
    const insightDateDatasets: InsightDateDatasets = yield call(
        query,
        queryDateDatasetsForInsight(widget.insight),
    );
    const catalogDataSet = newCatalogDateDatasetMap(insightDateDatasets.allAvailableDateDatasets).get(
        dateDataSet,
    );

    if (!catalogDataSet) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to use date dataset ${objRefToString(dateDataSet)} 
            to filter insight widget ${objRefToString(widget.ref)} but the data set either does not exist or 
            is not valid to use for filtering the insight.`,
            correlationId,
        );
    }

    return catalogDataSet;
}

/**
 * This generator validates whether it is possible to disable attribute filtering based on the refs of attribute display forms.
 * The validation is not widget-specific - it does not need any info from the widget. It validates that the display forms
 * used to specify filters to ignore are valid and that they are actually used in attribute filters that are currently
 * on the dashboard.
 *
 * If the result is positive, a list of normalized display form refs will be returned - these refs should be used going forward, stored in state etc. If the
 * result is negative a DashboardCommandFailed will be thrown.
 *
 * The validation may be trigger asynchronous processing when a display form cannot be resolved directly from the workspace
 * catalog that is stored in state. This can happen in two cases:
 *
 * -  ref is for a display form that is not part of production workspace catalog that is stored in the state; for instance
 *    happens when there are CSV, non-production datasets loaded and used on some of the dashboard insights
 * -  ref is for a bogus display form; code must check on backend and will find that backend has no such display form
 *    and will eventually bomb
 *
 * @param ctx - dashboard context in which the validation is done
 * @param toIgnore - refs of display forms used in attribute filters that should be ignored
 * @param correlationId - correlation id to use in any events that may be raised during the validation
 */
export function* validateAttributeFiltersToIgnore(
    ctx: DashboardContext,
    toIgnore: ObjRef[],
    correlationId: string | undefined,
): SagaIterator<IDashboardAttributeFilter[]> {
    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        toIgnore,
    );
    const { missing, resolved } = resolvedDisplayForms;

    if (!isEmpty(missing)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to disable attribute filters but some of the display form refs to disable filters by do not exist: ${missing
                .map(objRefToString)
                .join(", ")}`,
            correlationId,
        );
    }

    const existingFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const badIgnores: ObjRef[] = [];
    const filtersToIgnore: IDashboardAttributeFilter[] = [];

    for (const toIgnore of resolved.values()) {
        const filterForDisplayForm = existingFilters.find((filter) =>
            areObjRefsEqual(filter.attributeFilter.displayForm, toIgnore.ref),
        );

        if (!filterForDisplayForm) {
            badIgnores.push(toIgnore.ref);
        } else {
            filtersToIgnore.push(filterForDisplayForm);
        }
    }

    if (!isEmpty(badIgnores)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to disable attribute filters but some of the display form refs to disable filters by are not used for filtering at all: ${badIgnores
                .map(objRefToString)
                .join(", ")}`,
            correlationId,
        );
    }

    return filtersToIgnore;
}
