// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import { type IRankingFilter, type ObjRefInScope } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { type IDimensionalityItem } from "../MeasureValueFilter/typings.js";

import { RankingFilterDropdownBody } from "./RankingFilterDropdownBody.js";
import {
    type IAttributeDropdownItem,
    type ICustomGranularitySelection,
    type IMeasureDropdownItem,
    type RenderMeasureDropdownBody,
} from "./types.js";

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];
const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));

export const prepareRankingFilterState = (
    filter: IRankingFilter,
    keepAllAttributes = false,
): IRankingFilter => {
    const { measure, attributes, operator, value, applyOnResult, strictLimitOfRows } = filter.rankingFilter;
    // The legacy single-attribute UI keeps only the first attribute; the multi-attribute mode keeps them all.
    const keptAttributes = keepAllAttributes ? attributes : attributes?.slice(0, 1);
    const attributesProp = keptAttributes?.length ? { attributes: keptAttributes } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };

    return {
        rankingFilter: {
            operator,
            value,
            measure,
            ...attributesProp,
            ...applyOnResultProp,
            ...strictLimitOfRowsProp,
        },
    };
};

/**
 * @beta
 */
export interface IRankingFilterDropdownProps {
    measureItems: IMeasureDropdownItem[];
    attributeItems: IAttributeDropdownItem[];
    filter: IRankingFilter;
    onApply: (filter: IRankingFilter) => void;
    onCancel?: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    anchorEl?: HTMLElement | string;
    customGranularitySelection?: ICustomGranularitySelection;
    locale?: string;
    enableRankingWithMvf?: boolean;
    enableRankingStrictLimit?: boolean;
    /**
     * Optional custom renderer for the measure dropdown body, replacing the built-in flat measure list
     * with a custom body (e.g. a grouped, searchable catalog picker).
     */
    renderMeasureDropdownBody?: RenderMeasureDropdownBody;
    // Multi-attribute "out of" section, mirroring the measure value filter dimensionality props (apart
    // from naming). When isAttributesSectionEnabled is true, the section replaces the legacy single-attribute
    // dropdown and the ranking filter supports multiple, catalog-backed "out of" attributes.
    isAttributesSectionEnabled?: boolean;
    /** Current "out of" attributes (titled), seeded by the host (filter's own, or insight defaults). */
    attributes?: IDimensionalityItem[];
    /** Insight default "out of" attributes (for the reset action). */
    insightAttributes?: IDimensionalityItem[];
    /** Catalog "out of" attributes (used when not lazily loaded via loadCatalogAttributes). */
    catalogAttributes?: IDimensionalityItem[];
    /** Lazily loads catalog "out of" attributes valid for the current selection (on picker open). */
    loadCatalogAttributes?: (attributes: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
}

function RankingFilterDropdownComponent({
    measureItems,
    attributeItems,
    filter,
    onApply,
    onCancel = () => {},
    anchorEl,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    enableRankingWithMvf,
    enableRankingStrictLimit,
    renderMeasureDropdownBody,
    isAttributesSectionEnabled,
    attributes,
    insightAttributes,
    catalogAttributes,
    loadCatalogAttributes,
}: IRankingFilterDropdownProps) {
    const [rankingFilter, setRankingFilter] = useState(
        prepareRankingFilterState(filter, !!isAttributesSectionEnabled),
    );

    const handleApply = (rankingFilter: IRankingFilter) => {
        setRankingFilter(rankingFilter);
        onApply(rankingFilter);
    };

    return (
        <Overlay
            closeOnOutsideClick
            closeOnParentScroll
            closeOnMouseDrag
            alignTo={anchorEl}
            alignPoints={DROPDOWN_ALIGNMENTS}
            onClose={onCancel}
            ignoreClicksOnByClass={[".gd-rf-inner-overlay-dropdown"]}
        >
            <RankingFilterDropdownBody
                measureItems={measureItems}
                attributeItems={attributeItems}
                filter={rankingFilter}
                onApply={handleApply}
                onCancel={onCancel}
                onDropDownItemMouseOver={onDropDownItemMouseOver}
                onDropDownItemMouseOut={onDropDownItemMouseOut}
                customGranularitySelection={customGranularitySelection}
                enableRankingWithMvf={enableRankingWithMvf}
                enableRankingStrictLimit={enableRankingStrictLimit}
                renderMeasureDropdownBody={renderMeasureDropdownBody}
                isAttributesSectionEnabled={isAttributesSectionEnabled}
                attributes={attributes}
                insightAttributes={insightAttributes}
                catalogAttributes={catalogAttributes}
                loadCatalogAttributes={loadCatalogAttributes}
            />
        </Overlay>
    );
}

/**
 * @beta
 */
export function RankingFilterDropdown(props: IRankingFilterDropdownProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <RankingFilterDropdownComponent {...props} />
        </IntlWrapper>
    );
}
