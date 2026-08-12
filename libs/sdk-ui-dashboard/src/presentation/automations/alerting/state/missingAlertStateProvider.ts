// (C) 2026 GoodData Corporation

/**
 * The single error every alerting dialog state accessor throws when no provider is above it.
 *
 * @internal
 */
export function missingAlertStateProvider(accessor: string): never {
    throw new Error(
        `${accessor} must be used within AlertingDialogStateProvider. The provider mounts only once the dialog's data has loaded, so check useAlertingDialogContext().isLoading before reading alerting dialog state.`,
    );
}
