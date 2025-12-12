// (C) 2025 GoodData Corporation

import { type KdaItemGroup } from "../internalTypes.js";

export function getSortedSignificantDriver(item: KdaItemGroup) {
    return item.significantDrivers.slice().sort((a, b) => {
        const aValue = Math.abs(a.to.value - a.from.value);
        const bValue = Math.abs(b.to.value - b.from.value);
        return bValue - aValue;
    });
}
