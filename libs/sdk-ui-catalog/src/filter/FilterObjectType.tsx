// (C) 2025 GoodData Corporation

import { memo } from "react";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { ObjectTypeSelectMemo, useObjectTypeState } from "../objectType/index.js";

export function FilterObjectType() {
    const { counter } = useObjectTypeState();
    const { types } = useFilterState();
    const { setTypes } = useFilterActions();

    return <ObjectTypeSelectMemo counter={counter} selectedTypes={types} onSelect={setTypes} />;
}

export const FilterObjectTypeMemo = memo(FilterObjectType);
