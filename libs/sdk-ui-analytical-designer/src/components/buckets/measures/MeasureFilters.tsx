// (C) 2007-2026 GoodData Corporation

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IAttributeElement, type ObjRef, objRefToString } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { addMessage } from "../../../actions/messages_actions.js";
import { MEASURES } from "../../../constants/bucket.js";
import { MAX_ATTRIBUTE_FILTERS_COUNT } from "../../../constants/catalog_filters.js";
import { type IDecoratedDateFilter } from "../../../models/date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "../../../models/date_item.js";
import { type IDecoratedMetricAttributeFilter } from "../../../models/decorated_metric_attribute_filter.js";
import {
    areGenericDateAttributeElementsSupported,
    selectSupportsMultipleDateFilters,
} from "../../../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../../../selectors/bootstrap_selector.js";
import { filterSupportedDisplayForms } from "../../../selectors/buckets_selector.js";
import {
    enableComputedAttributes,
    enableImprovedMetricDateFilter,
    getAvailableSelectionTypes,
} from "../../../selectors/feature_flag_selector.js";
import { measureHasDerived } from "../../../selectors/measure_date_filter_selector.js";
import { getTagsConfiguration } from "../../../selectors/route_selector.js";
import { isLocationIconEnabled } from "../../../services/reference_point_service.js";
import {
    type IMetricDateFilterApplyPayload,
    setBucketItemAddMetricFilter,
    setBucketItemAddMetricFilters,
    setBucketItemApplyMetricDateFilter,
    setBucketItemRemoveMetricFilter,
    setBucketItemUpdateMetricFilter,
    setBucketItemUpdateMetricFilterDisplayForm,
} from "../../../store/bucket_filters/bucket_filters_actions.js";
import { isMetricAdditionalDateFilter } from "../../../store/bucket_filters/metric_additional_date_filters.js";
import { getDateDatasetsMetaItems } from "../../../store/date_datasets_meta/date_datasets_meta_selectors.js";
import { flattenDateDatasetAttributes } from "../../../store/filter_bar/filter_bar_helpers.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";
import { type IBucketItemMetricFilter } from "../../../typings/bucket_item_filter.js";
import { type IDecoratedBucketItem } from "../../../typings/buckets.js";
import {
    type IDecoratedMetricFilter,
    type IDecoratedMetricFilters,
    type IUpdateAttributeFilterPayload,
    isDecoratedDateFilter,
    isDecoratedMetricAttributeFilter,
} from "../../../typings/measure_filters.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";
import { getCssClass } from "../../../utils/css_class.js";
import { AttributeFilter } from "../../AttributeFilter/AttributeFilter.js";
import { MetricAttributeFilterButtonWithClassName } from "../../AttributeFilter/components/MetricAttributeFilterButton.js";
import { MeasureAttributeFilterOrganized } from "../MeasureAttributeFilterOrganized.js";
import { type IMeasureAttributeFilterItem } from "../MeasureAttributeListItemOrganized.js";
import { MeasureDateFilter } from "../MeasureDateFilter.js";

import { MeasureAddFilterDropdown } from "./MeasureAddFilterDropdown.js";

export interface IMeasureFiltersProps {
    bucketLocalIdentifier: string;
    bucketItem?: IDecoratedBucketItem;
}

export const MeasureFilters = memo(function MeasureFilters({
    bucketLocalIdentifier,
    bucketItem,
}: IMeasureFiltersProps) {
    const dispatch = useDispatch<AppDispatch>();
    const intl = useIntl();

    const projectId = useSelector(getProjectId);
    const tagsConfiguration = useSelector(getTagsConfiguration);
    const locationIconEnabled = useSelector(isLocationIconEnabled);
    const availableSelectionTypes = useSelector(getAvailableSelectionTypes);
    const computedAttributesEnabled = useSelector(enableComputedAttributes);
    const improvedMetricDateFilterEnabled = useSelector(enableImprovedMetricDateFilter);
    const additionalDateFiltersEditable = areGenericDateAttributeElementsSupported();
    // several date filters per metric, as in the filter bar
    const multipleDateFiltersEnabled = improvedMetricDateFilterEnabled && selectSupportsMultipleDateFilters();
    const dateDatasetsMetaItems = useSelector(getDateDatasetsMetaItems);
    // a metric with a derived (over time) measure cannot be filtered by date, as its chip says
    const hasDerivedMeasure = useSelector((state: IAppState) => measureHasDerived(state, { bucketItem }));
    const dateDatasetAttributes = useMemo(
        () => flattenDateDatasetAttributes(dateDatasetsMetaItems),
        [dateDatasetsMetaItems],
    );

    const [autoOpenAttributeFilterIdentifier, setAutoOpenAttributeFilterIdentifier] = useState("");
    // The position of the date filter the "Add filter" menu is adding: its chip is mounted empty
    // with its picker opening at once, which adds the All time filter the picker then edits. The
    // chip stays as the filter lands at that position; the pending state is dropped then, or when
    // the picker closes before the filter lands (its date datasets were still loading).
    const [addingDateFilterIndex, setAddingDateFilterIndex] = useState<number | null>(null);

    const onAddFilter = useCallback(
        (attribute: ICatalogEntry, selectedDateDatasetIdentifier: string = undefined) => {
            const item = bucketItem.original;

            dispatch(setBucketItemAddMetricFilter(item, attribute, selectedDateDatasetIdentifier));

            const identifier = attribute?.identifier;

            if (identifier !== DATE_DATASET_ATTRIBUTE) {
                setAutoOpenAttributeFilterIdentifier(identifier);
            }
        },
        [bucketItem, dispatch],
    );

    const nonDateFiltersCount = (bucketItem.filters || []).filter((filter) => !filter.isDate).length;

    // The "Add filter" menu's picker is multi-select: the picked attributes land as one gesture,
    // capped at the room left under the attribute filter maximum (the picker has no selection
    // limit of its own, so the user is told when picks are left out), and a single one opens its
    // element picker the way the legacy add did.
    const onAddAttributeFilters = useCallback(
        (pickedAttributes: IMeasureAttributeFilterItem[]) => {
            const attributes = pickedAttributes.slice(
                0,
                Math.max(0, MAX_ATTRIBUTE_FILTERS_COUNT - nonDateFiltersCount),
            );
            if (attributes.length === 0) {
                return;
            }
            dispatch(setBucketItemAddMetricFilters(bucketItem.original, attributes));
            setAutoOpenAttributeFilterIdentifier(attributes.length === 1 ? attributes[0].identifier : "");
            if (attributes.length < pickedAttributes.length) {
                dispatch(
                    addMessage({
                        translationKey: defineMessage({
                            id: "dashboard.bucket.add_filter.attribute_limit_reached",
                        }).id,
                        type: "warning",
                        values: {
                            added: String(attributes.length),
                            picked: String(pickedAttributes.length),
                            max: String(MAX_ATTRIBUTE_FILTERS_COUNT),
                        },
                    }),
                );
            }
        },
        [bucketItem, dispatch, nonDateFiltersCount],
    );

    const onUpdateFilter = useCallback(
        // the payload is the attribute-filter changes OR the synthetic date filter the date path builds
        (filter: IDecoratedMetricFilter, payload: IUpdateAttributeFilterPayload | IDecoratedDateFilter) => {
            const item = bucketItem.original;

            setAutoOpenAttributeFilterIdentifier("");

            dispatch(setBucketItemUpdateMetricFilter(item, filter.original, payload));
        },
        [bucketItem, dispatch],
    );

    const onUpdateFilterDisplayForm = useCallback(
        (filter: IDecoratedMetricAttributeFilter) => {
            const itemLocalIdentifier = bucketItem.original?.localIdentifier;
            const filterAttribute = filter.original?.attribute;

            return (dfRef: ObjRef, currentDisplayFormRef: ObjRef, selectedElements: IAttributeElement[]) => {
                dispatch(
                    setBucketItemUpdateMetricFilterDisplayForm({
                        itemLocalIdentifier,
                        filterAttribute,
                        filterLocalIdentifier: filter.original?.localIdentifier,
                        displayAsDfRef: dfRef,
                        primaryDfRef: currentDisplayFormRef,
                        selectedElements,
                    }),
                );
            };
        },
        [bucketItem, dispatch],
    );

    const onCloseFilter = useCallback(() => {
        setAutoOpenAttributeFilterIdentifier("");
    }, []);

    const onRemoveFilter = useCallback(
        (filter: IBucketItemMetricFilter, removeAdditionalDateFilters: boolean = false) => {
            const item = bucketItem.original;

            dispatch(setBucketItemRemoveMetricFilter(item, filter, removeAdditionalDateFilters));
        },
        [bucketItem, dispatch],
    );

    const onApplyDateFilter = useCallback(
        (payload: IMetricDateFilterApplyPayload) => {
            dispatch(setBucketItemApplyMetricDateFilter(bucketItem.original, payload));
        },
        [bucketItem, dispatch],
    );

    const onAddingDateFilterPickerClosed = useCallback(() => {
        setAddingDateFilterIndex(null);
    }, []);

    // With the shared date filter picker, the metric's attribute filters on its date dataset's own
    // attributes are edited inside that picker, like the filter bar's additional date filters.
    const isAdditionalDateFilter = (filter: IDecoratedMetricFilter): boolean =>
        improvedMetricDateFilterEnabled &&
        isDecoratedMetricAttributeFilter(filter) &&
        isMetricAdditionalDateFilter(filter.original, dateDatasetAttributes);

    const renderAttributeFilter = (filter: IDecoratedMetricAttributeFilter) => {
        const onApply = (payload: IUpdateAttributeFilterPayload) => onUpdateFilter(filter, payload);
        const onClick = () => onRemoveFilter(filter.original);

        const allDisplayForms = filter.attribute?.displayForms || [];
        const availableDisplayForms = filterSupportedDisplayForms(allDisplayForms);
        const onDisplayFormChange = onUpdateFilterDisplayForm(filter);

        const filterDefRef = filter.attribute?.dfRef;
        const key = objRefToString(filterDefRef);

        const attributeIdentifier = filter.attribute?.identifier;

        const sClass = getCssClass(attributeIdentifier, "s-id-");
        const removeButtonClass = getCssClass(attributeIdentifier, "s-remove-attribute-filter-id-");
        const wrapperClass = getCssClass(attributeIdentifier, "s-attribute-filter-wrapper-id-");

        const MetricButton = MetricAttributeFilterButtonWithClassName(sClass);

        return (
            <div
                key={`wrapper-${key}`}
                className={cx("metric-filter-wrapper", "adi-attribute-filters-list", wrapperClass)}
            >
                <AttributeFilter
                    key={key}
                    bucketType={MEASURES}
                    autoOpen={attributeIdentifier === autoOpenAttributeFilterIdentifier}
                    filter={filter}
                    onApply={onApply}
                    onClose={onCloseFilter}
                    useAlternativeDisplayForms
                    onDisplayFormChange={onDisplayFormChange}
                    availableDisplayForms={availableDisplayForms}
                    availableSelectionTypes={availableSelectionTypes}
                    dropdownButtonComponent={MetricButton}
                />

                <Button
                    className={cx(
                        "gd-button-link gd-button-icon-only gd-icon-cross remove-filter s-remove-attribute-filter",
                        removeButtonClass,
                    )}
                    onClick={onClick}
                />
            </div>
        );
    };

    const renderAttributeFilters = (filters: IDecoratedMetricFilters) => {
        return filters
            .filter(isDecoratedMetricAttributeFilter)
            .map((filter) => renderAttributeFilter(filter));
    };

    const renderAttributePicker = () => {
        if (nonDateFiltersCount >= MAX_ATTRIBUTE_FILTERS_COUNT) {
            return null;
        }

        return (
            <MeasureAttributeFilterOrganized
                projectId={projectId}
                bucketLocalIdentifier={bucketLocalIdentifier}
                bucketItem={bucketItem}
                tagsConfiguration={tagsConfiguration}
                onSelect={onAddFilter}
                isLocationIconEnabled={locationIconEnabled}
                computedAttributesEnabled={computedAttributesEnabled}
            />
        );
    };

    const renderAttributeHeader = (filters: IDecoratedMetricFilters) => {
        if (filters.length === 0) {
            return null;
        }

        return (
            <h2>
                <FormattedMessage id="filters" />
            </h2>
        );
    };

    const dateFilterDateDatasetIdentifier = (dateFilter: IDecoratedDateFilter): string | undefined =>
        dateFilter.dateDataset?.identifier ?? dateFilter.original?.dimension;

    const renderDateFilter = (
        dateFilter: IDecoratedDateFilter | undefined,
        additionalDateFilters: IBucketItemMetricFilter[],
        { key, isPrimary, isAdding = false }: { key: string; isPrimary: boolean; isAdding?: boolean },
    ) => (
        <MeasureDateFilter
            key={key}
            filter={dateFilter}
            autoOpen={isAdding}
            onDropdownClosed={isAdding ? onAddingDateFilterPickerClosed : undefined}
            bucketLocalIdentifier={bucketLocalIdentifier}
            bucketItem={bucketItem}
            onAdd={onAddFilter}
            onUpdate={onUpdateFilter}
            onRemove={onRemoveFilter}
            additionalDateFilters={additionalDateFilters}
            onApply={onApplyDateFilter}
            isPrimaryDateFilter={isPrimary}
            ownDateDatasetIdentifier={
                // the legacy (flag off) primary chip keeps reading the measure-level selection
                !dateFilter || (isPrimary && !improvedMetricDateFilterEnabled)
                    ? undefined
                    : dateFilterDateDatasetIdentifier(dateFilter)
            }
        />
    );

    const renderDateFilters = (
        dateFilters: IDecoratedDateFilter[],
        additionalDateFilters: IBucketItemMetricFilter[],
    ) => {
        // Chips are keyed by position, always inside one array: the chip that creates a filter
        // must stay the same instance as the chip then showing it, or its open picker would close
        // on the add.
        if (!improvedMetricDateFilterEnabled) {
            // the legacy chip reads "Filter by date" until the metric has a date filter
            if (dateFilters.length === 0) {
                return [
                    renderDateFilter(undefined, additionalDateFilters, {
                        key: "date-filter-0",
                        isPrimary: true,
                    }),
                ];
            }
            return dateFilters.map((dateFilter, index) =>
                renderDateFilter(dateFilter, index === 0 ? additionalDateFilters : [], {
                    key: `date-filter-${index}`,
                    isPrimary: index === 0,
                }),
            );
        }
        const chips = dateFilters.map((dateFilter, index) =>
            renderDateFilter(dateFilter, index === 0 ? additionalDateFilters : [], {
                key: `date-filter-${index}`,
                isPrimary: index === 0,
            }),
        );
        // the date filter the "Add filter" menu is adding, on the metric's default date dataset
        // like the filter bar's — several date filters may share a dataset there too
        if (addingDateFilterIndex === dateFilters.length) {
            const isPrimary = dateFilters.length === 0;
            chips.push(
                renderDateFilter(undefined, isPrimary ? additionalDateFilters : [], {
                    key: `date-filter-${dateFilters.length}`,
                    isPrimary,
                    isAdding: true,
                }),
            );
        }
        return chips;
    };

    const filters = bucketItem.filters || [];
    const allDateFilters = filters.filter(isDecoratedDateFilter);
    // With the flag on every stored date filter shows (only ADDING a further one is gated by the
    // capability); with it off the open-report operation keeps the first one only, so this is just
    // the legacy UI's own rule restated.
    const dateFilters = improvedMetricDateFilterEnabled ? allDateFilters : allDateFilters.slice(0, 1);
    // The picker always gets them so its Apply preserves them; they leave the regular list only when
    // the picker can show and edit them (a backend without date attribute elements hides that section).
    const additionalDateFilters = filters.filter(isAdditionalDateFilter).map((filter) => filter.original);
    const listedFilters = filters.filter(
        (filter) => !additionalDateFiltersEditable || !isAdditionalDateFilter(filter),
    );

    // the date filter landed at the adding chip's position: the chip now shows it
    useEffect(() => {
        setAddingDateFilterIndex(null);
    }, [dateFilters.length]);

    const onAddDateFilter = useCallback(() => {
        setAddingDateFilterIndex(dateFilters.length);
    }, [dateFilters.length]);

    const isDateFilterAvailable =
        !hasDerivedMeasure && (multipleDateFiltersEnabled || allDateFilters.length === 0);
    const dateFilterDisabledTooltip = hasDerivedMeasure
        ? intl.formatMessage({ id: "filter.date.disabled_compare" })
        : isDateFilterAvailable
          ? undefined
          : intl.formatMessage({ id: "dashboard.bucket.add_filter.date_limit" });
    const isAttributeFilterAvailable = nonDateFiltersCount < MAX_ATTRIBUTE_FILTERS_COUNT;
    const attributeFilterDisabledTooltip = isAttributeFilterAvailable
        ? undefined
        : intl.formatMessage(
              { id: "dashboard.bucket.add_filter.attribute_limit" },
              { max: MAX_ATTRIBUTE_FILTERS_COUNT },
          );

    return (
        <section className="attribute-filters-wrapper">
            {renderAttributeHeader(filters)}
            {renderDateFilters(dateFilters, additionalDateFilters)}
            {renderAttributeFilters(listedFilters)}
            {improvedMetricDateFilterEnabled ? (
                <MeasureAddFilterDropdown
                    bucketLocalIdentifier={bucketLocalIdentifier}
                    bucketItem={bucketItem}
                    projectId={projectId}
                    tagsConfiguration={tagsConfiguration}
                    isLocationIconEnabled={locationIconEnabled}
                    computedAttributesEnabled={computedAttributesEnabled}
                    isDateFilterAvailable={isDateFilterAvailable}
                    dateFilterDisabledTooltip={dateFilterDisabledTooltip}
                    isAttributeFilterAvailable={isAttributeFilterAvailable}
                    attributeFilterDisabledTooltip={attributeFilterDisabledTooltip}
                    onAddDateFilter={onAddDateFilter}
                    onAddAttributeFilters={onAddAttributeFilters}
                />
            ) : (
                renderAttributePicker()
            )}
        </section>
    );
});
