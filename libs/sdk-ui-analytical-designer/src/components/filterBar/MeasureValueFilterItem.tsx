// (C) 2007-2026 GoodData Corporation

import { type SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import {
    type IFilter,
    type IMeasureValueFilter as IMeasureValueFilterModel,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    isMeasureValueFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { type IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";

import { type IMeasuresDescriptions } from "../../models/decorated_bucket_item.js";
import { getProjectId, getSeparators } from "../../selectors/bootstrap_selector.js";
import { getMeasureDescriptions } from "../../selectors/buckets_selector.js";
import { enableComputedAttributes, enableRankingWithMvf } from "../../selectors/feature_flag_selector.js";
import { getInsightWithBucketsViaMd } from "../../selectors/insight_selectors.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import {
    type IBucketSequenceNumbers,
    getMeasureSequenceNumbers,
} from "../../selectors/measure_sequence_numbers_selector.js";
import {
    isExtendedReferencePointStackingToPercent,
    isOptionalStackingDisabled,
} from "../../selectors/optional_stacking_selector.js";
import { getTagsConfiguration } from "../../selectors/route_selector.js";
import {
    measureValueFilterConfigurationOpened,
    updateMeasureValueFilter,
} from "../../store/bucket_filters/bucket_filters_actions.js";
import { hasRankingFilter } from "../../store/filter_bar/filter_bar_selector.js";
import { FilterBar, type IMeasureValueFilter } from "../../store/filter_bar/filter_bar_types.js";
import { getAboutToBeRemovedBucketAndFilterItems } from "../../store/highlighting/highlighting_selector.js";
import { type IAppState } from "../../store/types.js";
import type { ICatalogEntries } from "../../typings/state_objects.js";
import { getRouteParams } from "../../utils/location.js";
import { isPercentageFormat } from "../../utils/measure_descriptions.js";
import { getAttributeItems, getBucketItemNames } from "../sort/chart_sort_bucket_items.js";

import { FilterItem } from "./FilterItem.js";
import {
    buildMvfAvailabilityItems,
    buildVisualizationFilter,
    getMeasureIdentifier,
    getSecondaryAxisMeasures,
    getWarningMessage,
    updateFilterCondition,
} from "./measure_value_filter_item_utils.js";
import { MeasureValueFilterDropdownButton } from "./MeasureValueFilterItemDropdownButton.js";
import { useFilterDimensionality } from "./useFilterDimensionality.js";

export interface IMeasureValueFilterItemOwnProps {
    filter: IMeasureValueFilter;
    className?: string;
    isHighlighted?: boolean;
    isDraggedItem?: boolean;
    /** the user just added this filter, so its dropdown opens right away */
    isAutoOpen?: boolean;
    onClose?: () => void;
}

interface IMeasureValueFilterItemLabelStateProps {
    measureDescriptions: IMeasuresDescriptions;
    measureSequenceNumbers: IBucketSequenceNumbers;
    itemCache: ICatalogEntries;
    separators: ISeparators;
    isVisualizationStackingToPercent: boolean;
    isOptionalStackingDisabled: boolean;
    secondaryAxisMeasures: string[];
    aboutToBeRemovedBucketAndFilterItems: string[] | undefined;
    enableOperatorSelection: boolean;
    enableRankingWithMvf: boolean;
    computedAttributesEnabled: boolean;
    bucketItemNames: IBucketItemDescriptors;
    insightDimensionalityItems: IBucketItemDescriptors;
    projectId: string;
    insight: ReturnType<typeof getInsightWithBucketsViaMd>;
    datasetId: string | undefined;
    includeObjectsWithTags: ObjRef[] | undefined;
    excludeObjectsWithTags: ObjRef[] | undefined;
}

interface IMeasureValueFilterItemDispatchProps {
    updateMeasureValueFilter: (filter: IMeasureValueFilter) => void;
    onDropdownOpened: (filter: IMeasureValueFilter) => void;
}

export type IMeasureValueFilterItemProps = IMeasureValueFilterItemOwnProps &
    IMeasureValueFilterItemDispatchProps &
    IMeasureValueFilterItemLabelStateProps;

const mapStateToProps = () => {
    return createStructuredSelector({
        measureDescriptions: getMeasureDescriptions,
        measureSequenceNumbers: getMeasureSequenceNumbers,
        separators: getSeparators,
        isVisualizationStackingToPercent: isExtendedReferencePointStackingToPercent,
        isOptionalStackingDisabled: isOptionalStackingDisabled,
        secondaryAxisMeasures: getSecondaryAxisMeasures,
        aboutToBeRemovedBucketAndFilterItems: getAboutToBeRemovedBucketAndFilterItems,
        enableOperatorSelection: (state: IAppState) =>
            enableRankingWithMvf(state) || !hasRankingFilter(state),
        enableRankingWithMvf,
        computedAttributesEnabled: enableComputedAttributes,
        itemCache: getItemCache,
        bucketItemNames: getBucketItemNames,
        insightDimensionalityItems: getAttributeItems,
        projectId: getProjectId,
        insight: getInsightWithBucketsViaMd,
        datasetId: (state: IAppState) => getRouteParams(state).dataset,
        includeObjectsWithTags: (state: IAppState) => getTagsConfiguration(state).includeObjectsWithTags,
        excludeObjectsWithTags: (state: IAppState) => getTagsConfiguration(state).excludeObjectsWithTags,
    });
};

const mapDispatchToProps: IMeasureValueFilterItemDispatchProps = {
    updateMeasureValueFilter,
    onDropdownOpened: measureValueFilterConfigurationOpened,
};

const getCatalogMetricTitle = (itemCache: ICatalogEntries, metricIdentifier: ObjRef) =>
    metricIdentifier ? itemCache?.[`metric.${objRefToString(metricIdentifier)}`]?.title : undefined;

const getCatalogMetricFormat = (itemCache: ICatalogEntries, metricIdentifier: ObjRef) =>
    metricIdentifier ? itemCache?.[`metric.${objRefToString(metricIdentifier)}`]?.format : undefined;

// Rewrites this MVF on the insight passed to date-dataset loading so it carries the in-progress
// dimensionality; other insight filters pass through unchanged.
const applyDimensionalityToMvf = (
    insightFilter: IFilter,
    filter: IMeasureValueFilter,
    override: ObjRefInScope[],
): IFilter => {
    const currentFilter = buildVisualizationFilter(filter);
    return isMeasureValueFilter(insightFilter) &&
        areObjRefsEqual(insightFilter.measureValueFilter.measure, currentFilter.measureValueFilter.measure)
        ? { measureValueFilter: { ...currentFilter.measureValueFilter, dimensionality: override } }
        : insightFilter;
};

export function MeasureValueFilterItemBase({
    filter,
    className,
    updateMeasureValueFilter,
    measureDescriptions,
    isHighlighted,
    measureSequenceNumbers,
    onDropdownOpened,
    separators,
    isVisualizationStackingToPercent,
    isOptionalStackingDisabled,
    secondaryAxisMeasures,
    aboutToBeRemovedBucketAndFilterItems,
    isDraggedItem,
    isAutoOpen = false,
    onClose,
    enableOperatorSelection,
    enableRankingWithMvf,
    computedAttributesEnabled,
    itemCache,
    bucketItemNames,
    insightDimensionalityItems,
    projectId,
    insight,
    datasetId,
    includeObjectsWithTags,
    excludeObjectsWithTags,
}: IMeasureValueFilterItemProps) {
    const intl = useIntl();

    const [displayDropdown, setDisplayDropdown] = useState(false);
    const filterButtonElement = useRef(null);
    const buttonElement = useRef<HTMLDivElement>(null);

    const closeDropdown = useCallback(() => {
        filterButtonElement.current = null;
        setDisplayDropdown(false);
        onClose?.();
    }, [onClose]);

    const onClick = useCallback(
        (e: SyntheticEvent) => {
            if (displayDropdown) {
                closeDropdown();
                return;
            }

            filterButtonElement.current = e.currentTarget;
            setDisplayDropdown(true);
            onDropdownOpened(filter);
        },
        [displayDropdown, filter, onDropdownOpened, closeDropdown],
    );

    // A filter the user just added opens its dropdown right away. An effect rather than initial state,
    // because the dropdown is anchored to the button element, which exists only after mount. Only the
    // rising edge of isAutoOpen opens it: the filter (and so the opened callback) changes on apply.
    useEffect(() => {
        if (isAutoOpen && buttonElement.current) {
            filterButtonElement.current = buttonElement.current;
            setDisplayDropdown(true);
            onDropdownOpened(filter);
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoOpen]);

    const onApply = useCallback(
        (updatedAfmFilter: IMeasureValueFilterModel) => {
            updateMeasureValueFilter(updateFilterCondition(filter, updatedAfmFilter));
            closeDropdown();
        },
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [filter],
    );

    const visualizationFilter = useMemo(() => buildVisualizationFilter(filter), [filter]);

    // Shared catalog-dimensionality wiring (also used by the ranking filter). The availability builder and
    // the in-progress-insight rewrite (applyDimensionalityToMvf) are the only per-filter pieces.
    const { insightDimensionality, toTitledItems, loadCatalogDimensionality } =
        useFilterDimensionality<IMeasureValueFilter>({
            insight,
            insightDimensionalityItems,
            itemCache,
            bucketItemNames,
            projectId,
            datasetId,
            includeObjectsWithTags,
            excludeObjectsWithTags,
            filter,
            buildAvailabilityItems: buildMvfAvailabilityItems,
            applyOverrideToInsightFilter: applyDimensionalityToMvf,
            computedAttributesEnabled,
        });

    // Build dimensionality items with resolved titles and types for the dropdown
    const dimensionalityWithTitles = useMemo(
        () => toTitledItems(visualizationFilter.measureValueFilter.dimensionality),
        [toTitledItems, visualizationFilter.measureValueFilter.dimensionality],
    );

    const measureIdentifier = getMeasureIdentifier(filter);
    const measureDesc = measureDescriptions[measureIdentifier];
    const { title, alias, showInPercent } = measureDesc ?? {};

    const catalogMetricName = getCatalogMetricTitle(itemCache, filter.measureRef);
    const catalogMetricFormat = measureDesc
        ? undefined
        : getCatalogMetricFormat(itemCache, filter.measureRef);
    const isFormattedAsPercentage =
        measureDesc?.isFormattedAsPercentage ??
        (catalogMetricFormat ? isPercentageFormat(catalogMetricFormat) : false);
    const format = measureDesc?.format ?? catalogMetricFormat;

    const measureTitle = alias || title || catalogMetricName || filter.measureLocalIdentifier;

    // Catalog measures (not in buckets) cannot be stacked to percent since they're not part of the visualization.
    // For bucket measures, check if stacking is enabled and the measure is NOT on the secondary axis.
    // Note: secondaryAxisMeasures contains local identifiers, which only match bucket measures.
    const isMeasureStackedToPercent =
        !FilterBar.isCatalogMeasureValueFilter(filter) &&
        isVisualizationStackingToPercent &&
        !isOptionalStackingDisabled &&
        !secondaryAxisMeasures.some((secondaryAxisMeasure) => secondaryAxisMeasure === measureIdentifier);

    const displayPercentWarningMessage = showInPercent || isMeasureStackedToPercent;
    const warningMessage = getWarningMessage(intl, !enableOperatorSelection, displayPercentWarningMessage);
    const usePercentage = isFormattedAsPercentage && !showInPercent && !isMeasureStackedToPercent;

    const filterItemClassNames = useMemo(() => {
        const isAboutToBeRemoved = aboutToBeRemovedBucketAndFilterItems?.includes(filter.localIdentifier);

        return classNames("adi-metric-value-filter s-metric-value-filter-item", {
            highlight: isHighlighted,
            "about-to-be-removed": isAboutToBeRemoved,
        });
    }, [isHighlighted, aboutToBeRemovedBucketAndFilterItems, filter]);

    return (
        <FilterItem identifier={measureIdentifier} className={filterItemClassNames}>
            <MeasureValueFilterDropdownButton
                measureTitle={measureTitle}
                sequenceNumber={measureSequenceNumbers[measureIdentifier]}
                filter={filter}
                usePercentage={usePercentage}
                warningMessage={warningMessage}
                isActive={displayDropdown}
                onClick={onClick}
                buttonRef={buttonElement}
                separators={separators}
                className={className}
                isDraggedItem={isDraggedItem}
                dimensionality={dimensionalityWithTitles}
            />
            {displayDropdown ? (
                <MeasureValueFilterDropdown
                    onApply={onApply}
                    onCancel={closeDropdown}
                    usePercentage={usePercentage}
                    warningMessage={warningMessage}
                    filter={visualizationFilter}
                    anchorEl={filterButtonElement.current}
                    separators={separators}
                    format={format}
                    useShortFormat
                    locale={intl.locale}
                    displayTreatNullAsZeroOption
                    treatNullAsZeroDefaultValue={false}
                    measureIdentifier={measureIdentifier}
                    measureTitle={measureTitle}
                    enableOperatorSelection={enableOperatorSelection}
                    dimensionality={dimensionalityWithTitles}
                    insightDimensionality={insightDimensionality}
                    isDimensionalityEnabled
                    loadCatalogDimensionality={loadCatalogDimensionality}
                    enableMultipleConditions
                    enableRankingWithMvf={enableRankingWithMvf}
                />
            ) : null}
        </FilterItem>
    );
}

export const MeasureValueFilterItem = connect<
    IMeasureValueFilterItemLabelStateProps,
    IMeasureValueFilterItemDispatchProps,
    IMeasureValueFilterItemOwnProps,
    IAppState
>(
    mapStateToProps,
    mapDispatchToProps,
)(MeasureValueFilterItemBase);
