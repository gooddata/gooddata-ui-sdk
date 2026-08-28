// (C) 2026 GoodData Corporation

import { DefaultScheduledEmailDialogFilters } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogFilters.js";
import { useScheduledEmailDialogFiltersProps } from "../state/useScheduledEmailDialogRegionProps.js";
import { type IScheduledEmailDialogFiltersProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's filters region (the filter and parameter chips, flat or per tab),
 * connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogFilters} with the props of
 * {@link useScheduledEmailDialogFiltersProps}; every prop passed here replaces the hook's value for
 * that prop wholesale (`onFiltersChange` / `onFiltersByTabChange` overrides take over the write and
 * must submit the complete selection). Renders nothing while
 * `useScheduledEmailDialogContext().isLoading` is true. The default dialog renders this region on its
 * Filters tab only and hides it behind its stale-filters confirmation step; the block renders wherever
 * it is placed — a shell that wants either builds it from {@link useScheduledExportFilters}.
 *
 * @alpha
 */
export function ScheduledEmailDialogFilters(overrides: Partial<IScheduledEmailDialogFiltersProps>) {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogFilters {...overrides} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogFilters(overrides: Partial<IScheduledEmailDialogFiltersProps>) {
    const defaultProps = useScheduledEmailDialogFiltersProps();
    return <DefaultScheduledEmailDialogFilters {...defaultProps} {...overrides} />;
}
