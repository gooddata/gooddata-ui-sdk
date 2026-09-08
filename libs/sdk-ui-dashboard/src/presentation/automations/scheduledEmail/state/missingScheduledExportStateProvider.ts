// (C) 2026 GoodData Corporation

/**
 * The single error every scheduled-export dialog state accessor throws when no provider is above it.
 *
 * @internal
 */
export function missingScheduledExportStateProvider(accessor: string): never {
    throw new Error(
        `${accessor} must be used within ScheduledEmailDialogStateProvider. The state model mounts once the dialog's data has first loaded, so check useScheduledEmailDialogContext().isLoading before reading scheduled-export dialog state.`,
    );
}
