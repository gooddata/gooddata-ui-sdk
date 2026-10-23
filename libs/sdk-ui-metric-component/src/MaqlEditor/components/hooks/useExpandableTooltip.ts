// (C) 2021-2026 GoodData Corporation

import { useContext } from "react";

import { ExpandableTooltipContext, type IExpandableTooltipContext } from "../ExpandableTooltipContext.js";

export function useExpandableTooltip(): IExpandableTooltipContext {
    const expandableTooltip = useContext(ExpandableTooltipContext);
    if (!expandableTooltip) {
        throw new Error("useExpandableTooltip must be used inside ExpandableTooltipContextProvider");
    }

    return expandableTooltip;
}
