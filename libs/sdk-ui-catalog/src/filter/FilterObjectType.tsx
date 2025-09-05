// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { ObjectTypeSelectMemo } from "../objectType/ObjectTypeSelect.js";

export function FilterObjectType() {
    const { types } = useFilterState();
    const { setTypes } = useFilterActions();

    return <ObjectTypeSelectMemo selectedTypes={types} onSelect={setTypes} />;
}

export const FilterObjectTypeMemo = memo(FilterObjectType);
