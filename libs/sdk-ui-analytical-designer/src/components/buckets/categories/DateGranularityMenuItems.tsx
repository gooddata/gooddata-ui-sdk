// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

import { DateGranularityMenuItem } from "./DateGranularityMenuItem.js";

interface IDateGranularityListItemsProps {
    granularities: IGranularityOption[];
    selectedGranularity: Granularity;
    onGranularityChange: (granularity: Granularity) => void;
}

export function DateGranularityMenuItems({
    granularities,
    onGranularityChange,
    selectedGranularity,
}: IDateGranularityListItemsProps) {
    const chronologicalGranularities = useMemo(
        () => granularities.filter((granularity) => !granularity.chronologicalGranularity),
        [granularities],
    );
    return (
        <>
            {chronologicalGranularities.map((granularity) => (
                <DateGranularityMenuItem
                    key={granularity.dateType}
                    item={granularity}
                    selectedGranularity={selectedGranularity}
                    onGranularityChange={onGranularityChange}
                />
            ))}
        </>
    );
}
