// (C) 2007-2020 GoodData Corporation

/**
 * @internal
 */
export function visualizationIsBetaWarning(): void {
    // eslint-disable-next-line no-console
    console.warn(
        "This chart is not production-ready and may not provide the full functionality. Use it at your own risk.",
    );
}
