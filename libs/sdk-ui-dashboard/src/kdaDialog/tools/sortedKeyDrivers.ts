// (C) 2025-2026 GoodData Corporation

import { type IKdaItemGroup } from "../internalTypes.js";

export function getSortedSignificantDriver(item: IKdaItemGroup) {
    return item.significantDrivers.slice().sort((a, b) => {
        const aValue = Math.abs(a.to.value - a.from.value);
        const bValue = Math.abs(b.to.value - b.from.value);
        return bValue - aValue;
    });
}
