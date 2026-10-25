// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { ItemsWrapper, Separator, SubMenu } from "@gooddata/sdk-ui-kit";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

import { DateGranularitySubMenuItems } from "./DateGranularitySubMenuItems.js";
import { MoreOptionsItem } from "./MoreOptionsItem.js";

interface IAdditionalDateGranularitySubMenuProps {
    granularities: IGranularityOption[];
    onGranularityChange: (granularity: Granularity) => void;
    selectedGranularity: Granularity;
}

export function DateGranularitySubMenu({
    granularities,
    selectedGranularity,
    onGranularityChange,
}: IAdditionalDateGranularitySubMenuProps) {
    const additionalGranularities = useMemo(
        () => granularities.filter((granularity) => !!granularity.chronologicalGranularity),
        [granularities],
    );

    const moreOptionsItem = (
        <MoreOptionsItem selectedGranularity={selectedGranularity} granularities={granularities} />
    );

    if (additionalGranularities.length === 0) {
        return null;
    }

    return (
        <>
            <Separator />
            <SubMenu toggler={moreOptionsItem} offset={-8}>
                <ItemsWrapper smallItemsSpacing>
                    <DateGranularitySubMenuItems
                        granularities={additionalGranularities}
                        selectedGranularity={selectedGranularity}
                        onGranularityChange={onGranularityChange}
                    />
                </ItemsWrapper>
            </SubMenu>
        </>
    );
}
