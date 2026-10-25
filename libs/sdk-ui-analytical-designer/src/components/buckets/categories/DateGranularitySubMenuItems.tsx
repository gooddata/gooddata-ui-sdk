// (C) 2021-2026 GoodData Corporation

import { Fragment } from "react";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

import { DateGranularityMenuItem } from "./DateGranularityMenuItem.js";
import { GranularityHeader } from "./GranularityHeaderItem.js";

interface IAdditionalGranularityItemsProps {
    granularities: IGranularityOption[];
    onGranularityChange: (granularity: Granularity) => void;
    selectedGranularity?: Granularity;
}

export function DateGranularitySubMenuItems({
    granularities,
    onGranularityChange,
    selectedGranularity,
}: IAdditionalGranularityItemsProps) {
    let previousChronologicalGranularity: Granularity = null;

    return (
        <>
            {granularities.map((granularity) => {
                const { dateType, chronologicalGranularity } = granularity;

                const renderHeader = previousChronologicalGranularity !== chronologicalGranularity;
                previousChronologicalGranularity = chronologicalGranularity;

                return (
                    <Fragment key={dateType}>
                        {renderHeader ? <GranularityHeader granularity={chronologicalGranularity} /> : null}
                        <DateGranularityMenuItem
                            item={granularity}
                            selectedGranularity={selectedGranularity}
                            onGranularityChange={onGranularityChange}
                        />
                    </Fragment>
                );
            })}
        </>
    );
}
