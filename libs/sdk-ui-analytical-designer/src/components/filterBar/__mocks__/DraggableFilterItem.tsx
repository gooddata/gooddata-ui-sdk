// (C) 2019-2026 GoodData Corporation

import { type IDraggableFilterItemProps } from "../DraggableFilterItem.js";

export function DraggableFilterItem({ filterItem }: IDraggableFilterItemProps) {
    return <div>{filterItem.localIdentifier}</div>;
}
