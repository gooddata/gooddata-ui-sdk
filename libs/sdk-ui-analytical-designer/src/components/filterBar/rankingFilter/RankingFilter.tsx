// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import { type IntlShape } from "react-intl";

import { type IRankingFilter, type ObjRefInScope, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    type IAttributeDropdownItem,
    type ICustomGranularitySelection,
    type IDimensionalityItem,
    type IMeasureDropdownItem,
    RankingFilterDropdown,
    type RenderMeasureDropdownBody,
} from "@gooddata/sdk-ui-filters";

import { RankingFilterButton } from "./RankingFilterButton.js";

const findItemByRef = <T extends { ref: ObjRefInScope }>(
    items: ReadonlyArray<T>,
    targetRef: ObjRefInScope,
): T | undefined => items.find(({ ref }) => areObjRefsEqual(ref, targetRef));

export const getButtonModel = (
    filter: IRankingFilter,
    measureItems: IMeasureDropdownItem[],
    attributeItems: IAttributeDropdownItem[],
    attributeTitles?: string[],
) => {
    const {
        rankingFilter: { operator, value, measure, attributes },
    } = filter;

    const measureItem = findItemByRef(measureItems, measure);

    // Prefer catalog-aware titles resolved by the container (these cover catalog attributes referenced by
    // ObjRef, which are not present in the bucket attributeItems). Fall back to the bucket lookup of the
    // first attribute for the legacy single-attribute flow.
    const attributeTitle =
        attributeTitles && attributeTitles.length > 0
            ? attributeTitles.join(", ")
            : attributes?.length
              ? findItemByRef(attributeItems, attributes[0])?.title
              : undefined;

    // measureItem can be undefined for a catalog-backed ranking filter whose measure is not in
    // measureItems (e.g. enableImprovedRankingFilter off, or the catalog still loading); guard so the
    // filter pill renders instead of crashing the whole filter bar.
    return {
        operator,
        value,
        measureTitle: measureItem?.title ?? "",
        measureSequence: measureItem?.sequenceNumber,
        attributeTitle,
    };
};

export interface IRankingFilterProps {
    filter: IRankingFilter;
    measureItems: IMeasureDropdownItem[];
    attributeItems: IAttributeDropdownItem[];
    onApply: (rankingFilter: IRankingFilter) => void;
    onCancel: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    className?: string;
    mountOpened?: boolean;
    customGranularitySelection?: ICustomGranularitySelection;
    intl?: IntlShape;
    enableRankingWithMvf?: boolean;
    enableRankingStrictLimit?: boolean;
    renderMeasureDropdownBody?: RenderMeasureDropdownBody;
    isAttributesSectionEnabled?: boolean;
    /** Current "out of" attributes (titled), seeded by the container (filter's own, or insight defaults). */
    attributes?: IDimensionalityItem[];
    /** Insight default "out of" attributes, used for the reset action and the default "reuses insight" state. */
    insightAttributes?: IDimensionalityItem[];
    /** Lazily loads catalog "out of" attributes valid for the current selection (on picker open). */
    loadCatalogAttributes?: (attributes: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    /**
     * Catalog-aware resolved titles of the filter's current "out of" attributes, used for the pill label
     * (covers catalog attributes not present in the bucket attributeItems).
     */
    attributeTitles?: string[];
}

export function RankingFilter({
    filter,
    measureItems,
    attributeItems,
    onApply,
    onCancel,
    className,
    mountOpened,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    intl,
    enableRankingWithMvf,
    enableRankingStrictLimit,
    renderMeasureDropdownBody,
    isAttributesSectionEnabled,
    attributes,
    insightAttributes,
    loadCatalogAttributes,
    attributeTitles,
}: IRankingFilterProps) {
    const [isOpen, setIsOpen] = useState(mountOpened);

    const onButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const handleApply = (rankingFilter: IRankingFilter) => {
        onApply(rankingFilter);
        setIsOpen(false);
        onCancel();
    };

    const handleCancel = () => {
        setIsOpen(false);
        onCancel();
    };

    return (
        <>
            <RankingFilterButton
                model={getButtonModel(filter, measureItems, attributeItems, attributeTitles)}
                onClick={onButtonClick}
                isActive={isOpen}
                className={`gd-rf-dropdown-toggle-button s-rf-dropdown-toggle-button ${className}`}
            />
            {isOpen ? (
                <RankingFilterDropdown
                    filter={filter}
                    measureItems={measureItems}
                    attributeItems={attributeItems}
                    onApply={handleApply}
                    onCancel={handleCancel}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
                    anchorEl=".gd-rf-dropdown-toggle-button"
                    customGranularitySelection={customGranularitySelection}
                    locale={intl?.locale}
                    enableRankingWithMvf={enableRankingWithMvf}
                    enableRankingStrictLimit={enableRankingStrictLimit}
                    renderMeasureDropdownBody={renderMeasureDropdownBody}
                    isAttributesSectionEnabled={isAttributesSectionEnabled}
                    attributes={attributes}
                    insightAttributes={insightAttributes}
                    loadCatalogAttributes={loadCatalogAttributes}
                />
            ) : null}
        </>
    );
}
