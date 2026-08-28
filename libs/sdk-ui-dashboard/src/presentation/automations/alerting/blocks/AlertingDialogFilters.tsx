// (C) 2026 GoodData Corporation

import { DefaultAlertingDialogFilters } from "../DefaultAlertingDialog/DefaultAlertingDialogFilters.js";
import { useAlertingDialogFiltersProps } from "../state/useAlertingDialogRegionProps.js";
import { type IAlertingDialogFiltersProps } from "../types.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's filters region (the filter and parameter chips), connected to the dialog's
 * state.
 *
 * Renders {@link DefaultAlertingDialogFilters} with the props of {@link useAlertingDialogFiltersProps};
 * every prop passed here replaces the hook's value for that prop wholesale (an `onFiltersChange`
 * override takes over the write and must submit the complete selection). Renders nothing while
 * `useAlertingDialogContext().isLoading` is true. The default dialog also hides this region behind
 * its stale-filters confirmation step; a shell that wants that step builds it from
 * {@link useAlertFilters}.
 *
 * @alpha
 */
export function AlertingDialogFilters(overrides: Partial<IAlertingDialogFiltersProps>) {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogFilters {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogFilters(overrides: Partial<IAlertingDialogFiltersProps>) {
    const defaultProps = useAlertingDialogFiltersProps();
    return <DefaultAlertingDialogFilters {...defaultProps} {...overrides} />;
}
