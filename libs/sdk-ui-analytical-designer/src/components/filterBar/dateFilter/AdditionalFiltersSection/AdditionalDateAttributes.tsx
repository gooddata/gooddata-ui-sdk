// (C) 2021-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import {
    GRANULARITY,
    type Granularity,
    type IGranularityOption,
    isGenericDateGranularity,
} from "../../../../models/granularity.js";
import { FilterBarService } from "../../../../store/filter_bar/filter_bar_service.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
    type IOnAttributeFilterApplyProps,
} from "../../../../store/filter_bar/filter_bar_types.js";
import {
    type IDateDatasetRefWithGranularities,
    type IGranularityOptionWithRefs,
} from "../../../../typings/datasets.js";

import { AdditionalDateAttribute } from "./AdditionalDateAttribute.js";
import { AdditionalDateAttributesDropdown } from "./AdditionalDateAttributesDropdown.js";
import { DisableableFilterWrapper } from "./DisableableFilterWrapper.js";
import { EmptyDateValuesFilter } from "./EmptyDateValuesFilter.js";

export interface IAdditionalDateAttributesProps {
    selectedDateDataset: IDecoratedDateDataset;
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[];
    additionalDateAttributeFilters: IAttributeFilter[];
    onSelect: (additionalDateAttribute: IAttributeFilter) => void;
    onApply: (props: IOnAttributeFilterApplyProps) => void;
    onRemove: (localIdentifier: string) => void;
    onClose: (localIdentifier: string) => void;
    migratedAdditionalFilters: string[];
    autoOpenedFilters: string[];
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
    onEmptyDateValuesFilterModeChange: (mode: EmptyDateValuesFilterMode) => void;
    onEmptyDateValuesFilterAdd: () => void;
    onEmptyDateValuesFilterRemove: () => void;
    isEmptyDateValuesFilterOpenOnInit?: boolean;
    isDisabled?: boolean;
    isAllTime?: boolean;
    showDateGranularities?: boolean;
    isEmptyDateValuesFilterAvailable?: boolean;
}

function AdditionalFilterResetWarning({
    migratedAdditionalFiltersCount,
}: {
    migratedAdditionalFiltersCount: number;
}) {
    if (migratedAdditionalFiltersCount === 0) {
        return null;
    }
    const messageIntlKey =
        migratedAdditionalFiltersCount === 1
            ? defineMessage({ id: "filter.singleAdditionalFilterResetWarning.panel" }).id
            : defineMessage({ id: "filter.multipleAdditionalFiltersResetWarning.panel" }).id;
    const panelClassNames = classNames("adi-additional-filter-reset-warning", {
        "s-additional-filter-reset-warning": migratedAdditionalFiltersCount === 1,
        "s-additional-filter-reset-warnings": migratedAdditionalFiltersCount > 1,
    });
    return (
        <div className={panelClassNames}>
            <FormattedMessage id={messageIntlKey} values={{ b: (chunks) => <b>{chunks}</b> }} />
        </div>
    );
}

interface IAdditionalDateAttributeItemProps {
    attributeFilter: IAttributeFilter;
    attributeGranularities: IGranularityOptionWithRefs[];
    onApply: (props: IOnAttributeFilterApplyProps) => void;
    onRemove: (localIdentifier: string) => void;
    onClose: (localIdentifier: string) => void;
    isAutoOpen: boolean;
    isDisabled?: boolean;
}

function AdditionalDateAttributeItem({
    attributeFilter,
    attributeGranularities,
    onApply,
    onRemove,
    onClose,
    isAutoOpen,
    isDisabled,
}: IAdditionalDateAttributeItemProps) {
    const { localIdentifier, cacheItemIdentifier } = attributeFilter;
    const label = attributeGranularities.find(
        ({ cacheIdentifier }) => cacheIdentifier === cacheItemIdentifier,
    )?.label;
    const onCloseHandler = () => onClose(localIdentifier);

    if (!label) {
        return (
            <div className="adi-additional-filter-reset-warning">
                <FormattedMessage id="filter.invalidFilterWarning" />
            </div>
        );
    }

    return (
        <DisableableFilterWrapper isDisabled={isDisabled}>
            <AdditionalDateAttribute
                label={label}
                attributeFilter={attributeFilter}
                onApply={onApply}
                onRemove={onRemove}
                onClose={onCloseHandler}
                isAutoOpen={isAutoOpen}
            />
        </DisableableFilterWrapper>
    );
}

export function AdditionalDateAttributes({
    selectedDateDataset,
    dateDatasetRefsWithGranularities,
    additionalDateAttributeFilters,
    onSelect,
    onApply,
    onClose,
    onRemove,
    migratedAdditionalFilters,
    autoOpenedFilters,
    emptyDateValuesFilterMode,
    onEmptyDateValuesFilterModeChange,
    onEmptyDateValuesFilterAdd,
    onEmptyDateValuesFilterRemove,
    isEmptyDateValuesFilterOpenOnInit,
    isDisabled,
    isAllTime,
    showDateGranularities = true,
    isEmptyDateValuesFilterAvailable = true,
}: IAdditionalDateAttributesProps) {
    const attributeGranularities =
        dateDatasetRefsWithGranularities.find(({ ref }) => areObjRefsEqual(ref, selectedDateDataset?.ref))
            ?.attributes || [];

    const granularities = showDateGranularities
        ? getAvailableGranularityOptions(additionalDateAttributeFilters, attributeGranularities)
        : [];
    const handleOnGranularityClick = (granularity: Granularity) => {
        const { cacheIdentifier, dfRef } = attributeGranularities.find(
            (attribute) => attribute.dateType === granularity,
        );
        const attributeFilter = FilterBarService.createAttributeFilter(cacheIdentifier, dfRef);
        onSelect(attributeFilter);
    };

    const isSingleEmptyValuesMode = !showDateGranularities;
    const isEmptyDateValuesFilterEnabled =
        isEmptyDateValuesFilterAvailable &&
        (emptyDateValuesFilterMode !== undefined || isSingleEmptyValuesMode);

    return (
        <div
            className={classNames("adi-additional-date-attributes", "s-adi-additional-date-attributes", {
                "is-disabled": isDisabled,
            })}
        >
            {additionalDateAttributeFilters.map((attributeFilter) => (
                <AdditionalDateAttributeItem
                    key={attributeFilter.localIdentifier}
                    attributeFilter={attributeFilter}
                    attributeGranularities={attributeGranularities}
                    onApply={onApply}
                    onRemove={onRemove}
                    onClose={onClose}
                    isAutoOpen={autoOpenedFilters.includes(attributeFilter.localIdentifier)}
                    isDisabled={isDisabled}
                />
            ))}
            {isEmptyDateValuesFilterEnabled ? (
                <EmptyDateValuesFilter
                    mode={emptyDateValuesFilterMode ?? "include"}
                    onModeChange={onEmptyDateValuesFilterModeChange}
                    onRemove={onEmptyDateValuesFilterRemove}
                    openOnInit={isEmptyDateValuesFilterOpenOnInit}
                    isAllTime={isAllTime}
                    canRemove={!isSingleEmptyValuesMode}
                />
            ) : null}
            <AdditionalFilterResetWarning migratedAdditionalFiltersCount={migratedAdditionalFilters.length} />
            <DisableableFilterWrapper isDisabled={isDisabled}>
                <AdditionalDateAttributesDropdown
                    granularities={granularities}
                    onGranularityChange={handleOnGranularityClick}
                    isEmptyDateValuesFilterEnabled={isEmptyDateValuesFilterEnabled}
                    onEmptyDateValuesFilterAdd={onEmptyDateValuesFilterAdd}
                    isDisabled={isDisabled}
                    isEmptyDateValuesFilterAvailable={isEmptyDateValuesFilterAvailable}
                />
            </DisableableFilterWrapper>
        </div>
    );
}

export const getAvailableGranularityOptions = (
    selectedAdditionalDateAttributes: IAttributeFilter[],
    attributeGranularities: IGranularityOptionWithRefs[],
): IGranularityOption[] =>
    attributeGranularities
        .filter(
            ({ dfRef }) =>
                !selectedAdditionalDateAttributes.some(({ displayFormRef }) =>
                    areObjRefsEqual(displayFormRef, dfRef),
                ),
        )
        .filter(isGenericDateGranularity)
        // TODO CQ-2773: second of day is temporarily not offered as it causes UI issues
        // in additional date filters; remove this filter once those are resolved.
        .filter(({ dateType }) => dateType !== GRANULARITY.SECOND_IN_DAY)
        .map(({ dateType, label, chronologicalGranularity, valuesPreview }) => ({
            dateType,
            label,
            chronologicalGranularity,
            valuesPreview,
        }));
