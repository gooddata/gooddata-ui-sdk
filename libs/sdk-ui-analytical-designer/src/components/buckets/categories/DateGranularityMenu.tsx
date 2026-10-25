// (C) 2021-2026 GoodData Corporation

import { ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

import { DateGranularityMenuItems } from "./DateGranularityMenuItems.js";
import { DateGranularitySubMenu } from "./DateGranularitySubMenu.js";

interface IDateGranularityListProps {
    granularities: IGranularityOption[];
    selectedGranularity: Granularity;
    onGranularityChange: (granularity: Granularity) => void;
}

export function DateGranularityMenu({
    granularities,
    selectedGranularity,
    onGranularityChange,
}: IDateGranularityListProps) {
    return (
        <ItemsWrapper className="adi-date-granularity-dropdown s-date-granularity-switch" smallItemsSpacing>
            <DateGranularityMenuItems
                granularities={granularities}
                selectedGranularity={selectedGranularity}
                onGranularityChange={onGranularityChange}
            />
            <DateGranularitySubMenu
                granularities={granularities}
                selectedGranularity={selectedGranularity}
                onGranularityChange={onGranularityChange}
            />
        </ItemsWrapper>
    );
}
