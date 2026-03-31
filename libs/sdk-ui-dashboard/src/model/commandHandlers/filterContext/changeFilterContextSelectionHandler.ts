// (C) 2021-2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { compact, partition, uniqBy } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, put, select } from "redux-saga/effects";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionType,
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type ObjRef,
    areObjRefsEqual,
    attributeElementsIsEmpty,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemFilterElementsByDate,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemValidateElementsBy,
    getAttributeElementsItems,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardTextAttributeFilter,
    isSingleSelectionFilter,
    isUriRef,
    objRefToString,
    serializeObjRef,
    updateAttributeElementsItems,
} from "@gooddata/sdk-model";

import { resolveAndRegisterDisplayFormMetadata } from "./attributeFilter/resolveDisplayFormMetadata.js";
import { canApplyDateFilter, dispatchFilterContextChanged } from "./common.js";
import { dashboardFilterToFilterContextItem } from "../../../_staging/dashboard/dashboardFilterContext.js";
import { type ChangeFilterContextSelection } from "../../commands/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectAttributeFilterConfigsOverridesByTab,
    selectAttributeFilterConfigsSelectionTypeMap,
    selectAttributeFilterConfigsSelectionTypeMapByTab,
} from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    type IUpdateAttributeFilterSelectionPayload,
    type IUpsertDateFilterPayload,
} from "../../store/tabs/filterContext/filterContextReducers.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilterByDisplayFormForTab,
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilterByLocalIdForTab,
    selectFilterContextAttributeFilterItemByLocalId,
    selectFilterContextAttributeFilterItemByLocalIdForTab,
    selectFilterContextAttributeFilterItems,
    selectFilterContextAttributeFilterItemsForTab,
    selectFilterContextAttributeFilters,
    selectFilterContextAttributeFiltersForTab,
    selectFilterContextDateFilterByDataSet,
    selectFilterContextDateFilterByDataSetForTab,
    selectFilterContextDateFiltersWithDimension,
    selectFilterContextDateFiltersWithDimensionForTab,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { resolveAttributeMetadata } from "../../utils/attributeResolver.js";
import {
    type DisplayFormResolutionResult,
    resolveDisplayFormMetadata,
} from "../../utils/displayFormResolver.js";

// Tab-aware select helpers — encapsulate the "if tab select ForTab else select" pattern.
// Named after the base selector they wrap.
function* selectFilterContextAttributeFilterByDisplayFormTabAware(
    displayForm: ObjRef,
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm>>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextAttributeFilterByDisplayFormForTab(displayForm, tabLocalIdentifier))
        : yield select(selectFilterContextAttributeFilterByDisplayForm(displayForm));
}

function* selectFilterContextAttributeFilterItemByLocalIdTabAware(
    localId: string,
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextAttributeFilterItemByLocalIdForTab(localId, tabLocalIdentifier))
        : yield select(selectFilterContextAttributeFilterItemByLocalId(localId));
}

function* selectFilterContextAttributeFilterByLocalIdTabAware(
    localId: string,
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextAttributeFilterByLocalIdForTab(localId, tabLocalIdentifier))
        : yield select(selectFilterContextAttributeFilterByLocalId(localId));
}

function* selectFilterContextAttributeFiltersTabAware(
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<typeof selectFilterContextAttributeFilters>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextAttributeFiltersForTab(tabLocalIdentifier))
        : yield select(selectFilterContextAttributeFilters);
}

function* selectFilterContextAttributeFilterItemsTabAware(
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<typeof selectFilterContextAttributeFilterItems>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextAttributeFilterItemsForTab(tabLocalIdentifier))
        : yield select(selectFilterContextAttributeFilterItems);
}

function* selectFilterContextDateFilterByDataSetTabAware(
    dataSet: ObjRef,
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextDateFilterByDataSetForTab(dataSet, tabLocalIdentifier))
        : yield select(selectFilterContextDateFilterByDataSet(dataSet));
}

function* selectFilterContextDateFiltersWithDimensionTabAware(
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<typeof selectFilterContextDateFiltersWithDimension>> {
    return tabLocalIdentifier
        ? yield select(selectFilterContextDateFiltersWithDimensionForTab(tabLocalIdentifier))
        : yield select(selectFilterContextDateFiltersWithDimension);
}

function* selectAttributeFilterConfigsSelectionTypeMapTabAware(
    tabLocalIdentifier?: string,
): SagaIterator<ReturnType<typeof selectAttributeFilterConfigsSelectionTypeMap>> {
    if (tabLocalIdentifier) {
        const byTab: ReturnType<typeof selectAttributeFilterConfigsSelectionTypeMapByTab> = yield select(
            selectAttributeFilterConfigsSelectionTypeMapByTab,
        );
        return byTab[tabLocalIdentifier] ?? new Map();
    }
    return yield select(selectAttributeFilterConfigsSelectionTypeMap);
}

export function* changeFilterContextSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeFilterContextSelection,
): SagaIterator<void> {
    const { filters, resetOthers, attributeFilterConfigs = [], tabLocalIdentifier } = cmd.payload;

    // Validate that the target tab exists if tabLocalIdentifier is provided
    if (tabLocalIdentifier) {
        const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
        const tabExists = tabs?.some((tab) => tab.localIdentifier === tabLocalIdentifier);
        if (!tabExists) {
            yield dispatchDashboardEvent(
                invalidArgumentsProvided(
                    ctx,
                    cmd,
                    `Tab with local identifier "${tabLocalIdentifier}" does not exist.`,
                ),
            );
            return;
        }
    }

    // Cross-filtering is always compatible with dashboard tabs now
    // (removed the check that prevented cross-filtering without tabs)

    const normalizedFilters: FilterContextItem[] = filters.map((filter) => {
        if (isDashboardAttributeFilterItem(filter) || isDashboardDateFilter(filter)) {
            return filter;
        } else {
            return dashboardFilterToFilterContextItem(
                filter,
                !!ctx.backend.capabilities.supportsMultipleDateFilters,
            );
        }
    });

    // Separate text filter types (arbitrary, match) — they use whole-filter replacement
    const textAttributeFiltersRaw = normalizedFilters.filter(
        (filter): filter is DashboardAttributeFilterItem =>
            isDashboardAttributeFilterItem(filter) && !isDashboardAttributeFilter(filter),
    );

    // Deduplicate text filters by localIdentifier (last occurrence wins, matching batch behavior)
    const textAttributeFilters = uniqBy(
        textAttributeFiltersRaw
            .filter((f) => dashboardAttributeFilterItemLocalIdentifier(f))
            .slice()
            .reverse(),
        (f) => dashboardAttributeFilterItemLocalIdentifier(f)!,
    ).reverse();

    const supportedFilters = normalizedFilters.filter(
        (filter): filter is IDashboardAttributeFilter | IDashboardDateFilter =>
            isDashboardAttributeFilter(filter) || isDashboardDateFilter(filter),
    );

    const uniqueFilters = uniqBy(supportedFilters, (filter) => {
        const identification = isDashboardAttributeFilter(filter)
            ? filter.attributeFilter.displayForm
            : filter.dateFilter.dataSet;
        let config;
        if (isDashboardAttributeFilter(filter)) {
            config = attributeFilterConfigs.find(
                (config) => config.localIdentifier === filter.attributeFilter.localIdentifier,
            );
        }
        // do not remove duplicates using same primary label, but different display as label
        const secondaryIdentification = config?.displayAsLabel ? objRefToString(config.displayAsLabel) : "";
        return identification
            ? objRefToString(identification) + secondaryIdentification
            : identification + secondaryIdentification;
    });

    const [dateFilters, attributeFilters] = partition(uniqueFilters, isDashboardDateFilter);

    const [[commonDateFilter], dateFiltersWithDimension] = partition(
        dateFilters,
        isDashboardCommonDateFilter,
    );

    const selectionTypeMap: ReturnType<typeof selectAttributeFilterConfigsSelectionTypeMap> = yield call(
        selectAttributeFilterConfigsSelectionTypeMapTabAware,
        tabLocalIdentifier,
    );

    const [attributeFilterResult, commonDateFilterUpdateActions, dateFiltersUpdateActions]: [
        { actions: AnyAction[]; displayFormsToResolve: ObjRef[] },
        AnyAction[],
        AnyAction[],
    ] = yield all([
        call(
            getAttributeFiltersUpdateActions,
            [...attributeFilters].reverse(),
            textAttributeFilters,
            attributeFilterConfigs,
            resetOthers,
            ctx,
            tabLocalIdentifier,
            selectionTypeMap,
        ),
        call(getDateFilterUpdateActions, commonDateFilter, resetOthers, tabLocalIdentifier),
        call(getDateFiltersUpdateActions, dateFiltersWithDimension, resetOthers, tabLocalIdentifier),
    ]);

    // Ensure display form metadata is loaded for filters that will actually be applied.
    // This handles the case where a default saved view changed filter types (e.g., list→text)
    // and then local storage restores original types whose display forms weren't loaded during init.
    if (attributeFilterResult.displayFormsToResolve.length > 0) {
        const displayFormsMap: ReturnType<typeof selectAttributeFilterDisplayFormsMap> = yield select(
            selectAttributeFilterDisplayFormsMap,
        );
        for (const displayForm of attributeFilterResult.displayFormsToResolve) {
            if (!displayFormsMap.get(displayForm)) {
                yield call(resolveAndRegisterDisplayFormMetadata, displayForm);
            }
        }
    }

    yield put(
        batchActions([
            ...attributeFilterResult.actions,
            ...commonDateFilterUpdateActions,
            ...dateFiltersUpdateActions,
        ]),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd, tabLocalIdentifier);
}

function* getDashboardFilterByAttributeMatching(
    filterRef: ObjRef,
    resolvedDisplayForms: DisplayFormResolutionResult,
    ctx: DashboardContext,
    tabLocalIdentifier?: string,
) {
    if (isUriRef(filterRef) && !ctx.backend.capabilities.supportsObjectUris) {
        throw new NotSupported("Unsupported filter ObjRef! Please provide IdentifierRef instead of UriRef.");
    }

    const filterDF = resolvedDisplayForms.resolved.get(filterRef);
    const resolvedAttribute: SagaReturnType<typeof resolveAttributeMetadata> = yield call(
        resolveAttributeMetadata,
        ctx,
        compact([filterDF?.attribute]),
    );
    const attribute = filterDF?.attribute && resolvedAttribute.resolved.get(filterDF?.attribute);

    for (const displayForm of attribute?.displayForms ?? []) {
        const dashboardFilter: ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm> =
            yield call(
                selectFilterContextAttributeFilterByDisplayFormTabAware,
                displayForm.ref,
                tabLocalIdentifier,
            );
        if (dashboardFilter) {
            return dashboardFilter;
        }
    }
    return null;
}

function* getDashboardFilterByDisplayAsLabelMatching(
    attributeFilter: IDashboardAttributeFilter,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    tabLocalIdentifier?: string,
) {
    let foundByDisplayAsLabel = false;
    let foundByDashboardFilterDisplayAsLabel = false;
    let dashboardFilter: IDashboardAttributeFilter | undefined = undefined;

    const filterRef = attributeFilter.attributeFilter.displayForm;

    const filterConfig = attributeFilterConfigs.find(
        (config) => config.localIdentifier === attributeFilter.attributeFilter.localIdentifier,
    );
    if (filterConfig?.displayAsLabel) {
        dashboardFilter = yield call(
            selectFilterContextAttributeFilterByDisplayFormTabAware,
            filterConfig.displayAsLabel,
            tabLocalIdentifier,
        );
        foundByDisplayAsLabel = !!dashboardFilter;
    }
    if (!foundByDisplayAsLabel) {
        const dashboardFiltersConfigsForActiveTab: SagaReturnType<
            typeof selectAttributeFilterConfigsOverrides
        > = yield select(selectAttributeFilterConfigsOverrides);

        const dashboardFiltersConfigsByTab: SagaReturnType<
            typeof selectAttributeFilterConfigsOverridesByTab
        > = yield select(selectAttributeFilterConfigsOverridesByTab);
        const dashboardFiltersConfigs = tabLocalIdentifier
            ? dashboardFiltersConfigsByTab[tabLocalIdentifier]
            : dashboardFiltersConfigsForActiveTab;
        const matchingDashboardFilterConfig = dashboardFiltersConfigs.find((config) =>
            areObjRefsEqual(config.displayAsLabel, filterRef),
        );
        if (matchingDashboardFilterConfig) {
            dashboardFilter = yield call(
                selectFilterContextAttributeFilterByLocalIdTabAware,
                matchingDashboardFilterConfig?.localIdentifier,
                tabLocalIdentifier,
            );
            foundByDashboardFilterDisplayAsLabel = !!dashboardFilter;
        }
    }
    return { foundByDisplayAsLabel, foundByDashboardFilterDisplayAsLabel, dashboardFilter };
}

function* getAttributeFiltersUpdateActions(
    attributeFilters: IDashboardAttributeFilter[],
    textAttributeFilters: DashboardAttributeFilterItem[],
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    resetOthers: boolean,
    ctx: DashboardContext,
    tabLocalIdentifier?: string,
    selectionTypeMap?: Map<string, DashboardAttributeFilterSelectionType | undefined>,
): SagaIterator<{ actions: AnyAction[]; displayFormsToResolve: ObjRef[] }> {
    const updateActions: AnyAction[] = [];
    const displayFormsToResolve: ObjRef[] = [];
    const handledLocalIds = new Set<string>();
    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        attributeFilters.map((af) => af.attributeFilter.displayForm),
    );

    for (const attributeFilter of attributeFilters) {
        const filterRef = attributeFilter.attributeFilter.displayForm;
        // only attribute filters with elements are relevant
        let dashboardFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm>> =
            yield call(
                selectFilterContextAttributeFilterByDisplayFormTabAware,
                filterRef,
                tabLocalIdentifier,
            );

        if (!dashboardFilter && canMapDashboardFilterFromAnotherDisplayForm(ctx)) {
            dashboardFilter = yield call(
                getDashboardFilterByAttributeMatching,
                filterRef,
                resolvedDisplayForms,
                ctx,
                tabLocalIdentifier,
            );
        }

        let foundByDisplayAsLabel = false;
        let foundByDashboardFilterDisplayAsLabel = false;

        if (!dashboardFilter) {
            const result = yield call(
                getDashboardFilterByDisplayAsLabelMatching,
                attributeFilter,
                attributeFilterConfigs,
                tabLocalIdentifier,
            );
            foundByDisplayAsLabel = result.foundByDisplayAsLabel;
            foundByDashboardFilterDisplayAsLabel = result.foundByDashboardFilterDisplayAsLabel;
            dashboardFilter = result.dashboardFilter;
        }

        const displayFormData = resolvedDisplayForms.resolved.get(filterRef);

        if (dashboardFilter) {
            if (foundByDisplayAsLabel && displayFormData) {
                updateActions.push(
                    // keep the attribute display form field up to date
                    tabsActions.addAttributeFilterDisplayForm(
                        tabLocalIdentifier
                            ? { displayForm: displayFormData, tabLocalIdentifier }
                            : displayFormData,
                    ),
                    tabsActions.changeAttributeDisplayForm({
                        filterLocalId: dashboardFilter.attributeFilter.localIdentifier!,
                        displayForm: filterRef,
                        tabLocalIdentifier,
                    }),
                    // backup current displayForm to the displayAsLabel
                    tabsActions.changeDisplayAsLabel({
                        localIdentifier: dashboardFilter.attributeFilter.localIdentifier!,
                        displayAsLabel: dashboardFilter.attributeFilter.displayForm,
                        tabLocalIdentifier,
                    }),
                );
            }
            if (foundByDashboardFilterDisplayAsLabel && displayFormData) {
                updateActions.push(
                    // keep the attribute display form field up to date
                    tabsActions.addAttributeFilterDisplayForm(
                        tabLocalIdentifier
                            ? { displayForm: displayFormData, tabLocalIdentifier }
                            : displayFormData,
                    ),
                    tabsActions.changeAttributeDisplayForm({
                        filterLocalId: dashboardFilter.attributeFilter.localIdentifier!,
                        displayForm: filterRef,
                        tabLocalIdentifier,
                    }),
                    // clear displayAsLabel
                    tabsActions.changeDisplayAsLabel({
                        localIdentifier: dashboardFilter.attributeFilter.localIdentifier!,
                        displayAsLabel: undefined,
                        tabLocalIdentifier,
                    }),
                );
            }
            displayFormsToResolve.push(filterRef);
            updateActions.push(
                tabsActions.updateAttributeFilterSelection({
                    ...getAttributeFilterSelectionPayload(attributeFilter, dashboardFilter),
                    tabLocalIdentifier,
                }),
            );

            handledLocalIds.add(dashboardFilter.attributeFilter.localIdentifier!);
        } else {
            // No list filter found by displayForm — check if a text filter exists with the same
            // localIdentifier and selectionType config allows list type override
            const localId = attributeFilter.attributeFilter.localIdentifier;
            if (localId) {
                const existingFilterItem: ReturnType<
                    ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>
                > = yield call(
                    selectFilterContextAttributeFilterItemByLocalIdTabAware,
                    localId,
                    tabLocalIdentifier,
                );

                if (existingFilterItem && isDashboardTextAttributeFilter(existingFilterItem)) {
                    const configSelectionType = selectionTypeMap?.get(localId);
                    // Default is "listOrText" — only skip if config explicitly restricts to "text"
                    if (configSelectionType !== "text") {
                        // Text → list: set displayAsLabel to the text filter's displayForm
                        // so the list filter visually shows the same label
                        updateActions.push(
                            tabsActions.replaceAttributeFilterItem({
                                filterLocalId: localId,
                                filter: attributeFilter,
                                tabLocalIdentifier,
                            }),
                            tabsActions.changeDisplayAsLabel({
                                localIdentifier: localId,
                                displayAsLabel: dashboardAttributeFilterItemDisplayForm(existingFilterItem),
                                tabLocalIdentifier,
                            }),
                        );
                        displayFormsToResolve.push(attributeFilter.attributeFilter.displayForm);
                        handledLocalIds.add(localId);
                    }
                }
            }
        }
    }

    // Build replace actions for text filter types (arbitrary, match).
    for (const textFilter of textAttributeFilters) {
        const localId = dashboardAttributeFilterItemLocalIdentifier(textFilter);
        if (localId) {
            const existingFilter: ReturnType<
                ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>
            > = yield call(
                selectFilterContextAttributeFilterItemByLocalIdTabAware,
                localId,
                tabLocalIdentifier,
            );

            if (!existingFilter) {
                continue;
            }

            // Allow replacement if existing filter is already text type,
            // or if selectionType config allows text on a list filter target
            const isExistingText = isDashboardTextAttributeFilter(existingFilter);
            if (!isExistingText) {
                const configSelectionType = selectionTypeMap?.get(localId);
                // Default is "listOrText", except single selection list filters → "list"
                if (configSelectionType === "list") {
                    continue;
                }
                if (
                    configSelectionType === undefined &&
                    isDashboardAttributeFilter(existingFilter) &&
                    isSingleSelectionFilter(existingFilter)
                ) {
                    continue;
                }
            }

            updateActions.push(
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: localId,
                    filter: textFilter,
                    tabLocalIdentifier,
                }),
            );

            // List → text: update displayAsLabel to match the text filter's displayForm
            if (!isExistingText) {
                const textDisplayForm = dashboardAttributeFilterItemDisplayForm(textFilter);
                updateActions.push(
                    tabsActions.changeDisplayAsLabel({
                        localIdentifier: localId,
                        displayAsLabel: textDisplayForm,
                        tabLocalIdentifier,
                    }),
                );
                displayFormsToResolve.push(textDisplayForm);
            }

            handledLocalIds.add(localId);
        }
    }

    if (resetOthers) {
        const currentAttributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield call(
            selectFilterContextAttributeFiltersTabAware,
            tabLocalIdentifier,
        );

        // for element-based filters that have not been handled, create clear selection actions
        const unhandledFilters = currentAttributeFilters.filter(
            (filter) => !handledLocalIds.has(filter.attributeFilter.localIdentifier!),
        );
        if (unhandledFilters.length > 0) {
            updateActions.push(
                tabsActions.clearAttributeFiltersSelection({
                    filterLocalIds: unhandledFilters.map((filter) => filter.attributeFilter.localIdentifier!),
                    tabLocalIdentifier,
                }),
            );
        }

        // for text filters (arbitrary/match) that have not been handled, reset to All state
        // (negative arbitrary filter with empty selection)
        const currentAllFilterItems: ReturnType<typeof selectFilterContextAttributeFilterItems> = yield call(
            selectFilterContextAttributeFilterItemsTabAware,
            tabLocalIdentifier,
        );

        const unhandledTextFilters = currentAllFilterItems.filter(
            (filter): filter is DashboardTextAttributeFilter =>
                isDashboardTextAttributeFilter(filter) &&
                !handledLocalIds.has(dashboardAttributeFilterItemLocalIdentifier(filter)!),
        );
        for (const textFilter of unhandledTextFilters) {
            const localId = dashboardAttributeFilterItemLocalIdentifier(textFilter)!;
            const resetFilter: DashboardAttributeFilterItem = {
                arbitraryAttributeFilter: {
                    displayForm: dashboardAttributeFilterItemDisplayForm(textFilter),
                    values: [],
                    negativeSelection: true,
                    localIdentifier: localId,
                    filterElementsBy: dashboardAttributeFilterItemFilterElementsBy(textFilter),
                    filterElementsByDate: dashboardAttributeFilterItemFilterElementsByDate(textFilter),
                    validateElementsBy: dashboardAttributeFilterItemValidateElementsBy(textFilter),
                },
            };
            updateActions.push(
                tabsActions.replaceAttributeFilterItem({
                    filterLocalId: localId,
                    filter: resetFilter,
                    tabLocalIdentifier,
                }),
            );
        }
    }

    return { actions: updateActions, displayFormsToResolve };
}

function* getDateFilterUpdateActions(
    dateFilter: IDashboardDateFilter | undefined,
    resetOthers: boolean,
    tabLocalIdentifier?: string,
): SagaIterator<AnyAction[]> {
    if (dateFilter) {
        const canApply: SagaReturnType<typeof canApplyDateFilter> = yield call(
            canApplyDateFilter,
            dateFilter,
        );
        if (!canApply) {
            return [];
        }

        const localIdentifierObj = dateFilter.dateFilter.localIdentifier
            ? { localIdentifier: dateFilter.dateFilter.localIdentifier }
            : {};
        const emptyValueHandlingObj = dateFilter.dateFilter.emptyValueHandling
            ? { emptyValueHandling: dateFilter.dateFilter.emptyValueHandling }
            : {};
        const upsertPayload: IUpsertDateFilterPayload = isAllTimeDashboardDateFilter(dateFilter)
            ? {
                  type: "allTime",
                  dataSet: dateFilter.dateFilter.dataSet,
                  ...localIdentifierObj,
                  ...emptyValueHandlingObj,
                  tabLocalIdentifier,
              }
            : {
                  type: dateFilter.dateFilter.type,
                  granularity: dateFilter.dateFilter.granularity,
                  from: dateFilter.dateFilter.from,
                  to: dateFilter.dateFilter.to,
                  dataSet: dateFilter.dateFilter.dataSet,
                  ...localIdentifierObj,
                  ...(dateFilter.dateFilter.boundedFilter
                      ? { boundedFilter: dateFilter.dateFilter.boundedFilter }
                      : {}),
                  ...emptyValueHandlingObj,
                  tabLocalIdentifier,
              };

        return [tabsActions.upsertDateFilter(upsertPayload)];
    } else if (resetOthers) {
        return [tabsActions.upsertDateFilter({ type: "allTime", tabLocalIdentifier })];
    }

    return [];
}

function* getDateFiltersUpdateActions(
    dateFilters: IDashboardDateFilter[],
    resetOthers: boolean,
    tabLocalIdentifier?: string,
): SagaIterator<AnyAction[]> {
    const updateActions: AnyAction[] = [];
    const handledDataSets = new Set<string>();

    for (const dateFilter of dateFilters) {
        const filterRef = dateFilter.dateFilter.dataSet!;
        const dashboardFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
            yield call(selectFilterContextDateFilterByDataSetTabAware, filterRef, tabLocalIdentifier);

        if (dashboardFilter) {
            const localIdentifierObj = dateFilter.dateFilter.localIdentifier
                ? { localIdentifier: dateFilter.dateFilter.localIdentifier }
                : {};
            const emptyValueHandlingObj = dateFilter.dateFilter.emptyValueHandling
                ? { emptyValueHandling: dateFilter.dateFilter.emptyValueHandling }
                : {};
            handledDataSets.add(serializeObjRef(dashboardFilter.dateFilter.dataSet!));
            const upsertPayload: IUpsertDateFilterPayload = isAllTimeDashboardDateFilter(dateFilter)
                ? {
                      type: "allTime",
                      dataSet: dateFilter.dateFilter.dataSet,
                      ...localIdentifierObj,
                      ...emptyValueHandlingObj,
                      tabLocalIdentifier,
                  }
                : {
                      type: dateFilter.dateFilter.type,
                      granularity: dateFilter.dateFilter.granularity,
                      from: dateFilter.dateFilter.from,
                      to: dateFilter.dateFilter.to,
                      dataSet: dateFilter.dateFilter.dataSet,
                      ...localIdentifierObj,
                      ...(dateFilter.dateFilter.boundedFilter
                          ? { boundedFilter: dateFilter.dateFilter.boundedFilter }
                          : {}),
                      ...emptyValueHandlingObj,
                      tabLocalIdentifier,
                  };

            updateActions.push(tabsActions.upsertDateFilter(upsertPayload));
        }
    }

    if (resetOthers) {
        const currentDateFilters: ReturnType<typeof selectFilterContextDateFiltersWithDimension> = yield call(
            selectFilterContextDateFiltersWithDimensionTabAware,
            tabLocalIdentifier,
        );

        // for filters that have not been handled by the loop above, create a clear selection actions
        const unhandledFilters = currentDateFilters.filter(
            (filter) => !handledDataSets.has(serializeObjRef(filter.dateFilter.dataSet!)),
        );
        if (unhandledFilters.length > 0) {
            for (const dateFilter of unhandledFilters) {
                const localIdentifierObj = dateFilter.dateFilter.localIdentifier
                    ? { localIdentifier: dateFilter.dateFilter.localIdentifier }
                    : {};
                updateActions.push(
                    tabsActions.upsertDateFilter({
                        type: "allTime",
                        dataSet: dateFilter.dateFilter.dataSet,
                        ...localIdentifierObj,
                        tabLocalIdentifier,
                    }),
                );
            }
        }
    }

    return updateActions;
}

const getAttributeFilterSelectionPayload = (
    incomingFilter: IDashboardAttributeFilter,
    currentFilter: IDashboardAttributeFilter,
): IUpdateAttributeFilterSelectionPayload => {
    const { attributeElements, negativeSelection } = incomingFilter.attributeFilter;

    const attributeFilterSelectionPayload: IUpdateAttributeFilterSelectionPayload = {
        elements: attributeElements,
        filterLocalId: currentFilter.attributeFilter.localIdentifier!,
        negativeSelection: negativeSelection,
    };

    if (isSingleSelectionFilter(currentFilter)) {
        if (negativeSelection) {
            return {
                ...attributeFilterSelectionPayload,
                elements: updateAttributeElementsItems(attributeElements, []),
                negativeSelection: false,
            };
        }

        if (!attributeElementsIsEmpty(attributeElements)) {
            const attributeElementsValues = getAttributeElementsItems(attributeElements);
            const singleSelectAttributeElements = [attributeElementsValues[0]];

            return {
                ...attributeFilterSelectionPayload,
                elements: updateAttributeElementsItems(attributeElements, singleSelectAttributeElements),
            };
        }
    }

    return attributeFilterSelectionPayload;
};

/**
 *  For Bear:
 *  Attribute element in Bear can be matched because Bear utilizes a unique URI to identify each attribute element.
 *  This URI remains constant regardless of the attribute label (the URI points to the attribute URI rather than the label URI).
 *  In Bear, there are duplicate values, and each label contains the same number of element values.
 *  As a result, we can easily map one value from one label to another, and enabling us to determine the customer's intended selection
 *
 *  For Tiger/Panther:
 *  Attribute elements in Tiger/Panther are referenced solely by the values that the user sees. There is no URI like in Bear.
 *  Only the display value is available in Tiger/Panther. Additionally, Tiger only displays unique values for each label.
 *  In Tiger/Panther, you may observe a varying number of element values in the labels if duplicates are present.
 *  Therefore, mapping one value from one label to another is not straightforward, as it can be mapped to multiple values,
 *  and it is not always possible to ascertain the customer's intended selection.
 */
function canMapDashboardFilterFromAnotherDisplayForm(ctx: DashboardContext) {
    return ctx.backend.capabilities.supportsElementUris;
}
