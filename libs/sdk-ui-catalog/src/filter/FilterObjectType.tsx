// (C) 2025 GoodData Corporation

import { memo } from "react";

import { FormattedMessage } from "react-intl";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";
import { ObjectTypeSelectMemo, useObjectTypeState } from "../objectType/index.js";

export function FilterObjectType() {
    const { counter } = useObjectTypeState();
    const { types } = useFilterState();
    const { setTypes } = useFilterActions();

    return (
        <FilterGroupLayout
            className="gd-analytics-catalog__object-type"
            title={<FormattedMessage id="analyticsCatalog.objectType.title" />}
        >
            <ObjectTypeSelectMemo counter={counter} selectedTypes={types} onSelect={setTypes} />
        </FilterGroupLayout>
    );
}

export const FilterObjectTypeMemo = memo(FilterObjectType);
