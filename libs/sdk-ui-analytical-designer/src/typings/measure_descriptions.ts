// (C) 2021-2026 GoodData Corporation

export interface IMeasuresDescriptions {
    [localIdentifier: string]: {
        title: string;
        alias?: string;
        isFormattedAsPercentage: boolean;
        showInPercent: boolean;
        format?: string;
    };
}
