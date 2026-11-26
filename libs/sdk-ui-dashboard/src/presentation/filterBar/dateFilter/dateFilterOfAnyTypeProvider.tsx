// (C) 2026 GoodData Corporation

import {
    isDashboardAbsoluteGranularityDateFilter,
    isDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import {
    type OptionalDateFilterComponentProvider,
    type OptionalDateFilterOfAnyTypeComponentProvider,
} from "../../dashboardContexts/types.js";

import {
    type CustomDashboardDateFilterComponent,
    type CustomDashboardDateFilterOfAnyTypeComponent,
    type IDashboardDateFilterOfAnyTypeProps,
} from "./types.js";

// A new adapter per resolution would remount the component and close its open dropdown.
const adapters = new WeakMap<
    CustomDashboardDateFilterComponent,
    CustomDashboardDateFilterOfAnyTypeComponent
>();

function createAdapter(Component: CustomDashboardDateFilterComponent) {
    function DateFilterOfAnyTypeAdapter({
        filter,
        workingFilter,
        onFilterChanged,
        isAbsoluteDateFilterGranularityEnabled: _isAbsoluteDateFilterGranularityEnabled,
        ...rest
    }: IDashboardDateFilterOfAnyTypeProps) {
        if (isDashboardAbsoluteGranularityDateFilter(filter) || isDashboardParameterizedDateFilter(filter)) {
            return null;
        }

        return (
            <Component
                {...rest}
                filter={filter}
                workingFilter={
                    isDashboardAbsoluteGranularityDateFilter(workingFilter) ||
                    isDashboardParameterizedDateFilter(workingFilter)
                        ? undefined
                        : workingFilter
                }
                onFilterChanged={onFilterChanged}
            />
        );
    }
    DateFilterOfAnyTypeAdapter.displayName = `DateFilterOfAnyTypeAdapter(${
        Component.displayName ?? Component.name
    })`;

    return DateFilterOfAnyTypeAdapter;
}

/**
 * Converts a provider of components that render the old type only to a provider of any type. The converted
 * provider returns undefined for the other date filter types.
 */
export function toDateFilterOfAnyTypeProvider(
    provider: OptionalDateFilterComponentProvider,
): OptionalDateFilterOfAnyTypeComponentProvider {
    return (filter) => {
        // no filter, the common date filter set to All time, stays with the old type
        if (isDashboardAbsoluteGranularityDateFilter(filter) || isDashboardParameterizedDateFilter(filter)) {
            return undefined;
        }

        const Component = provider(filter);
        if (!Component) {
            return undefined;
        }

        let Adapter = adapters.get(Component);
        if (!Adapter) {
            Adapter = createAdapter(Component);
            adapters.set(Component, Adapter);
        }
        return Adapter;
    };
}
