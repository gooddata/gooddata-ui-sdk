// (C) 2025-2026 GoodData Corporation

import { memo, useId } from "react";

import { FormattedMessage } from "react-intl";

import { type AsyncStatus } from "../async/types.js";
import { useCatalogFeedCounter, useCatalogFeedState } from "../catalogItem/CatalogFeedContext.js";
import { useEnabledObjectTypes } from "../catalogItem/useCatalogEndpoints.js";
import { ObjectTypeSelectMemo } from "../objectType/ObjectTypeSelect.js";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";

export function FilterObjectType() {
    const counter = useCatalogFeedCounter();
    const { status } = useCatalogFeedState();
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
                isCountUnavailable={!isCountKnown(status)}
            />
        </FilterGroupLayout>
    );
}

export const FilterObjectTypeMemo = memo(FilterObjectType);

/**
 * Counts are only known once the list has loaded. While it is (re)loading the counts are reset
 * to 0 and when it fails they are never filled, so labels must not claim there are 0 objects.
 */
export function isCountKnown(status: AsyncStatus): boolean {
    return status === "success" || status === "loadingMore";
}
