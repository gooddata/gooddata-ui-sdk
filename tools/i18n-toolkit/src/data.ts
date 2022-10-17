// (C) 2021-2022 GoodData Corporation

export const DefaultLocale = "en-US.json";

export const CheckInsightPipe = "|insight";
export const CheckReportPipe = "|report";

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
    debug?: boolean;
};

export const DefaultConfigName = ".i18nrc.js";

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
