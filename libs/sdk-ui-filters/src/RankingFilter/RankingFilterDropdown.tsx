// (C) 2020-2025 GoodData Corporation
import React, { useState } from "react";
import { IRankingFilter, ObjRefInScope } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { RankingFilterDropdownBody } from "./RankingFilterDropdownBody.js";
import { IMeasureDropdownItem, IAttributeDropdownItem, ICustomGranularitySelection } from "./types.js";
import noop from "lodash/noop.js";

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];
const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));

export const prepareRankingFilterState = (filter: IRankingFilter): IRankingFilter => {
    const { measure, attributes, operator, value } = filter.rankingFilter;
    const firstAttribute = attributes?.[0];
    const attributesProp = firstAttribute ? { attributes: [firstAttribute] } : {};

    return {
        rankingFilter: {
            operator,
            value,
            measure,
            ...attributesProp,
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
    enableRenamingMeasureToMetric?: boolean;
}

function RankingFilterDropdownComponent({
    measureItems,
    attributeItems,
    filter,
    onApply,
    onCancel = noop,
    anchorEl,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    enableRenamingMeasureToMetric,
}: IRankingFilterDropdownProps) {
    const [rankingFilter, setRankingFilter] = useState(prepareRankingFilterState(filter));

    const handleApply = (rankingFilter: IRankingFilter) => {
        setRankingFilter(rankingFilter);
        onApply(rankingFilter);
    };

    return (
        <Overlay
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
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
                enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
            />
        </Overlay>
    );
}

/**
 * @beta
 */
export const RankingFilterDropdown: React.FC<IRankingFilterDropdownProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <RankingFilterDropdownComponent {...props} />
    </IntlWrapper>
);
