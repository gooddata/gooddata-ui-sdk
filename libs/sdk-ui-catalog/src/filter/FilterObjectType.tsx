// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { useObjectTypeActions, useObjectTypeState } from "../objectType/ObjectTypeContext.js";
import { ObjectTypeSelectMemo } from "../objectType/ObjectTypeSelect.js";

export function FilterObjectType() {
    const { types } = useObjectTypeState();
    const { setTypes } = useObjectTypeActions();

    return <ObjectTypeSelectMemo selectedTypes={types} onSelect={setTypes} />;
}

export const FilterObjectTypeMemo = memo(FilterObjectType);
