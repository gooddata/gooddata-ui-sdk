// (C) 2025-2026 GoodData Corporation

import { memo, useId } from "react";

import { FormattedMessage } from "react-intl";

import { useCatalogFeedCounter } from "../catalogItem/CatalogFeedContext.js";
import { useEnabledObjectTypes } from "../catalogItem/useCatalogEndpoints.js";
import { ObjectTypeSelectMemo } from "../objectType/ObjectTypeSelect.js";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";

export function FilterObjectType() {
    const counter = useCatalogFeedCounter();
    const { types } = useFilterState();
    const { setTypes } = useFilterActions();
    const enabledObjectTypes = useEnabledObjectTypes();
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
                enabledObjectTypes={enabledObjectTypes}
                onSelect={setTypes}
                ariaLabelledBy={titleId}
            />
        </FilterGroupLayout>
    );
}

export const FilterObjectTypeMemo = memo(FilterObjectType);
