// (C) 2025-2026 GoodData Corporation

import { memo, useId } from "react";

import { FormattedMessage } from "react-intl";

import { useObjectTypeState } from "../objectType/ObjectTypeContext.js";
import { ObjectTypeSelectMemo } from "../objectType/ObjectTypeSelect.js";
import { useIsParametersEnabled } from "../parameter/gate.js";
import { useFilterActions, useFilterState } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";

export function FilterObjectType() {
    const { counter } = useObjectTypeState();
    const { types } = useFilterState();
    const { setTypes } = useFilterActions();
    const isParametersEnabled = useIsParametersEnabled();
    const id = useId();
    const titleId = `filter-object-type-title/${id}`;

    return (
        <FilterGroupLayout
            className="gd-analytics-catalog__filter__group__object-type"
            title={<FormattedMessage id="analyticsCatalog.objectType.title" />}
            titleId={titleId}
        >
            <ObjectTypeSelectMemo
                counter={counter}
                selectedTypes={types}
                onSelect={setTypes}
                showParameter={isParametersEnabled}
                ariaLabelledBy={titleId}
            />
        </FilterGroupLayout>
    );
}

export const FilterObjectTypeMemo = memo(FilterObjectType);
