// (C) 2020-2026 GoodData Corporation

import { partition, uniq, uniqBy } from "lodash-es";
import moment from "moment";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, put, race, select, take, takeEvery } from "redux-saga/effects";

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type ICommandFailedBody,
    type IRemoveAttributeFilterItem,
    type IRemoveDateFilterItem,
    type IRemoveRankingFilterItem,
    isPositiveAttributeFilter,
    isRemoveAttributeFilter,
    isRemoveDateFilter,
    isRemoveRankingFilter,
} from "@gooddata/sdk-embedding";
import {
    type DisplayFormRefType,
    type ITransformedArbitraryAttributeFilter,
    type ITransformedDateFilterItem,
    type ITransformedMatchAttributeFilter,
    type ITransformedRankingFilter,
    filterConverters,
    toDisplayFormRefType,
} from "@gooddata/sdk-embedding/internal";
import {
    type AttributeDisplayFormType,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type IComputedAttributeMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isComputedAttributeRef,
    isUriRef,
    uriRef,
} from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { updateItemCache } from "../../actions/data_actions.js";
import { MAX_ATTRIBUTE_FILTERS_COUNT } from "../../constants/catalog_filters.js";
import { generateBucketItemIdentifier } from "../../models/bucket_item_identifier.js";
import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { computedAttributeCacheKey } from "../../models/item_cache_lookup.js";
import { sanitizeFilters } from "../../sagas/filter_bar/filter_bar_saga.js";
import {
    isElementUrisSupported,
    selectSupportsMultipleDateFilters,
    supportsTimeGranularities,
} from "../../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import {
    getAllMeasureBucketItems,
    getAllSlicingAttributeBucketItems,
    getAttributeBucketItems,
    getDateBucketItem,
} from "../../selectors/buckets_selector.js";
import { selectedOverTimeComparisonMeasures } from "../../selectors/date_filter_selector.js";
import { isReportOpening, isReportSaving } from "../../selectors/export_selector.js";
import {
    enableComputedAttributes,
    enableSecondGranularities,
} from "../../selectors/feature_flag_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { getPrimaryDateDataset } from "../../services/buckets_service.js";
import { DateDatasetsMetaService } from "../../services/date_datasets_meta_service.js";
import { DateDatasetsService } from "../../services/date_datasets_service.js";
import {
    type ICommandUpdateFilterItemsActionPayload,
    type IUpdateArbitraryFilterActionPayload,
    type IUpdateAttributeFilterActionPayload,
    type IUpdateDateFilterActionPayload,
    type IUpdateExternalMeasureValueFilterPayload,
    type IUpdateMatchFilterActionPayload,
    type IUpdateRankingFilterActionPayload,
    commandAddOrUpdateFilterItems,
    storeUpdateAttributeFilterDisplayForm,
} from "../../store/bucket_filters/bucket_filters_actions.js";
import {
    filterItemsCommandFailed,
    filterItemsUpdatedFromCommand,
} from "../../store/bucket_filters/bucket_filters_operation_events.js";
import { filtersWereChanged, removeFiltersFromState } from "../../store/filter_bar/filter_bar_actions.js";
import {
    getAttributeFilter,
    getAttributeFilterById,
    getDateFilter,
    getDateFilterIndex,
    getDateFilters,
    getFilterItems,
    getFilterItemsWithoutAdditionalDateAttributes,
    getFirstDateFilter,
    getRankingFilter,
} from "../../store/filter_bar/filter_bar_selector.js";
import { FilterBar, type IDateFilter, type IFilter } from "../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../store/types.js";
import { type IRawBucketItem, type IRawBucketItems } from "../../typings/buckets.js";
import { type IDateDatasetAttribute } from "../../typings/dataset_attribute.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { type ICacheItem, type ICatalogEntries } from "../../typings/state_objects.js";
import {
    getAttributeDisplayForms,
    getAttributes,
    getComputedAttributes,
    loadValidElementsData,
} from "../../utils/api.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IRemoveFilterContextFailedAction,
    type IRemoveFilterContextFinishedAction,
    type IRemoveFilterContextRequestedAction,
    type IRemoveFilterItemsAction,
    type ISetFilterContextFailedAction,
    type ISetFilterContextFinishedAction,
    type ISetFilterContextRequestedAction,
    type ITransformedAttributeFilterItem,
    removeFilterContextFailedAction,
    removeFilterContextFinishedAction,
    removeFilterItemsFromState,
    setFilterContextFailedAction,
    setFilterContextFinishedAction,
} from "../actions/control_filtering_actions.js";
import {
    CONTROL_FILTERING_ERRORS,
    removeFilterContextFinishedEvent,
    setFilterContextFinishedEvent,
} from "../outgoing/control_filtering_events.js";
import { invalidCommand } from "../outgoing/invalid_command_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import {
    buildDateFilterConfig,
    getItemCacheByDfIdentifierFromAvailableDisplayForms,
    getItemCacheByDfUriFromAvailableDisplayForms,
    getPostMessageContextId,
    getSupportedGranularities,
} from "./post_message_saga_helper.js";

interface IMappingFilterItems {
    externalObjRefs: ObjRef[];
    externalFiltersFromCached: ITransformedAttributeFilterItem[];
}

interface IRemoveFilterDisplayFormIdentifier {
    identifier: string;
    dfType: DisplayFormRefType;
}

interface IMappingRemoveFilterItems {
    uris: string[];
    identifiers: IRemoveFilterDisplayFormIdentifier[];
}

const ERROR_INVALID_DATE_FILTER_COUNT = "ERROR_INVALID_DATE_FILTER_COUNT";
const ERROR_INVALID_DATE_FILTER_GRANULARITY = "ERROR_INVALID_DATE_FILTER_GRANULARITY";
const ERROR_INVALID_DATE_FILTER_FROM_TO_VALUE = "ERROR_INVALID_DATE_FILTER_FROM_TO_VALUE";
const ERROR_NO_DATE_DATASET_IN_PROJECT = "ERROR_NO_DATE_DATASET_IN_PROJECT";
const ERROR_DIFFERENT_DATE_DATASET_IN_BUCKET = "ERROR_DIFFERENT_DATE_DATASET_IN_BUCKET";
const ERROR_INVALID_DATE_DATASET_ID = "ERROR_INVALID_DATE_DATASET_ID";
const ERROR_INVALID_DATE_IDENTIFIER = "ERROR_INVALID_DATE_IDENTIFIER";
const ERROR_INVALID_FILTER_ITEMS_COUNT = "ERROR_INVALID_FILTER_ITEMS_COUNT";
const ERROR_INVALID_REMOVE_FILTER_CONTEXT_COUNT = "ERROR_INVALID_REMOVE_FILTER_CONTEXT_COUNT";
const ERROR_DUPLICATED_ATTRIBUTE_FILTER_URIS = "ERROR_DUPLICATED_ATTRIBUTE_FILTER_URIS";
const ERROR_DUPLICATED_ATTRIBUTE_FILTER_IDENTIFIERS = "ERROR_DUPLICATED_ATTRIBUTE_FILTER_IDENTIFIERS";
const ERROR_INVALID_DATE_DATASET_URI = "ERROR_INVALID_DATE_DATASET_URI";
const ERROR_HAS_NON_DEFAULT_ATTRIBUTE_DISPLAY_FORM = "ERROR_HAS_NON_DEFAULT_ATTRIBUTE_DISPLAY_FORM";
const ERROR_INVALID_FILTER_DATA_FORMAT = "ERROR_INVALID_FILTER_DATA_FORMAT";
const ERROR_INVALID_ATTRIBUTE_FILTER_ID = "ERROR_INVALID_ATTRIBUTE_FILTER_ID";
const ERROR_INVALID_ATTRIBUTE_FILTER_VALUE = "ERROR_INVALID_ATTRIBUTE_FILTER_VALUE";
const ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM = "ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM";
const ERROR_REMOVE_NON_EXISTENT_FILTERS = "ERROR_REMOVE_NON_EXISTENT_FILTERS";
const ERROR_INVALID_SET_FILTER_CONTEXT_STATE = "ERROR_INVALID_SET_FILTER_CONTEXT_STATE";
const ERROR_INVALID_REMOVE_FILTER_CONTEXT_STATE = "ERROR_INVALID_REMOVE_FILTER_CONTEXT_STATE";
const ERROR_INVALID_RANKING_FILTER_MEASURE = "ERROR_INVALID_RANKING_FILTER_MEASURE";
const ERROR_INVALID_RANKING_FILTER_ATTRIBUTES = "ERROR_INVALID_RANKING_FILTER_ATTRIBUTES";
const ERROR_DUPLICATED_RANKING_FILTER_ATTRIBUTES = "ERROR_DUPLICATED_RANKING_FILTER_ATTRIBUTES";
const ERROR_FILTER_MODE_MISMATCH = "ERROR_FILTER_MODE_MISMATCH";
const ERROR_COMPUTED_ATTRIBUTES_DISABLED = "ERROR_COMPUTED_ATTRIBUTES_DISABLED";

const UNEXPECTED_EXCEPTION_OBJECT_NOT_FOUND = "REFERENCED_OBJECT_NOT_FOUND";

function getAttributeFilterErrorMessage(error: unknown): ICommandFailedBody {
    switch ((error as { message?: string } | undefined)?.message) {
        case ERROR_INVALID_DATE_FILTER_COUNT:
            return CONTROL_FILTERING_ERRORS.invalidDateFilterCountError;
        case ERROR_INVALID_DATE_FILTER_GRANULARITY:
            return CONTROL_FILTERING_ERRORS.invalidDateFilterGranularity;
        case ERROR_INVALID_DATE_FILTER_FROM_TO_VALUE:
            return CONTROL_FILTERING_ERRORS.invalidDateFilterFromToValue;
        case ERROR_NO_DATE_DATASET_IN_PROJECT:
            return CONTROL_FILTERING_ERRORS.noDateDatasetInProject;
        case ERROR_DIFFERENT_DATE_DATASET_IN_BUCKET:
            return CONTROL_FILTERING_ERRORS.differentDateDatasetInBucket;
        case ERROR_INVALID_DATE_DATASET_ID:
            return CONTROL_FILTERING_ERRORS.invalidDateDatasetId;
        case ERROR_INVALID_DATE_IDENTIFIER:
            return CONTROL_FILTERING_ERRORS.invalidDateIdentifier;
        case ERROR_INVALID_DATE_DATASET_URI:
            return CONTROL_FILTERING_ERRORS.invalidDateDatasetUri;
        case ERROR_INVALID_FILTER_DATA_FORMAT:
            return CONTROL_FILTERING_ERRORS.invalidFilterDataFormat;
        case ERROR_INVALID_FILTER_ITEMS_COUNT:
            return CONTROL_FILTERING_ERRORS.invalidFilterItemsCount;
        case ERROR_INVALID_REMOVE_FILTER_CONTEXT_COUNT:
            return CONTROL_FILTERING_ERRORS.invalidRemoveFilterItemsCount;
        case ERROR_DUPLICATED_ATTRIBUTE_FILTER_URIS:
            return CONTROL_FILTERING_ERRORS.duplicatedAttributeUris;
        case ERROR_DUPLICATED_ATTRIBUTE_FILTER_IDENTIFIERS:
            return CONTROL_FILTERING_ERRORS.duplicatedAttributeIdentifiers;
        case ERROR_REMOVE_NON_EXISTENT_FILTERS:
            return CONTROL_FILTERING_ERRORS.removeNonExistentFilterError;
        case ERROR_HAS_NON_DEFAULT_ATTRIBUTE_DISPLAY_FORM:
            return CONTROL_FILTERING_ERRORS.hasNonDefaultAttributeDisplayFormError;
        case ERROR_INVALID_ATTRIBUTE_FILTER_ID:
            return CONTROL_FILTERING_ERRORS.invalidAttFilterId;
        case ERROR_INVALID_ATTRIBUTE_FILTER_VALUE:
            return CONTROL_FILTERING_ERRORS.invalidAttFilterValue;
        case ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM:
            return CONTROL_FILTERING_ERRORS.invalidAttFilterDfUri;
        case ERROR_INVALID_SET_FILTER_CONTEXT_STATE:
            return CONTROL_FILTERING_ERRORS.invalidStateSetFilterContext;
        case ERROR_INVALID_REMOVE_FILTER_CONTEXT_STATE:
            return CONTROL_FILTERING_ERRORS.invalidStateRemoveFilterContext;
        case ERROR_INVALID_RANKING_FILTER_ATTRIBUTES:
            return CONTROL_FILTERING_ERRORS.invalidRankingFilterAttributes;
        case ERROR_INVALID_RANKING_FILTER_MEASURE:
            return CONTROL_FILTERING_ERRORS.invalidRankingFilterMeasure;
        case ERROR_DUPLICATED_RANKING_FILTER_ATTRIBUTES:
            return CONTROL_FILTERING_ERRORS.duplicateRankingFilterAttributes;
        case ERROR_FILTER_MODE_MISMATCH:
            return CONTROL_FILTERING_ERRORS.filterModeMismatch;
        case ERROR_COMPUTED_ATTRIBUTES_DISABLED:
            return CONTROL_FILTERING_ERRORS.computedAttributesDisabled;
        default:
            return null;
    }
}

/**
 * Throws if text-mode filters target existing element-based filters (mode mismatch).
 * Allows switching between text modes (arbitrary <-> match).
 */
function checkFilterModeMismatch(
    appState: IAppState,
    items: ReadonlyArray<{ filterLocalIdentifier?: string }>,
): void {
    const hasModeMismatch = items.some((item) => {
        if (!item.filterLocalIdentifier) {
            return false;
        }
        const existing = getAttributeFilter(appState, item.filterLocalIdentifier);
        return !existing?.textModeFilter;
    });
    if (hasModeMismatch) {
        throw new Error(ERROR_FILTER_MODE_MISMATCH);
    }
}

function* getRankingFilterLocalIdentifier() {
    const stateRankingFilter: ReturnType<typeof getRankingFilter> = yield select(getRankingFilter);
    if (stateRankingFilter) {
        return stateRankingFilter.localIdentifier;
    }
    const generated: SagaReturnType<typeof generateBucketItemIdentifier> = yield call(
        generateBucketItemIdentifier,
    );
    return generated;
}

export function* validateExternalRankingFilter(
    rankingFilter: ITransformedRankingFilter,
): SagaIterator<IUpdateRankingFilterActionPayload> {
    // The external (embed) ranking filter keeps the `attributeLocalIdentifiers` name; the AD store filter
    // uses `attributes`, so the field is mapped explicitly when building the store filter below.
    const { measureLocalIdentifier, attributeLocalIdentifiers, ...restRankingFilter } = rankingFilter;
    const measures: ReturnType<typeof getAllMeasureBucketItems> = yield select(getAllMeasureBucketItems);
    const attributes: ReturnType<typeof getAllSlicingAttributeBucketItems> = yield select(
        getAllSlicingAttributeBucketItems,
    );

    const isMeasureLocalIdentifierValid = measures.some(
        (measure) => measure.localIdentifier === measureLocalIdentifier,
    );
    if (!isMeasureLocalIdentifierValid) {
        throw new Error(ERROR_INVALID_RANKING_FILTER_MEASURE);
    }

    const areAttributeLocalIdentifiersValid = attributeLocalIdentifiers
        ? attributeLocalIdentifiers.every((attributeLocalIdentifier) =>
              attributes.some((attribute) => attribute.localIdentifier === attributeLocalIdentifier),
          )
        : true;
    if (!areAttributeLocalIdentifiersValid) {
        throw new Error(ERROR_INVALID_RANKING_FILTER_ATTRIBUTES);
    }

    const areAttributeLocalIdentifiersDuplicates =
        attributeLocalIdentifiers &&
        uniq(attributeLocalIdentifiers).length !== attributeLocalIdentifiers.length;
    if (areAttributeLocalIdentifiersDuplicates) {
        throw new Error(ERROR_DUPLICATED_RANKING_FILTER_ATTRIBUTES);
    }

    const validRankingFilter: IUpdateRankingFilterActionPayload = {
        filter: {
            type: "ranking",
            localIdentifier: yield call(getRankingFilterLocalIdentifier),
            measureLocalIdentifier,
            ...restRankingFilter,
            ...(attributeLocalIdentifiers ? { attributes: attributeLocalIdentifiers } : {}),
        },
    };

    return validRankingFilter;
}

export function* validateExternalAttributeFilters(
    attributeFilters: ITransformedAttributeFilterItem[],
): SagaIterator<IUpdateAttributeFilterActionPayload[]> {
    // validate attribute filters uris
    const validExternalAttributeFilters: SagaReturnType<typeof getValidExternalAttributeFilters> = yield call(
        getValidExternalAttributeFilters,
        attributeFilters,
    );

    // reject element-based filters targeting existing text-mode filters (mode mismatch)
    const appState: IAppState = yield select();
    const hasModeMismatch = validExternalAttributeFilters.some(
        (
            filter: ITransformedAttributeFilterItem & {
                localIdentifier?: string;
            },
        ) => {
            if (!filter.localIdentifier) {
                return false;
            }
            const existing = getAttributeFilter(appState, filter.localIdentifier);
            return !!existing?.textModeFilter;
        },
    );
    if (hasModeMismatch) {
        throw new Error(ERROR_FILTER_MODE_MISMATCH);
    }

    // validate attribute filters values
    const validExternalElementItems: SagaReturnType<typeof validateExternalAttributeFilterValues>[] =
        yield all(
            validExternalAttributeFilters.map((attributeFilter) =>
                call(validateExternalAttributeFilterValues, attributeFilter),
            ),
        );
    const onlyValidElements = validExternalElementItems.filter(
        (validElementItem: IUpdateAttributeFilterActionPayload) =>
            validElementItem.selectedElements !== undefined,
    );

    const supportsElementUris: ReturnType<typeof isElementUrisSupported> =
        yield select(isElementUrisSupported);
    if (supportsElementUris && onlyValidElements.length !== validExternalElementItems.length) {
        throw new Error(ERROR_INVALID_ATTRIBUTE_FILTER_VALUE);
    }

    return onlyValidElements;
}

export function* validateExternalArbitraryFilters(
    filters: ITransformedArbitraryAttributeFilter[],
): SagaIterator<IUpdateArbitraryFilterActionPayload[]> {
    const appState: IAppState = yield select();
    const itemsCached: ReturnType<typeof getItemCache> = yield select(getItemCache);

    const results = filters.map((filter) => {
        const { dfIdentifier, dfType, values, negativeSelection } = filter;
        const itemCached = getItemCacheByDfIdentifierFromAvailableDisplayForms(
            dfIdentifier,
            itemsCached,
            dfType,
        );

        const cacheItemIdentifier = itemCached?.identifier;
        const filterLocalIdentifier = cacheItemIdentifier
            ? getAttributeFilterById(appState, cacheItemIdentifier)?.localIdentifier
            : undefined;

        return {
            filterLocalIdentifier,
            dfIdentifier,
            dfType,
            cacheItemIdentifier,
            values,
            negativeSelection,
        };
    });

    checkFilterModeMismatch(appState, results);

    return results;
}

export function* validateExternalMatchFilters(
    filters: ITransformedMatchAttributeFilter[],
): SagaIterator<IUpdateMatchFilterActionPayload[]> {
    const appState: IAppState = yield select();
    const itemsCached: ReturnType<typeof getItemCache> = yield select(getItemCache);

    const results = filters.map((filter) => {
        const { dfIdentifier, dfType, operator, literal, caseSensitive, negativeSelection } = filter;
        const itemCached = getItemCacheByDfIdentifierFromAvailableDisplayForms(
            dfIdentifier,
            itemsCached,
            dfType,
        );

        const cacheItemIdentifier = itemCached?.identifier;
        const filterLocalIdentifier = cacheItemIdentifier
            ? getAttributeFilterById(appState, cacheItemIdentifier)?.localIdentifier
            : undefined;

        return {
            filterLocalIdentifier,
            dfIdentifier,
            dfType,
            cacheItemIdentifier,
            operator,
            literal,
            ...(caseSensitive === undefined ? {} : { caseSensitive }),
            ...(negativeSelection === undefined ? {} : { negativeSelection }),
        };
    });

    checkFilterModeMismatch(appState, results);

    return results;
}

export function* validateExternalAttributeFilterValues({
    attributeElements,
    dfUri,
    dfIdentifier,
    dfType,
    localIdentifier,
    negativeSelection,
    cacheItemIdentifier,
}: ITransformedAttributeFilterItem): SagaIterator<IUpdateAttributeFilterActionPayload> {
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

    const attributeElementsCount = attributeElements.length;

    if (attributeElementsCount) {
        try {
            const supportsElementUris: ReturnType<typeof isElementUrisSupported> =
                yield select(isElementUrisSupported);

            let validSelectedElements;
            let totalCount;

            if (supportsElementUris) {
                const ref = uriRef(dfUri);
                const loadValidElements: SagaReturnType<typeof loadValidElementsData> = yield call(
                    loadValidElementsData,
                    projectId,
                    ref,
                    attributeElements,
                );

                totalCount = loadValidElements.totalCount;
                if (attributeElements.length === loadValidElements.items.length) {
                    validSelectedElements = loadValidElements.items;
                }
            } else {
                // do not call api to validate elements, as workspace data filtering can be in effect
                // call to api to resolve element titles when displayAsLabel is set is needed here, it will be resolved by attribute filter component
                totalCount = attributeElements.length;
                if (attributeElements.length) {
                    validSelectedElements = attributeElements.map((el) => ({
                        title: el,
                        uri: el,
                    }));
                }
            }

            return {
                dfUri,
                dfIdentifier,
                ...(dfType ? { dfType } : {}),
                cacheItemIdentifier,
                filterLocalIdentifier: localIdentifier,
                isInverted: negativeSelection,
                selectedElements: validSelectedElements,
                totalElementsCount: totalCount,
            };
        } catch {
            return {
                dfUri,
                dfIdentifier,
                ...(dfType ? { dfType } : {}),
                cacheItemIdentifier,
                selectedElements: undefined,
                filterLocalIdentifier: localIdentifier,
                isInverted: negativeSelection,
                totalElementsCount: 0,
            };
        }
    }

    return {
        dfUri,
        dfIdentifier,
        ...(dfType ? { dfType } : {}),
        cacheItemIdentifier,
        selectedElements: [],
        filterLocalIdentifier: localIdentifier,
        isInverted: negativeSelection,
        totalElementsCount: 0,
    };
}

function validateDateFilterValues(
    dateFilter: ITransformedDateFilterItem,
    isTimeSupported: boolean,
    isSecondsSupported: boolean,
): void {
    const { from, to, granularity } = dateFilter;

    if (granularity && !getSupportedGranularities(isTimeSupported, isSecondsSupported)[granularity]) {
        throw new Error(ERROR_INVALID_DATE_FILTER_GRANULARITY);
    }

    const isInvalidFromToRelativeDate = granularity && to < from;
    const fromDate = moment(from, filterConverters.EXTERNAL_DATE_FILTER_FORMAT);
    const toDate = moment(to, filterConverters.EXTERNAL_DATE_FILTER_FORMAT);
    const isInvalidFromToAbsoluteDate =
        !granularity &&
        !(
            moment(fromDate).isValid() &&
            moment(toDate, filterConverters.EXTERNAL_DATE_FILTER_FORMAT).isValid() &&
            moment(toDate).isSameOrAfter(fromDate)
        );

    if (isInvalidFromToRelativeDate || isInvalidFromToAbsoluteDate) {
        throw new Error(ERROR_INVALID_DATE_FILTER_FROM_TO_VALUE);
    }
}

/**
 * A computed attribute is referenced directly, so a command can name one even when the feature is off.
 * Such a command is rejected up front instead of ending in a filter the backend refuses. The setting is
 * read only when a computed attribute is actually referenced.
 */
function* rejectComputedAttributesWhenDisabled(referencesComputedAttribute: boolean): SagaIterator<void> {
    if (!referencesComputedAttribute) {
        return;
    }
    const computedAttributesEnabled: ReturnType<typeof enableComputedAttributes> =
        yield select(enableComputedAttributes);
    if (!computedAttributesEnabled) {
        throw new Error(ERROR_COMPUTED_ATTRIBUTES_DISABLED);
    }
}

function* getAttributeDisplayFormsByObjectRefs(objRefs: ObjRef[]) {
    const projectId: string = yield select(getProjectId);
    try {
        const attributeDisplayForms: IAttributeDisplayFormMetadataObject[] = yield call(
            getAttributeDisplayForms,
            projectId,
            objRefs,
        );

        if (attributeDisplayForms.length !== objRefs.length) {
            throw new Error(ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM);
        }

        return attributeDisplayForms;
    } catch (error) {
        if (error instanceof Error && error.message === UNEXPECTED_EXCEPTION_OBJECT_NOT_FOUND) {
            throw new Error(ERROR_INVALID_ATTRIBUTE_FILTER_ID);
        }

        throw new Error(ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM);
    }
}

function* validateExternalDateFilter(
    dateFilter: ITransformedDateFilterItem,
    useMultipleDateFilters: boolean,
    numberOfDateFilters: number,
): SagaIterator<IUpdateDateFilterActionPayload> {
    const { datasetIdentifier, datasetUri, localIdentifier } = dateFilter;

    const appState: IAppState = yield select();

    let existingDateFilter;
    if (useMultipleDateFilters) {
        if (localIdentifier) {
            // if provided localIdentfier matches existing DF it will be overriden
            existingDateFilter = getDateFilter(appState, localIdentifier);
        } else {
            const filtersDateDataSet =
                DateDatasetsService.getDateDatasetByIdentifier(appState, datasetIdentifier) ||
                DateDatasetsService.getDateDatasetByUri(appState, datasetUri);
            // if we will not find it by dateDataSet no error, it means that DF will be added.
            // The lookup may also come up empty because the date datasets are not loaded yet
            // (SetFilterContext arriving right after the insight opened) — fall through to the
            // ERROR_NO_DATE_DATASET_IN_PROJECT below, which the embedding host retries.
            existingDateFilter = filtersDateDataSet
                ? getDateFilters(appState).find((dateFilter) =>
                      areObjRefsEqual(dateFilter.dateDatasetRef, filtersDateDataSet.ref),
                  )
                : undefined;
        }
    } else {
        existingDateFilter = getFirstDateFilter(appState);
    }

    // Fallback to unavailable date dataset to keep filter context from KD if primary date dataset is not
    // available, i.e., no AD date dataset is available for insight's bucket items combination.
    //
    // AD uses rules for slicing to determine date dataset availability, however there are different rules
    // for filtering, and view by metrics. Until these rules are supported by AQE backend and then AD as well,
    // this is the only way for AD to apply date filter when insight explored from KD is filterable by
    // date but cannot be sliced by it.
    const selectedDateDataset: IDateDataset =
        numberOfDateFilters === 1
            ? getPrimaryDateDataset(appState) ||
              DateDatasetsService.getDateDatasetByIdentifier(appState, datasetIdentifier) ||
              DateDatasetsService.getDateDatasetByUri(appState, datasetUri)
            : DateDatasetsService.getDateDatasetByIdentifier(appState, datasetIdentifier) ||
              DateDatasetsService.getDateDatasetByUri(appState, datasetUri);

    if (!selectedDateDataset) {
        throw new Error(ERROR_NO_DATE_DATASET_IN_PROJECT);
    }
    // validate external date identifier
    if (datasetIdentifier) {
        const validDatasetByIdentifier: IDateDataset = DateDatasetsService.getDateDatasetByIdentifier(
            appState,
            datasetIdentifier,
        );
        if (!validDatasetByIdentifier) {
            throw new Error(ERROR_INVALID_DATE_DATASET_ID);
        }

        return yield call(
            buildDateDatasetFilterItem,
            dateFilter,
            validDatasetByIdentifier.ref,
            existingDateFilter?.localIdentifier || dateFilter.localIdentifier,
            useMultipleDateFilters,
        );
    }
    // validate external date filter uri
    const validDatasetByUri: IDateDataset = DateDatasetsService.getDateDatasetByUri(appState, datasetUri);

    if (!validDatasetByUri) {
        throw new Error(ERROR_INVALID_DATE_DATASET_URI);
    }

    return yield call(
        buildDateDatasetFilterItem,
        dateFilter,
        validDatasetByUri.ref,
        existingDateFilter?.localIdentifier || dateFilter.localIdentifier,
        useMultipleDateFilters,
    );
}

export function* validateExternalDateFilters(
    dateFilters: ITransformedDateFilterItem[],
    isTimeSupported: boolean,
    isSecondsSupported: boolean,
    useMultipleDateFilters = false,
) {
    if (dateFilters.length > 1 && !useMultipleDateFilters) {
        throw new Error(ERROR_INVALID_DATE_FILTER_COUNT);
    }

    dateFilters.forEach((dateFilter) => {
        validateDateFilterValues(dateFilter, isTimeSupported, isSecondsSupported);
    });

    const filtersToUse = useMultipleDateFilters ? dateFilters : [dateFilters[0]];

    const results: SagaReturnType<typeof validateExternalDateFilter>[] = yield all(
        filtersToUse.map((dateFilter) =>
            call(validateExternalDateFilter, dateFilter, useMultipleDateFilters, dateFilters.length),
        ),
    );

    return results;
}

export function* handleSetFilterContextRequested({
    payload: { filters, postMessageContext },
}: ISetFilterContextRequestedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    const isReportSavingState: ReturnType<typeof isReportSaving> = yield select(isReportSaving);
    const isReportOpeningState: ReturnType<typeof isReportOpening> = yield select(isReportOpening);
    const isInvalidState = isReportSavingState || isReportOpeningState;
    const isTimeSupported: ReturnType<typeof supportsTimeGranularities> =
        yield select(supportsTimeGranularities);
    const secondGranularitiesEnabled: ReturnType<typeof enableSecondGranularities> =
        yield select(enableSecondGranularities);
    const isSecondsSupported = isTimeSupported && secondGranularitiesEnabled;

    const supportsMultipleDateFilters: ReturnType<typeof selectSupportsMultipleDateFilters> = yield select(
        selectSupportsMultipleDateFilters,
    );

    try {
        if (isInvalidState) {
            throw new Error(ERROR_INVALID_SET_FILTER_CONTEXT_STATE);
        }

        const hasInvalidFilters = !filterConverters.isValidFiltersFormat(
            filters,
            true,
            isTimeSupported,
            isSecondsSupported,
        );
        const hasSingleSelectionFilters = filters.some(
            (filter) =>
                isPositiveAttributeFilter(filter) &&
                filter.positiveAttributeFilter.selectionMode === "single",
        );

        if (hasInvalidFilters || hasSingleSelectionFilters) {
            throw new Error(ERROR_INVALID_FILTER_DATA_FORMAT);
        }

        const {
            attributeFilters,
            dateFilters,
            rankingFilter,
            arbitraryAttributeFilters,
            matchAttributeFilters,
            measureValueFilters,
        } = filterConverters.transformFilterContext(filters);

        yield call(
            rejectComputedAttributesWhenDisabled,
            [
                ...attributeFilters,
                ...(arbitraryAttributeFilters ?? []),
                ...(matchAttributeFilters ?? []),
            ].some((filter) => filter.dfType === "computedAttribute"),
        );

        const validDateFilters: SagaReturnType<typeof validateExternalDateFilters> | undefined =
            dateFilters.length
                ? yield call(
                      validateExternalDateFilters,
                      dateFilters,
                      isTimeSupported,
                      isSecondsSupported,
                      supportsMultipleDateFilters,
                  )
                : undefined;
        const validAttributeFilters: SagaReturnType<typeof validateExternalAttributeFilters> | undefined =
            attributeFilters.length
                ? yield call(validateExternalAttributeFilters, attributeFilters)
                : undefined;
        const validRankingFilter: SagaReturnType<typeof validateExternalRankingFilter> | undefined =
            rankingFilter ? yield call(validateExternalRankingFilter, rankingFilter) : undefined;
        const validArbitraryFilters: SagaReturnType<typeof validateExternalArbitraryFilters> | undefined =
            arbitraryAttributeFilters?.length
                ? yield call(validateExternalArbitraryFilters, arbitraryAttributeFilters)
                : undefined;
        const validMatchFilters: SagaReturnType<typeof validateExternalMatchFilters> | undefined =
            matchAttributeFilters?.length
                ? yield call(validateExternalMatchFilters, matchAttributeFilters)
                : undefined;

        const attributeBucketItems: ReturnType<typeof getAttributeBucketItems> =
            yield select(getAttributeBucketItems);

        const dateFilterProp = supportsMultipleDateFilters
            ? validDateFilters?.length
                ? { dateFilters: validDateFilters }
                : {}
            : validDateFilters?.length
              ? { dateFilter: validDateFilters[0] }
              : {};

        const validMeasureValueFilters: IUpdateExternalMeasureValueFilterPayload[] | undefined =
            measureValueFilters?.length
                ? measureValueFilters.map(({ measureIdentifier, conditions }) => ({
                      measureIdentifier,
                      ...(conditions?.length ? { conditions } : {}),
                  }))
                : undefined;

        const validExternalFilters: ICommandUpdateFilterItemsActionPayload = {
            ...(validAttributeFilters ? { attributeFilters: validAttributeFilters } : {}),
            ...(validArbitraryFilters ? { arbitraryFilters: validArbitraryFilters } : {}),
            ...(validMatchFilters ? { matchFilters: validMatchFilters } : {}),
            ...dateFilterProp,
            ...(validRankingFilter ? { rankingFilter: validRankingFilter } : {}),
            ...(validMeasureValueFilters?.length ? { measureValueFilters: validMeasureValueFilters } : {}),
        };

        const appState: IAppState = yield select();
        const isOverLimit: SagaReturnType<typeof isOverLimitFilterBarItems> = yield call(
            isOverLimitFilterBarItems,
            appState,
            attributeBucketItems,
            validExternalFilters,
            isElementUrisSupported(),
        );
        if (isOverLimit) {
            throw new Error(ERROR_INVALID_FILTER_ITEMS_COUNT);
        }

        yield put(commandAddOrUpdateFilterItems(validExternalFilters));

        // WAIT FOR THE WRITE: the trigger writes nothing — the operation commits with
        // `filterItemsUpdatedFromCommand` in a LATER dispatch, and the select below reads the
        // filters the command just CREATED to find their generated local identifiers. The operation
        // always fires ONE of the two signals (the event, or the failure carrier when the
        // calculation threw), so this cannot hang; the failure re-throws into the catch below,
        // producing an error reply to the embed host instead of silence.
        const commandOutcome: {
            failed?: ReturnType<typeof filterItemsCommandFailed>;
        } = yield race({
            applied: take(filterItemsUpdatedFromCommand.type),
            failed: take(filterItemsCommandFailed.type),
        });
        if (commandOutcome.failed) {
            throw commandOutcome.failed.payload.error;
        }

        const storedFilters: ReturnType<typeof getFilterItems> = yield select(getFilterItems);
        const updateDisplayAsLabelActions = attributeFilters.reduce((actions, filter) => {
            const matchingValidFilter = validAttributeFilters.find(
                (vaf) => vaf.dfUri === filter.dfUri || vaf.dfIdentifier === filter.dfIdentifier,
            );

            if (matchingValidFilter && filter.displayAsLabel) {
                const storedFilter = storedFilters
                    .filter(FilterBar.isAttributeFilter)
                    .find((sf) => sf.cacheItemIdentifier === matchingValidFilter.cacheItemIdentifier);
                actions.push(
                    put(
                        storeUpdateAttributeFilterDisplayForm({
                            filterLocalIdentifier: storedFilter.localIdentifier,
                            displayAsDfRef: filter.displayAsLabel,
                        }),
                    ),
                );
            }
            return actions;
        }, []);
        yield all(updateDisplayAsLabelActions);

        const attributeFiltersCount =
            (validAttributeFilters?.length || 0) +
            (validArbitraryFilters?.length || 0) +
            (validMatchFilters?.length || 0);
        const hasDateFilter =
            validDateFilters?.some((validDateFilter) => !!Object.keys(validDateFilter).length) || false;
        const hasRankingFilter = !!validRankingFilter;
        yield put(
            setFilterContextFinishedAction(contextId, attributeFiltersCount, hasDateFilter, hasRankingFilter),
        );
    } catch (error) {
        const errorBody: ICommandFailedBody = getAttributeFilterErrorMessage(error);
        if (!errorBody) {
            throw error;
        }

        yield put(setFilterContextFailedAction(errorBody, contextId));
    }
}

function validateDefaultAttributeDisplayForm(
    attributeDFs: IAttributeDisplayFormMetadataObject[],
    attributes: IAttributeMetadataObject[],
) {
    attributeDFs.forEach((displayForm: IAttributeDisplayFormMetadataObject) => {
        const { attribute, uri: displayFormUri } = displayForm;
        const attrUri = isUriRef(attribute) && attribute.uri;
        if (attrUri) {
            const attr = attributes.find((attr: IAttributeMetadataObject) => attr.uri === attrUri);
            const defaultDF = attr.displayForms.find((df) => !!df.isDefault) ?? attr.displayForms[0];
            if (displayFormUri !== defaultDF.uri) {
                throw new Error(ERROR_HAS_NON_DEFAULT_ATTRIBUTE_DISPLAY_FORM);
            }
        }
    });
}

export function* getValidExternalAttributeFilters(externalFilters: ITransformedAttributeFilterItem[]) {
    const appState: IAppState = yield select();
    const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const itemsCached: ReturnType<typeof getItemCache> = yield select(getItemCache);
    const supportsElementUris: ReturnType<typeof isElementUrisSupported> =
        yield select(isElementUrisSupported);
    const { externalFiltersFromCached, externalObjRefs } = mappingDfsFromItemCached(
        appState,
        externalFilters,
        itemsCached,
    );
    if (!externalObjRefs.length) {
        return externalFiltersFromCached;
    }

    // a computed attribute has no labels, so it cannot go through the display form lookup below
    const [computedAttributeRefs, labelRefs] = partition(externalObjRefs, (ref: ObjRef) =>
        isComputedAttributeRef(ref),
    );
    const validatedComputedAttributeFilters: SagaReturnType<typeof validateExternalComputedAttributeFilters> =
        computedAttributeRefs.length
            ? yield call(validateExternalComputedAttributeFilters, externalFilters, computedAttributeRefs)
            : [];
    if (!labelRefs.length) {
        return externalFiltersFromCached.concat(validatedComputedAttributeFilters);
    }

    const attributeDFs: IAttributeDisplayFormMetadataObject[] = yield call(
        getAttributeDisplayFormsByObjectRefs,
        labelRefs,
    );
    const attributeRefs = attributeDFs.map(
        (attributeDisplayFormObject: IAttributeDisplayFormMetadataObject) =>
            attributeDisplayFormObject.attribute,
    );
    const attributeObjects: IAttributeMetadataObject[] = yield call(getAttributes, projectId, attributeRefs);
    validateDefaultAttributeDisplayForm(attributeDFs, attributeObjects);

    const deserializedAttributes = convertToItemCache(attributeObjects, supportsElementUris);

    yield put(updateItemCache(deserializedAttributes));

    // update displayFrom uris in externalFilters
    const validatedExternalFilters: ITransformedAttributeFilterItem[] = attributeDFs.map(
        (attributeDfObject: IAttributeDisplayFormMetadataObject): ITransformedAttributeFilterItem => {
            const { uri, id: identifier } = attributeDfObject;
            const externalFilterItem = externalFilters.find(
                (externalFilterItem: ITransformedAttributeFilterItem): boolean =>
                    externalFilterItem.dfUri === uri || externalFilterItem.dfIdentifier === identifier,
            );
            const localIdentifier = supportsElementUris
                ? getLocalIdentifierByDfUri(appState, uri)
                : getLocalIdentifierByDfIdentifier(appState, identifier);
            const attributeKey = Object.keys(deserializedAttributes).find((key: string): boolean => {
                const attribute = deserializedAttributes[key];
                if (supportsElementUris) {
                    return attribute.dfUri === uri || attribute.dfUris?.some((dfUri) => dfUri === uri);
                } else {
                    return (
                        attribute.identifier === identifier ||
                        attribute.dfIdentifiers?.some((dfIdentifier) => dfIdentifier === identifier)
                    );
                }
            });
            const cacheItemIdentifier = deserializedAttributes[attributeKey].identifier;

            return {
                ...externalFilterItem,
                dfIdentifier: identifier,
                dfUri: uri,
                localIdentifier,
                cacheItemIdentifier,
            };
        },
    );

    return externalFiltersFromCached.concat(validatedComputedAttributeFilters, validatedExternalFilters);
}

/**
 * Resolves external filters on computed attributes that are not in the item cache yet.
 *
 * A computed attribute has no labels: its single display form is fabricated client side and shares
 * the computed attribute's own ref. It therefore cannot be resolved through the display forms lookup
 * the label filters go through; it is loaded through its own service and cached in its own item cache
 * namespace so that it never shadows a plain attribute sharing the identifier.
 */
function* validateExternalComputedAttributeFilters(
    externalFilters: ITransformedAttributeFilterItem[],
    computedAttributeRefs: ObjRef[],
): SagaIterator<ITransformedAttributeFilterItem[]> {
    const computedAttributes: SagaReturnType<typeof getComputedAttributesByObjectRefs> = yield call(
        getComputedAttributesByObjectRefs,
        computedAttributeRefs,
    );

    yield put(updateItemCache(convertComputedAttributesToItemCache(computedAttributes)));

    const appState: IAppState = yield select();

    return computedAttributes.map((computedAttribute): ITransformedAttributeFilterItem => {
        const { id: identifier, uri } = computedAttribute;
        const externalFilterItem = externalFilters.find(
            (item) => item.dfType === "computedAttribute" && item.dfIdentifier === identifier,
        );

        return {
            ...externalFilterItem,
            dfIdentifier: identifier,
            dfUri: uri,
            localIdentifier: getLocalIdentifierByDfIdentifier(appState, identifier, "computedAttribute"),
            cacheItemIdentifier: identifier,
        };
    });
}

function* getComputedAttributesByObjectRefs(
    objRefs: ObjRef[],
): SagaIterator<IComputedAttributeMetadataObject[]> {
    const projectId: string = yield select(getProjectId);
    try {
        const computedAttributes: IComputedAttributeMetadataObject[] = yield call(
            getComputedAttributes,
            projectId,
            objRefs,
        );

        if (computedAttributes.length !== objRefs.length) {
            throw new Error(ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM);
        }

        return computedAttributes;
    } catch (error) {
        if (isUnexpectedResponseError(error) && error.httpStatus === 404) {
            throw new Error(ERROR_INVALID_ATTRIBUTE_FILTER_ID);
        }

        throw new Error(ERROR_BAD_ATTRIBUTE_FILTER_DISPLAY_FORM);
    }
}

const convertComputedAttributesToItemCache = (
    computedAttributes: IComputedAttributeMetadataObject[],
): Record<string, ICacheItem> => {
    return computedAttributes.reduce(
        (cacheItems: Record<string, ICacheItem>, computedAttribute: IComputedAttributeMetadataObject) => {
            const { displayForms } = computedAttribute;
            const [displayForm] = displayForms;
            cacheItems[computedAttributeCacheKey(computedAttribute.id)] = {
                title: computedAttribute.title,
                identifier: computedAttribute.id,
                uri: computedAttribute.uri,
                type: "computedAttribute",
                summary: computedAttribute.description,
                expression: computedAttribute.expression,
                ref: computedAttribute.ref,
                dfRef: displayForm?.ref ?? computedAttribute.ref,
                dfUri: displayForm?.uri,
                dfUris: displayForms.map(({ uri }) => uri),
                dfIdentifier: displayForm?.id ?? computedAttribute.id,
                dfIdentifiers: displayForms.map(({ id }) => id),
                displayForms,
            };

            return cacheItems;
        },
        {},
    );
};

function* buildDateDatasetFilterItem(
    dateFilter: ITransformedDateFilterItem,
    dateDatasetRef: ObjRef,
    localIdentifier: string | undefined,
    useMultipleDateFilters: boolean,
): SagaIterator<IUpdateDateFilterActionPayload> {
    const appState: IAppState = yield select();

    const index = getDateFilterIndex(appState, localIdentifier);
    // should be done only for first date filter
    const includeOverTimeComparison = index === 0 || !useMultipleDateFilters;

    const dateDataFilter = useMultipleDateFilters
        ? getDateFilter(appState, localIdentifier)
        : getFirstDateFilter(appState);
    const { granularity } = dateFilter;
    const overTimeComparisonMeasures: ReturnType<typeof selectedOverTimeComparisonMeasures> = yield select(
        selectedOverTimeComparisonMeasures,
    );
    let overTimeComparisonType: OverTimeComparisonType = "nothing";

    if (dateDataFilter?.overTimeComparisonType && granularity !== filterConverters.ALL_TIME_GRANULARITY) {
        overTimeComparisonType = dateDataFilter.overTimeComparisonType;
    }

    return {
        ...(dateDataFilter
            ? { localIdentifier: dateDataFilter.localIdentifier }
            : {
                  localIdentifier: useMultipleDateFilters
                      ? (localIdentifier ?? generateBucketItemIdentifier())
                      : undefined,
              }),
        dateDatasetRef,
        overTimeComparisonType: includeOverTimeComparison ? overTimeComparisonType : "nothing",
        filterConfig: buildDateFilterConfig(dateFilter),
        overTimeComparisonMeasures: includeOverTimeComparison ? overTimeComparisonMeasures : [],
    };
}

function* handleSetFilterContextFinished({
    payload: { postMessageContext },
}: ISetFilterContextFinishedAction) {
    const availableCommands: ReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    const contextId = getPostMessageContextId(postMessageContext);

    yield call(setFilterContextFinishedEvent, availableCommands, contextId);
}

function* handleSetFilterContextFailed({
    payload: { postMessageContext, errorBody },
}: ISetFilterContextFailedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    yield call(invalidCommand, errorBody, contextId);
}

function getLocalIdentifierByDfUri(state: IAppState, dfUri = ""): string {
    const itemsCached = getItemCache(state);
    const itemCached = getItemCacheByDfUriFromAvailableDisplayForms(dfUri, itemsCached);
    const identifier = itemCached?.identifier ?? "";
    const filterBarItem = getAttributeFilterById(state, identifier);

    return filterBarItem?.localIdentifier;
}

function getLocalIdentifierByDfIdentifier(
    state: IAppState,
    dfIdentifier = "",
    dfType?: DisplayFormRefType,
): string {
    const itemsCached = getItemCache(state);
    const itemCached = getItemCacheByDfIdentifierFromAvailableDisplayForms(dfIdentifier, itemsCached, dfType);
    const identifier = itemCached?.identifier ?? "";
    const filterBarItem = getAttributeFilterById(state, identifier);

    return filterBarItem?.localIdentifier;
}

export function isOverLimitFilterBarItems(
    appState: IAppState,
    attributeBucketItems: IRawBucketItems,
    validFilterItems: ICommandUpdateFilterItemsActionPayload,
    supportsElementUris: boolean,
) {
    const { attributeFilters = [], arbitraryFilters = [], matchFilters = [], dateFilter } = validFilterItems;

    // external attribute filters are not exist on filter bar
    let newExternalAttributeFilters: IUpdateAttributeFilterActionPayload[] = attributeFilters.filter(
        (externalAttribute: IUpdateAttributeFilterActionPayload): boolean =>
            supportsElementUris
                ? !getLocalIdentifierByDfUri(appState, externalAttribute.dfUri)
                : !getLocalIdentifierByDfIdentifier(
                      appState,
                      externalAttribute.dfIdentifier,
                      externalAttribute.dfType,
                  ),
    );

    // external attribute filters are not exist on buckets
    newExternalAttributeFilters = newExternalAttributeFilters.filter(
        (externalAttribute: IUpdateAttributeFilterActionPayload): boolean => {
            const matchedAttributeBucketItem: Readonly<IRawBucketItem> = attributeBucketItems.find(
                ({ dfUri, dfIdentifier, isComputedAttribute }): boolean =>
                    supportsElementUris
                        ? dfUri === externalAttribute.dfUri
                        : dfIdentifier === externalAttribute.dfIdentifier &&
                          // a label and a computed attribute may share the identifier
                          !!isComputedAttribute === (externalAttribute.dfType === "computedAttribute"),
            );
            return !matchedAttributeBucketItem;
        },
    );

    // max 20 filters is including attribute, date and measure value filter
    const filterBarAttributeItems = getFilterItemsWithoutAdditionalDateAttributes(appState);

    // external date filter is not existed on filter bar or on buckets
    let newExternalDateFilterCount = 0;
    const existedDateFilter =
        filterBarAttributeItems.find(FilterBar.isDateFilter) || getDateBucketItem(appState);
    if (dateFilter && !existedDateFilter) {
        newExternalDateFilterCount = 1;
    }

    // external additional date attributes count
    const flatDateDatasets = DateDatasetsMetaService.getDateDatasetsMetaItems(appState).flatMap(
        (dateDataset: IDateDatasetsMetaItem) => dateDataset.attributes,
    );
    const additionalDateAttributesCount = newExternalAttributeFilters.filter((item) =>
        flatDateDatasets.some((dateDataset: IDateDatasetAttribute) => dateDataset.dfUri === item.dfUri),
    ).length;

    // arbitrary and match filters without filterLocalIdentifier add new filter bar items
    const newArbitraryFiltersCount = arbitraryFilters.filter((f) => !f.filterLocalIdentifier).length;
    const newMatchFiltersCount = matchFilters.filter((f) => !f.filterLocalIdentifier).length;

    // additional date attributes should not affect filter count
    const newExternalFilterCount =
        newExternalAttributeFilters.length +
        newExternalDateFilterCount -
        additionalDateAttributesCount +
        newArbitraryFiltersCount +
        newMatchFiltersCount;
    const allFiltersCount = filterBarAttributeItems.length + newExternalFilterCount;

    // only check for max 20 filters when adding new filters (newExternalFilterCount > 0)
    return newExternalFilterCount > 0 && allFiltersCount > MAX_ATTRIBUTE_FILTERS_COUNT;
}

export function mappingDfsFromItemCached(
    state: IAppState,
    externalFilters: ITransformedAttributeFilterItem[],
    itemsCached: ICatalogEntries,
): IMappingFilterItems {
    return externalFilters.reduce(
        (mappingItem: IMappingFilterItems, filterItem: ITransformedAttributeFilterItem) => {
            const { dfUri, dfIdentifier, dfType } = filterItem;
            const itemCached = dfUri
                ? getItemCacheByDfUriFromAvailableDisplayForms(dfUri, itemsCached)
                : getItemCacheByDfIdentifierFromAvailableDisplayForms(dfIdentifier, itemsCached, dfType);

            if (itemCached) {
                // update cacheItemIdentifier in external attribute filter
                const cacheItemIdentifier = itemCached.identifier;
                const filterBarItem = getAttributeFilterById(state, cacheItemIdentifier);
                const validFilterItem = {
                    ...filterItem,
                    dfUri: dfUri ?? itemCached.dfUri,
                    dfIdentifier: dfIdentifier ?? itemCached.dfIdentifier,
                    cacheItemIdentifier,
                    localIdentifier: filterBarItem?.localIdentifier,
                };
                mappingItem.externalFiltersFromCached.push(validFilterItem);
            } else {
                // external attribute is not existed in itemCache, should get attribute info from server;
                // a computed attribute keeps its type, that is what routes it to its own lookup
                const objRef = dfUri
                    ? uriRef(dfUri)
                    : dfType === "computedAttribute"
                      ? idRef(dfIdentifier, "computedAttribute")
                      : idRef(dfIdentifier);
                mappingItem.externalObjRefs.push(objRef);
            }
            return mappingItem;
        },
        {
            externalObjRefs: [],
            externalFiltersFromCached: [],
        },
    );
}

function getLocationDisplayFormUri(attribute: IAttributeMetadataObject): string {
    const displayForms = attribute.displayForms || [];
    const locationDisplayForm = displayForms.find(
        (displayForm: IAttributeDisplayFormMetadataObject): boolean => {
            const displayFormType: AttributeDisplayFormType =
                displayForm.displayFormType as AttributeDisplayFormType;
            return (
                displayFormType === "GDC.geo.pin" ||
                displayFormType === "GDC.geo.pin_latitude" ||
                displayFormType === "GDC.geo.pin_longitude"
            );
        },
    );

    return locationDisplayForm?.uri;
}

function getLocalIdentifiersByDfUris(appState: IAppState, dfUris: string[]): string[] {
    return dfUris.reduce((localIdentifiers: string[], uri: string): string[] => {
        const localIdentifier = getLocalIdentifierByDfUri(appState, uri);
        // valid attribute filter on filterBar
        if (localIdentifier) {
            localIdentifiers.push(localIdentifier);
        }
        return localIdentifiers;
    }, []);
}

function getLocalIdentifiersByDfIdentifiers(
    appState: IAppState,
    displayForms: IRemoveFilterDisplayFormIdentifier[],
): string[] {
    return displayForms.reduce((localIdentifiers: string[], { identifier, dfType }): string[] => {
        const localIdentifier = getLocalIdentifierByDfIdentifier(appState, identifier, dfType);
        if (localIdentifier) {
            localIdentifiers.push(localIdentifier);
        }
        return localIdentifiers;
    }, []);
}

const convertToItemCache = (
    attributes: IAttributeMetadataObject[],
    supportsElementUris: boolean,
): Record<string, ICacheItem> => {
    return attributes.reduce(
        (cacheAttributes: Record<string, ICacheItem>, attribute: IAttributeMetadataObject) => {
            cacheAttributes[attribute.id] = {
                title: attribute.title,
                identifier: attribute.id,
                uri: attribute.uri,
                type: "attribute",
                summary: attribute.description,
                dfUri: attribute.displayForms[0].uri,
                dfUris: attribute.displayForms.map(({ uri }) => uri),
                dfIdentifiers: attribute.displayForms.map(({ id }) => id),
                displayForms: attribute.displayForms,
                ref: supportsElementUris ? uriRef(attribute.uri) : idRef(attribute.id),
                dfRef: supportsElementUris
                    ? uriRef(attribute.displayForms[0].uri)
                    : idRef(attribute.displayForms[0].id),
                expression: "",
                locationDisplayFormUri: getLocationDisplayFormUri(attribute),
            };

            return cacheAttributes;
        },
        {},
    );
};

// Remove filter context
export function* handleRemoveFilterContextRequested({
    payload: { filters, postMessageContext },
}: IRemoveFilterContextRequestedAction) {
    const contextId = getPostMessageContextId(postMessageContext);

    try {
        const isReportSavingState: ReturnType<typeof isReportSaving> = yield select(isReportSaving);
        const isReportOpeningState: ReturnType<typeof isReportOpening> = yield select(isReportOpening);
        const isInvalidState = isReportSavingState || isReportOpeningState;

        if (isInvalidState) {
            throw new Error(ERROR_INVALID_REMOVE_FILTER_CONTEXT_STATE);
        }

        const appState: IAppState = yield select();
        const filterBarItemsCount = getFilterItems(appState).length;
        if (!filterBarItemsCount) {
            throw new Error(ERROR_INVALID_REMOVE_FILTER_CONTEXT_COUNT);
        }

        if (!filterConverters.isValidRemoveFiltersFormat(filters)) {
            throw new Error(ERROR_INVALID_FILTER_DATA_FORMAT);
        }

        const removeExternalDateFilters = filters.filter(isRemoveDateFilter);
        const dateFilterLocalIdentifiers: SagaReturnType<typeof validateRemoveDateFilters> =
            removeExternalDateFilters.length
                ? yield call(validateRemoveDateFilters, removeExternalDateFilters)
                : [];
        const removeExternalAttributeFilters = filters.filter(isRemoveAttributeFilter);
        const attributeFilterLocalIdentifiers: SagaReturnType<typeof validateRemoveAttributeFilters> =
            removeExternalAttributeFilters.length
                ? yield call(validateRemoveAttributeFilters, removeExternalAttributeFilters)
                : [];

        const removeExternalRankingFilter = filters.find(isRemoveRankingFilter);
        const rankingFilterLocalIdentifier: SagaReturnType<typeof validateRemoveRankingFilter> = yield call(
            validateRemoveRankingFilter,
            removeExternalRankingFilter,
        );
        const rankingFilterLocalIdentifiers = rankingFilterLocalIdentifier
            ? [rankingFilterLocalIdentifier]
            : [];

        const validRemoveFilterItems = [
            ...dateFilterLocalIdentifiers,
            ...attributeFilterLocalIdentifiers,
            ...rankingFilterLocalIdentifiers,
        ];
        yield put(removeFilterItemsFromState(validRemoveFilterItems, false));

        yield put(
            removeFilterContextFinishedAction(
                contextId,
                attributeFilterLocalIdentifiers.length,
                !!dateFilterLocalIdentifiers.length,
                !!rankingFilterLocalIdentifiers.length,
            ),
        );
    } catch (error) {
        const errorBody = getAttributeFilterErrorMessage(error);
        yield put(removeFilterContextFailedAction(errorBody, contextId));
        return;
    }
}

function* handleRemoveFilterContextFailed({
    payload: { postMessageContext, errorBody },
}: IRemoveFilterContextFailedAction) {
    const contextId = getPostMessageContextId(postMessageContext);
    yield call(invalidCommand, errorBody, contextId);
}

function* handleRemoveFilterContextFinished({
    payload: { postMessageContext },
}: IRemoveFilterContextFinishedAction) {
    const availableCommands: SagaReturnType<typeof availableCommandsSelector> =
        yield select(availableCommandsSelector);
    const contextId = getPostMessageContextId(postMessageContext);

    yield call(removeFilterContextFinishedEvent, availableCommands, contextId);
}

function* handleRemoveFilterItems(action: IRemoveFilterItemsAction) {
    const { localIdentifiers, isFromFilterBarDropdown } = action.payload;
    const appState: IAppState = yield select();
    const filters = getFilterItems(appState).filter((filter: IFilter) =>
        localIdentifiers.includes(filter.localIdentifier),
    );

    yield put(removeFiltersFromState(localIdentifiers, isFromFilterBarDropdown));
    yield put(filtersWereChanged([], filters));
    yield call(sanitizeFilters);
}

export function* validateRemoveDateFilters(dateFilters: IRemoveDateFilterItem[]) {
    const removeExternalDateFiltersCount = dateFilters.length;
    if (removeExternalDateFiltersCount > 1) {
        throw new Error(ERROR_INVALID_DATE_FILTER_COUNT);
    }

    const appState: IAppState = yield select();
    const { identifier, uri } = filterConverters.getObjectUriIdentifier(dateFilters[0].dataSet);
    const selectedDateDataset: IDateDataset = getPrimaryDateDataset(appState);
    const existedDateFilterOnFilterBar: IDateFilter = getFirstDateFilter(appState);

    if (!selectedDateDataset) {
        throw new Error(ERROR_NO_DATE_DATASET_IN_PROJECT);
    }

    const dateFilterDateDataset: IDateDataset = DateDatasetsService.getDateDatasetByRef(
        appState,
        existedDateFilterOnFilterBar.dateDatasetRef,
    );

    // validate external date filter identifier
    if (identifier) {
        if (identifier !== dateFilterDateDataset.identifier || !existedDateFilterOnFilterBar) {
            throw new Error(ERROR_REMOVE_NON_EXISTENT_FILTERS);
        }

        return [existedDateFilterOnFilterBar.localIdentifier];
    }

    // validate external date filter uri
    if (uri !== dateFilterDateDataset.uri || !existedDateFilterOnFilterBar) {
        throw new Error(ERROR_REMOVE_NON_EXISTENT_FILTERS);
    }

    return [existedDateFilterOnFilterBar.localIdentifier];
}

export function* validateRemoveRankingFilter(externalRemoveRankingFilter?: IRemoveRankingFilterItem) {
    if (!externalRemoveRankingFilter) {
        return null;
    }
    const rankingFilter: ReturnType<typeof getRankingFilter> = yield select(getRankingFilter);
    return rankingFilter?.localIdentifier;
}

export function* validateRemoveAttributeFilters(externalAttFilters: IRemoveAttributeFilterItem[]) {
    // list of uris/identifiers from external filters
    const { identifiers, uris } = externalAttFilters.reduce(
        (
            mappingRemoveFilters: IMappingRemoveFilterItems,
            attributeFilter: IRemoveAttributeFilterItem,
        ): IMappingRemoveFilterItems => {
            const { identifier, uri, type } = filterConverters.getObjectUriIdentifier(
                attributeFilter.displayForm,
            );
            if (identifier) {
                mappingRemoveFilters.identifiers.push({
                    identifier,
                    dfType: toDisplayFormRefType(type),
                });
            }
            if (uri) {
                mappingRemoveFilters.uris.push(uri);
            }
            return mappingRemoveFilters;
        },
        { identifiers: [], uris: [] },
    );

    if (uniq(uris).length !== uris.length) {
        throw new Error(ERROR_DUPLICATED_ATTRIBUTE_FILTER_URIS);
    }

    yield call(
        rejectComputedAttributesWhenDisabled,
        identifiers.some(({ dfType }) => dfType === "computedAttribute"),
    );

    // a label and a computed attribute sharing the identifier are two different filters
    if (
        uniqBy(identifiers, ({ identifier, dfType }) => `${dfType}.${identifier}`).length !==
        identifiers.length
    ) {
        throw new Error(ERROR_DUPLICATED_ATTRIBUTE_FILTER_IDENTIFIERS);
    }

    // validate external attribute filters uris; computed attributes have no labels and resolve through
    // their own service
    const appState: IAppState = yield select();
    const [computedAttributeIdentifiers, labelIdentifiers] = partition(
        identifiers,
        ({ dfType }) => dfType === "computedAttribute",
    );
    const objRefs: ObjRef[] = [];
    labelIdentifiers.forEach(({ identifier }) => objRefs.push(idRef(identifier, "displayForm")));
    uris.forEach((uri) => objRefs.push(uriRef(uri)));
    const attributeDFs: SagaReturnType<typeof getAttributeDisplayFormsByObjectRefs> = objRefs.length
        ? yield call(getAttributeDisplayFormsByObjectRefs, objRefs)
        : [];
    const computedAttributes: SagaReturnType<typeof getComputedAttributesByObjectRefs> =
        computedAttributeIdentifiers.length
            ? yield call(
                  getComputedAttributesByObjectRefs,
                  computedAttributeIdentifiers.map(({ identifier }) =>
                      idRef(identifier, "computedAttribute"),
                  ),
              )
            : [];

    const supportsElementUris: ReturnType<typeof isElementUrisSupported> =
        yield select(isElementUrisSupported);
    const validRemoveAttFilters = supportsElementUris
        ? getLocalIdentifiersByDfUris(
              appState,
              attributeDFs.map((df) => df.uri),
          )
        : getLocalIdentifiersByDfIdentifiers(appState, [
              ...attributeDFs.map((df) => ({
                  identifier: df.id,
                  dfType: "displayForm" as const,
              })),
              ...computedAttributes.map((computedAttribute) => ({
                  identifier: computedAttribute.id,
                  dfType: "computedAttribute" as const,
              })),
          ]);
    if (validRemoveAttFilters.length !== attributeDFs.length + computedAttributes.length) {
        throw new Error(ERROR_REMOVE_NON_EXISTENT_FILTERS);
    }

    return validRemoveAttFilters;
}

export function* watchControlFiltering() {
    yield takeEvery(PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED, handleSetFilterContextRequested);
    yield takeEvery(PostEventActionTypeKeys.SET_FILTER_CONTEXT_FAILED, handleSetFilterContextFailed);
    yield takeEvery(PostEventActionTypeKeys.SET_FILTER_CONTEXT_FINISHED, handleSetFilterContextFinished);
    yield takeEvery(
        PostEventActionTypeKeys.REMOVE_FILTER_CONTEXT_REQUESTED,
        handleRemoveFilterContextRequested,
    );
    yield takeEvery(PostEventActionTypeKeys.REMOVE_FILTER_CONTEXT_FAILED, handleRemoveFilterContextFailed);
    yield takeEvery(
        PostEventActionTypeKeys.REMOVE_FILTER_CONTEXT_FINISHED,
        handleRemoveFilterContextFinished,
    );
    yield takeEvery(PostEventActionTypeKeys.STORE_REMOVE_FILTER_ITEMS, handleRemoveFilterItems);
}
