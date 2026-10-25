// (C) 2019-2026 GoodData Corporation

import { compact, isEqual } from "lodash-es";
import { type Task } from "redux-saga";
import {
    type SagaReturnType,
    all,
    call,
    cancel,
    delay,
    fork,
    put,
    select,
    take,
    takeEvery,
} from "redux-saga/effects";

import { type IWorkspaceCatalog, type IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type CatalogItemType,
    type ICatalogAttributeHierarchy,
    type IInsightDefinition,
    type IParameterMetadataObject,
    catalogItemMetadataObject,
    idRef,
    insightBuckets,
    insightVisualizationUrl,
    isNumberParameterDefinition,
    isStringParameterDefinition,
    newInsightDefinition,
} from "@gooddata/sdk-model";

import { refreshSessionId } from "../../actions/app_context_actions.js";
import { updateItemCache } from "../../actions/data_actions.js";
import { dataSourceError } from "../../actions/messages_actions.js";
import { backend, clearCache, resetCatalogs } from "../../backend.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { getChangedItemsCount } from "../../models/catalog.js";
import { type IInsightForAvailability, getInsightContentForAvailability } from "../../models/insight.js";
import { attributeHierarchyModified } from "../../postMessageApi/actions/attribute_hierarchies_actions.js";
import { getPostMessageContextId } from "../../postMessageApi/sagas/post_message_saga_helper.js";
import { supportsAttributeHierarchies } from "../../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import {
    enableComputedAttributes,
    enableMetricPermissions,
    enableParameters,
    enableStringParameters,
} from "../../selectors/feature_flag_selector.js";
import { getInsightWithBucketsViaMd } from "../../selectors/insight_selectors.js";
import { getIntlMessagesForLocale, getLocale } from "../../selectors/intl_selector.js";
import { getTagsConfiguration, isTagsConfigurationChanged } from "../../selectors/route_selector.js";
import { extendedReferencePointApplied } from "../../store/buckets/buckets_operation_events.js";
import {
    getAttributeHierarchies,
    getAvailableItems,
    hasAvailabilityError,
    hasCatalogFirstLoaded,
} from "../../store/catalog/catalog_selector.js";
import {
    resetTooltipDetails,
    setAttributeHierarchies,
    setAttributeHierarchiesChanged,
    setAvailabilityError,
    setCatalogFirstLoaded,
    setCatalogGroups,
    setCatalogItems,
    setCatalogItemsAvailability,
    setCatalogParameters,
    setIsWorkspaceEmpty,
    setItemTooltipDetails,
    setLoadingAvailability,
    setLoadingGroups,
    setLoadingItems,
    setUpdatedItemsCount,
    toggleUnavailableItemsVisibility,
} from "../../store/catalog/catalog_store_actions.js";
import { loadDetailParts } from "../../utils/catalog_details_loader_api.js";
import { getRouteParams } from "../../utils/location.js";
import { logError } from "../../utils/logging/error_logging.js";
import { OrganizedCatalogUtils } from "../../utils/organized_catalog.js";
import { createIntl } from "../../utils/translations.js";
import { updateSelectedDataset } from "../datasets_sagas.js";
import { loadDateDatasetsWithAllDates } from "../date_datasets/date_datasets_sagas.js";

import { catalogLoadFinished, catalogLoadRequested, catalogLoadSucceeded } from "./catalog_saga_actions.js";
import {
    CatalogUiActionTypeKeys,
    type ICatalogItemTooltipDetailsRequestAction,
    type ICatalogRefreshRequestedAction,
    type ICatalogToggleUnavailableItemsVisibilityAction,
    type IDeleteCatalogAttributeHierarchyAction,
    type IUpdateCatalogAttributeHierarchyAction,
} from "./catalog_ui_actions.js";
import { getCatalogBubbleItemCacheKey } from "./catalog_utils.js";

function* getCatalogCommonOptions(ignoreExcludeInclude = false) {
    const { dataset }: ReturnType<typeof getRouteParams> = yield select(getRouteParams);

    const isSupportAttributeHierarchy: ReturnType<typeof supportsAttributeHierarchies> = yield select(
        supportsAttributeHierarchies,
    );
    let catalogTypes: CatalogItemType[] = ["attribute", "fact", "measure"];

    if (isSupportAttributeHierarchy) {
        catalogTypes = [...catalogTypes, "attributeHierarchy"];
    }

    const isComputedAttributesEnabled: ReturnType<typeof enableComputedAttributes> =
        yield select(enableComputedAttributes);

    if (isComputedAttributesEnabled) {
        catalogTypes = [...catalogTypes, "computedAttribute"];
    }

    const { includeObjectsWithTags, excludeObjectsWithTags }: ReturnType<typeof getTagsConfiguration> =
        yield select(getTagsConfiguration);

    const areMetricPermissionsEnabled: ReturnType<typeof enableMetricPermissions> =
        yield select(enableMetricPermissions);

    const result: IWorkspaceCatalogFactoryOptions = {
        includeTags: ignoreExcludeInclude ? [] : includeObjectsWithTags,
        excludeTags: ignoreExcludeInclude ? [] : excludeObjectsWithTags,
        dataset: !!dataset && idRef(dataset),
        // TODO date datasets are loaded using loadDateDatasets for now as it uses the current md object content
        types: catalogTypes,
        production: !dataset,
        ...(areMetricPermissionsEnabled ? { loadPermissions: true } : {}),
    };

    return result;
}

export function* fetchCatalog(optionOverrides: Partial<IWorkspaceCatalogFactoryOptions> = {}) {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const options: SagaReturnType<typeof getCatalogCommonOptions> = yield call(getCatalogCommonOptions);
    const loader = backend
        .workspace(projectId)
        .catalog()
        .withOptions({
            ...options,
            ...optionOverrides,
        });

    const result: SagaReturnType<typeof loader.load> = yield call([loader, loader.load]);
    return result;
}

export function* fetchAvailableItemsUris(insight: IInsightDefinition) {
    const workspaceCatalog: SagaReturnType<typeof fetchCatalog> = yield call(fetchCatalog);

    const availableLoader = workspaceCatalog.availableItems().forInsight(insight);
    const availableItemsCatalog: SagaReturnType<typeof availableLoader.load> = yield call([
        availableLoader,
        availableLoader.load,
    ]);

    return availableItemsCatalog.allAvailableItems().map((i) => catalogItemMetadataObject(i).uri);
}

function* loadItemsAvailability(insight: IInsightDefinition) {
    if (insightBuckets(insight).length === 0) {
        yield put(setCatalogItemsAvailability(null)); // all items are available
        yield put(setLoadingAvailability(false));
        return;
    }

    yield put(setLoadingAvailability(true));
    yield put(setAvailabilityError(null));

    const availableItemUris: SagaReturnType<typeof fetchAvailableItemsUris> = yield call(
        fetchAvailableItemsUris,
        insight,
    );

    yield put(setCatalogItemsAvailability(availableItemUris));
    yield put(setLoadingAvailability(false));
}

export function* loadIsWorkspaceEmpty(allItems: CatalogItem[]) {
    if (allItems.length > 0) {
        return false;
    }

    const workspaceCatalogWithoutTags: IWorkspaceCatalog = yield call(fetchCatalog, {
        excludeTags: [],
        includeTags: [],
    });

    return workspaceCatalogWithoutTags.allItems().length === 0;
}

export function* loadAttributeHierarchies() {
    yield put(setAttributeHierarchies([]));

    resetCatalogs();

    const workspaceCatalog: IWorkspaceCatalog = yield call(fetchCatalog);
    yield put(setAttributeHierarchies(workspaceCatalog.attributeHierarchies()));
}

const PARAMETERS_PAGE_SIZE = 2000;

export function* loadParameters() {
    const isEnabled: boolean = yield select(enableParameters);
    if (!isEnabled) {
        yield put(setCatalogParameters([]));
        return;
    }

    const stringParametersEnabled: boolean = yield select(enableStringParameters);

    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const parameters: IParameterMetadataObject[] = yield call(async () => {
        const result = await backend
            .workspace(projectId)
            .parameters()
            .getParametersQuery()
            .withSize(PARAMETERS_PAGE_SIZE)
            .query();
        return result.all();
    });

    const supportedParameters = parameters.filter(
        (parameter) =>
            isNumberParameterDefinition(parameter.definition) ||
            (stringParametersEnabled && isStringParameterDefinition(parameter.definition)),
    );

    yield put(setCatalogParameters(supportedParameters));
}

export function* loadCatalogItemsAndGroups() {
    yield put(setCatalogItems([]));
    yield put(setAttributeHierarchies([]));
    yield put(setCatalogGroups([]));

    const workspaceCatalog: IWorkspaceCatalog = yield call(fetchCatalog);

    const allItems = workspaceCatalog.allItems();

    yield put(setCatalogItems(allItems));
    yield put(setCatalogGroups(workspaceCatalog.groups()));
    yield put(setAttributeHierarchies(workspaceCatalog.attributeHierarchies()));

    const isWorkspaceEmpty: SagaReturnType<typeof loadIsWorkspaceEmpty> = yield call(
        loadIsWorkspaceEmpty,
        allItems,
    );
    yield put(setIsWorkspaceEmpty(isWorkspaceEmpty));

    const cachedItems = OrganizedCatalogUtils.convertToItemCacheMap(allItems);
    yield put(updateItemCache(cachedItems));
}

export function* loadCatalog(refreshAvailability = false) {
    yield put(catalogLoadRequested());
    yield put(setLoadingItems(true));
    yield put(setLoadingGroups(true));
    try {
        yield all(
            compact([
                call(loadCatalogItemsAndGroups),
                call(loadDateDatasetsWithAllDates),
                call(loadParameters),
                refreshAvailability && call(refreshCatalogItemsAvailability),
            ]),
        );
        yield put(setCatalogFirstLoaded(true));
        yield put(catalogLoadSucceeded());
    } catch (error) {
        logError("Error while loading catalog", error);
        yield put(dataSourceError(error));
    } finally {
        yield put(setLoadingItems(false));
        yield put(setLoadingGroups(false));
        yield put(catalogLoadFinished());
    }
}

function* refreshCatalogItemsAvailability() {
    const currentInsight: ReturnType<typeof getInsightWithBucketsViaMd> =
        yield select(getInsightWithBucketsViaMd);
    yield call(updateCatalogItemsAvailability, currentInsight);
}

export function* loadCatalogItemsAvailability(insight: IInsightDefinition) {
    try {
        yield loadItemsAvailability(insight);
    } catch (error) {
        logError("Error while querying availability of catalog items", error);

        yield put(setLoadingAvailability(false));
        yield put(setAvailabilityError(error));
        yield put(dataSourceError(error));
    }
}

export function* updateCatalogItemsAvailability(insight: IInsightDefinition) {
    yield all([call(loadCatalogItemsAvailability, insight), call(loadDateDatasetsWithAllDates)]);
}

export function* watchExtendedReferencePointChange() {
    let previousInsightRelevantContent: IInsightForAvailability = null;
    let lastTask: Task | undefined;

    while (true) {
        // the APPLIED state, not the trigger. `getInsightWithBucketsViaMd` below reads
        // `data.buckets` and the extended reference point, and since this row the TRIGGER writes
        // neither — the operation's semantic event does. Keying on the event is also narrower than the
        // rejected prototype's `isCascadeAppliedFor(<trigger>)`: the event exists per operation, so it
        // cannot fail to arrive for a cascade that computed a no-op.
        yield take(extendedReferencePointApplied.type);

        const currentInsight: ReturnType<typeof getInsightWithBucketsViaMd> =
            yield select(getInsightWithBucketsViaMd);
        const currentInsightRelevantContent = getInsightContentForAvailability(currentInsight);
        const isInsightDifferent = !isEqual(previousInsightRelevantContent, currentInsightRelevantContent);
        const lastLoadHadError: ReturnType<typeof hasAvailabilityError> = yield select(hasAvailabilityError);

        if (isInsightDifferent || lastLoadHadError) {
            if (lastTask) {
                yield cancel(lastTask);
            }

            const insightForQuery = newInsightDefinition(insightVisualizationUrl(currentInsight), (i) =>
                i
                    .buckets(currentInsightRelevantContent.buckets)
                    .filters(currentInsightRelevantContent.filters),
            );

            previousInsightRelevantContent = currentInsightRelevantContent;
            // `fork` answers the TASK, not the generator's return — SagaReturnType cannot say so
            const forkResult: Task = yield fork(updateCatalogItemsAvailability, insightForQuery);
            lastTask = forkResult;
        }
    }
}

function* handleRouteParamsChanged() {
    const datasetChanged: SagaReturnType<typeof updateSelectedDataset> = yield call(updateSelectedDataset);
    const tagsConfigurationChanged: ReturnType<typeof isTagsConfigurationChanged> =
        yield select(isTagsConfigurationChanged);
    const hasCatalogItemsLoaded: SagaReturnType<typeof hasCatalogFirstLoaded> =
        yield select(hasCatalogFirstLoaded);

    if (tagsConfigurationChanged || datasetChanged || !hasCatalogItemsLoaded) {
        // on every dataset change, we need to refresh items availability as the SPI does not give us availability
        // for all datasets, just the one currently selected
        yield call(loadCatalog, datasetChanged);
    }
}

export function* setTooltipDetailPart(itemId: string, part: SagaReturnType<typeof loadDetailParts>[number]) {
    // Handle each part's failure in isolation. The parts are dispatched together via `all`, which
    // fails fast and would cancel its siblings if one part threw; catching here keeps a slow/failing
    // part (e.g. the value samples) from preventing the parts that did resolve (e.g. the dataset)
    // from rendering.
    try {
        const details: Awaited<typeof part> = yield part;

        yield put(setItemTooltipDetails(itemId, details));
    } catch (error) {
        logError("Error while loading item details", error);

        yield put(dataSourceError(error));
    }
}

export function* fetchItemDetails(action: ICatalogItemTooltipDetailsRequestAction) {
    const { item } = action.payload;

    const locale: ReturnType<typeof getLocale> = yield select(getLocale);
    const messages: ReturnType<typeof getIntlMessagesForLocale> = yield select(getIntlMessagesForLocale);

    const intl: ReturnType<typeof createIntl> = yield call(createIntl, locale, messages);

    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

    try {
        const itemId = getCatalogBubbleItemCacheKey(item);
        const parts: SagaReturnType<typeof loadDetailParts> = yield call(
            loadDetailParts,
            item,
            projectId,
            intl,
        );

        // Dispatch each detail part as soon as it resolves so fast parts (e.g. an attribute's
        // dataset) are shown immediately, without waiting for slow ones (the value samples that
        // depend on the CollectLabelElements query).
        yield all(parts.map((part) => call(setTooltipDetailPart, itemId, part)));
    } catch (error) {
        logError("Error while loading item details", error);

        yield put(dataSourceError(error));
    }
}

function* displayUpdatedItemsCount(changedItemsCount: number) {
    yield put(setUpdatedItemsCount(changedItemsCount));
    yield delay(4_000);
    yield put(setUpdatedItemsCount(null));
}

/**
 * invokes refresh of the catalog and re-execution of visualization by refreshing the session id
 */
export function* manualCatalogRefresh(action: ICatalogRefreshRequestedAction) {
    const originalItems: ReturnType<typeof getAvailableItems> = yield select(getAvailableItems);

    clearCache();

    yield call(loadCatalog, !action.payload.preventRefreshAvailability);

    const newItems: ReturnType<typeof getAvailableItems> = yield select(getAvailableItems);
    const changedItemsCount = getChangedItemsCount(originalItems, newItems);

    yield put(refreshSessionId());
    yield put(resetTooltipDetails());
    yield call(displayUpdatedItemsCount, changedItemsCount);
}

export function* handleToggleUnavailableItemsVisibility(
    action: ICatalogToggleUnavailableItemsVisibilityAction,
) {
    yield put(toggleUnavailableItemsVisibility(action.payload.showUnavailableItems));
}

export function* handleDeleteCatalogAttributeHierarchy(action: IDeleteCatalogAttributeHierarchyAction) {
    const {
        payload: { postMessageContext },
    } = action;
    const contextId: string = getPostMessageContextId(postMessageContext);

    const attributeHierarchies: ReturnType<typeof getAttributeHierarchies> =
        yield select(getAttributeHierarchies);
    const updatedItems = attributeHierarchies.filter(
        (item) =>
            !(
                item.type === "attributeHierarchy" &&
                item.attributeHierarchy.id === action.payload.deletedAttributeHierarchyId
            ),
    );
    yield put(setAttributeHierarchies(updatedItems));

    yield put(setAttributeHierarchiesChanged(true));

    yield put(attributeHierarchyModified(contextId));
}

export function* handleUpdateCatalogAttributeHierarchy(action: IUpdateCatalogAttributeHierarchyAction) {
    const {
        payload: { postMessageContext },
    } = action;
    const contextId: string = getPostMessageContextId(postMessageContext);

    const attributeHierarchies: ReturnType<typeof getAttributeHierarchies> =
        yield select(getAttributeHierarchies);
    const updatedItem: ICatalogAttributeHierarchy = action.payload.updatedAttributeHierarchy;
    const updatedItems = attributeHierarchies.map((item) => {
        if (
            item.type === "attributeHierarchy" &&
            item.attributeHierarchy.id === updatedItem.attributeHierarchy.id
        ) {
            return updatedItem;
        }
        return item;
    });
    yield put(setAttributeHierarchies(updatedItems));

    yield put(setAttributeHierarchiesChanged(true));

    yield put(attributeHierarchyModified(contextId));
}

export function* watchCatalog() {
    yield takeEvery(ActionTypeKeys.SAGA_ROUTE_PARAMS_CHANGED, handleRouteParamsChanged);
    yield fork(watchExtendedReferencePointChange);
    yield takeEvery(CatalogUiActionTypeKeys.UI_ITEM_TOOLTIP_DETAILS_REQUEST, fetchItemDetails);
    yield takeEvery(CatalogUiActionTypeKeys.UI_REFRESH_REQUESTED, manualCatalogRefresh);
    yield takeEvery(
        CatalogUiActionTypeKeys.UI_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY,
        handleToggleUnavailableItemsVisibility,
    );
    yield takeEvery(
        CatalogUiActionTypeKeys.UI_DELETE_CATALOG_ATTRIBUTE_HIERARCHY,
        handleDeleteCatalogAttributeHierarchy,
    );
    yield takeEvery(
        CatalogUiActionTypeKeys.UI_UPDATE_CATALOG_ATTRIBUTE_HIERARCHY,
        handleUpdateCatalogAttributeHierarchy,
    );
}
