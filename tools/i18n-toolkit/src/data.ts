// (C) 2021-2025 GoodData Corporation

export const DefaultLocale = "en-US.json";

export const CheckMeasureSuffix = "._measure";
export const CheckMetricSuffix = "._metric";

export type ToolkitOptions = {
    cwd?: string;
    paths?: string[];
    config?: string;
    structure?: boolean;
    intl?: boolean;
    html?: boolean;
    insightToReport?: boolean;
    usage?: boolean;
    comments?: boolean;
    debug?: boolean;
};

export const DefaultConfigName = ".i18nrc.cjs";

export type ToolkitConfigFile = Omit<ToolkitOptions, "cwd"> & {
    source?: string;
    rules?: ToolkitTranslationRule[];
};

export type ToolkitTranslationRule = {
    dir?: RegExp | RegExp[];
    pattern: RegExp | RegExp[];
    filterTranslationFile?: boolean;
    ignore?: boolean;
};

export const Uncontrolled = "uncontrolled";

export type UsageResult = {
    files: string[];
    identifier: string;
    ignore: boolean;
    stats: {
        extracted: number;
        loaded: number;
        ignored: number;
        missing: number;
        unused: number;
    };
    data: {
        missingMessages: string[];
        unusedMessages: string[];
        ignoredMessages: string[];
    };
};
