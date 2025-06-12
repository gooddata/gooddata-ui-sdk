// (C) 2007-2022 GoodData Corporation

/**
 * @internal
 */
export function visualizationIsBetaWarning(): void {
    console.warn(
        "This chart is not production-ready and may not provide the full functionality. Use it at your own risk.",
    );
}
