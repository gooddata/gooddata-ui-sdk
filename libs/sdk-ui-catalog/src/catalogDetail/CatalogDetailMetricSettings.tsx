// (C) 2025 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { ISeparators, MetricType } from "@gooddata/sdk-model";
import {
    Button,
    Dropdown,
    DropdownList,
    type IFormatPreset,
    type IFormatTemplate,
    type IToggleButtonProps,
    MeasureNumberFormat,
    SingleSelectListItem,
    createCurrencyPresets,
    useCurrencyFormatDefaults,
} from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";

const metricTypeMessages = defineMessages({
    unspecified: { id: "metricComponent.metricType.unspecified" },
    currency: { id: "metricComponent.metricType.currency" },
});

// Currency preset message IDs are dynamically used via createCurrencyPresets
// Keeping references here for localization validation
const _currencyPresetMessages = defineMessages({
    currency: { id: "metricComponent.numberFormat.preset.currency" },
    currency1: { id: "metricComponent.numberFormat.preset.currency1" },
    currencyRounded: { id: "metricComponent.numberFormat.preset.currencyRounded" },
});
void _currencyPresetMessages; // Suppress unused variable warning

const METRIC_TYPE_OPTIONS: Array<{ value: MetricType | undefined; message: MessageDescriptor }> = [
    { value: undefined, message: metricTypeMessages.unspecified },
    { value: "CURRENCY", message: metricTypeMessages.currency },
];

const DEFAULT_SEPARATORS = {
    thousand: ",",
    decimal: ".",
};

const CURRENCY_TEMPLATE_IDS = ["currency", "currency-shortened"];

export interface CatalogDetailMetricSettingsProps {
    metricType?: MetricType;
    format?: string | null;
    canEdit: boolean;
    separators?: ISeparators;
    currencyFormatOverride?: string | null;
    onMetricTypeChange?: (metricType: MetricType | undefined) => void;
    onFormatChange?: (format: string | null) => void;
    enableMetricFormatOverrides?: boolean;
}

export const CatalogDetailMetricSettings = memo(function CatalogDetailMetricSettings({
    metricType,
    format,
    canEdit,
    separators,
    currencyFormatOverride,
    onMetricTypeChange,
    onFormatChange,
    enableMetricFormatOverrides,
}: CatalogDetailMetricSettingsProps) {
    const intl = useIntl();
    const formatMessage = useCallback(
        (descriptor: MessageDescriptor) => intl.formatMessage(descriptor),
        [intl],
    );
    const normalizedFormat = normalizeFormatValue(format);
    const metricOverridesEnabled = Boolean(enableMetricFormatOverrides);
    const effectiveMetricType = metricOverridesEnabled ? metricType : undefined;
    const { presets, templates } = useMetricFormatResources(
        effectiveMetricType,
        currencyFormatOverride,
        formatMessage,
    );
    const inheritPreset = presets.find((preset) => preset.localIdentifier === "inherit");
    const directFormatChange = useCallback(
        (value: string | null) => {
            if (onFormatChange) {
                onFormatChange(value);
            }
        },
        [onFormatChange],
    );
    const selectedFormat =
        inheritPreset && normalizedFormat === null ? inheritPreset.format : normalizedFormat;
    const handleFormatChange = useFormatChangeHandler(presets, directFormatChange);
    const shouldBootstrapCurrencyFormat =
        metricOverridesEnabled && metricType === "CURRENCY" && format === undefined;
    const currencyPresetFormats = useMemo(
        () =>
            presets
                .filter((preset) => preset.localIdentifier !== "inherit")
                .map((preset) => preset.format)
                .filter((presetFormat): presetFormat is string => typeof presetFormat === "string"),
        [presets],
    );

    useCurrencyFormatDefaults({
        metricType: metricOverridesEnabled ? metricType : undefined,
        normalizedFormat,
        currencyFormatOverride,
        presetFormats: currencyPresetFormats,
        hasInheritPreset: metricOverridesEnabled && Boolean(inheritPreset),
        onFormatChange: directFormatChange,
        shouldBootstrap: shouldBootstrapCurrencyFormat,
    });

    const Toggle = useCallback(
        (props: IToggleButtonProps & { isReadOnly?: boolean }) => (
            <NumberFormatToggleButton {...props} isReadOnly={!canEdit || props.isReadOnly} />
        ),
        [canEdit],
    );

    return (
        <>
            {metricOverridesEnabled ? (
                <CatalogDetailContentRow
                    title={<FormattedMessage id="metricComponent.metricType.label" />}
                    content={
                        <MetricTypeDropdown
                            canEdit={canEdit}
                            metricType={metricType}
                            onMetricTypeChange={onMetricTypeChange}
                        />
                    }
                />
            ) : null}
            <CatalogDetailContentRow
                title={<FormattedMessage id="metricComponent.numberFormat.label" />}
                content={
                    <MeasureNumberFormat
                        locale={intl.locale}
                        toggleButton={Toggle}
                        presets={presets}
                        templates={templates}
                        separators={separators ?? DEFAULT_SEPARATORS}
                        selectedFormat={selectedFormat}
                        setFormat={handleFormatChange}
                    />
                }
            />
        </>
    );
});

interface MetricTypeDropdownProps {
    canEdit: boolean;
    metricType?: MetricType;
    onMetricTypeChange?: (metricType: MetricType | undefined) => void;
}

const MetricTypeDropdown = memo(function MetricTypeDropdown({
    canEdit,
    metricType,
    onMetricTypeChange,
}: MetricTypeDropdownProps) {
    const intl = useIntl();
    const selectedOption = (METRIC_TYPE_OPTIONS.find((option) => option.value === metricType) ??
        METRIC_TYPE_OPTIONS[0])!;

    return (
        <Dropdown
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    width={200}
                    items={METRIC_TYPE_OPTIONS}
                    renderItem={({ item }) => (
                        <SingleSelectListItem
                            title={intl.formatMessage(item.message)}
                            isSelected={item.value === metricType}
                            onClick={() => {
                                onMetricTypeChange?.(item.value);
                                closeDropdown();
                            }}
                        />
                    )}
                />
            )}
            renderButton={({ toggleDropdown, isOpen }) => (
                <Button
                    className="gd-button-secondary"
                    value={intl.formatMessage(selectedOption.message)}
                    iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                    onClick={toggleDropdown}
                    disabled={!canEdit}
                />
            )}
        />
    );
});

function NumberFormatToggleButton({
    isOpened,
    toggleDropdown,
    selectedPreset,
    isReadOnly,
}: IToggleButtonProps & { isReadOnly?: boolean }) {
    const iconRight = isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown";
    return (
        <div
            className="gd-analytics-catalog-number-format__toggle"
            onMouseUp={(event) => {
                if (!isReadOnly) {
                    toggleDropdown(event);
                }
            }}
        >
            <Button
                disabled={isReadOnly}
                className="gd-button gd-button-secondary"
                title={selectedPreset.name}
                value={selectedPreset.name}
                iconRight={iconRight}
            />
        </div>
    );
}

function normalizeFormatValue(value?: string | null) {
    if (!value) {
        return null;
    }

    return value;
}

type FormatMessageFn = (descriptor: MessageDescriptor) => string;

function useMetricFormatResources(
    metricType: MetricType | undefined,
    currencyFormatOverride: string | null | undefined,
    formatMessage: FormatMessageFn,
) {
    const allPresets: IFormatPreset[] = useMemo(
        () => [
            {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.rounded" }),
                localIdentifier: "rounded",
                format: "#,##0",
                previewNumber: 1000.12,
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.decimal1" }),
                localIdentifier: "decimal-1",
                format: "#,##0.0",
                previewNumber: 1000.12,
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.decimal2" }),
                localIdentifier: "decimal-2",
                format: "#,##0.00",
                previewNumber: 1000.12,
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.percentRounded" }),
                localIdentifier: "percent-rounded",
                format: "#,##0%",
                previewNumber: 0.1,
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.percent1" }),
                localIdentifier: "percent-1",
                format: "#,##0.0%",
                previewNumber: 0.101,
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.percent2" }),
                localIdentifier: "percent-2",
                format: "#,##0.00%",
                previewNumber: 0.1012,
            },
        ],
        [formatMessage],
    );

    const baseCurrencyPresets: IFormatPreset[] = useMemo(
        () => createCurrencyPresets(formatMessage),
        [formatMessage],
    );

    const currencyPresets = useMemo(() => {
        if (!currencyFormatOverride) {
            return baseCurrencyPresets;
        }
        return baseCurrencyPresets.filter((preset) => preset.format !== currencyFormatOverride);
    }, [baseCurrencyPresets, currencyFormatOverride]);

    const inheritPreset: IFormatPreset | null = useMemo(() => {
        if (metricType === "CURRENCY" && currencyFormatOverride) {
            return {
                name: formatMessage({ id: "metricComponent.numberFormat.preset.inherit" }),
                localIdentifier: "inherit",
                format: currencyFormatOverride,
                previewNumber: 1000.12,
            };
        }
        return null;
    }, [currencyFormatOverride, formatMessage, metricType]);

    const presets: IFormatPreset[] = useMemo(() => {
        if (metricType === "CURRENCY") {
            if (inheritPreset) {
                return [inheritPreset, ...currencyPresets];
            }
            return currencyPresets;
        }

        return allPresets;
    }, [allPresets, currencyPresets, inheritPreset, metricType]);

    const templates: IFormatTemplate[] = useMemo(() => {
        const allTemplates: IFormatTemplate[] = [
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.rounded" }),
                localIdentifier: "rounded",
                format: "#,##0",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.decimal1" }),
                localIdentifier: "decimal-1",
                format: "#,##0.0",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.decimal2" }),
                localIdentifier: "decimal-2",
                format: "#,##0.00",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.percentRounded" }),
                localIdentifier: "percent-rounded",
                format: "#,##0%",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.percent1" }),
                localIdentifier: "percent-1",
                format: "#,##0.0%",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.percent2" }),
                localIdentifier: "percent-2",
                format: "#,##0.00%",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.currency" }),
                localIdentifier: "currency",
                format: "$#,##0.00",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.currencyShortened" }),
                localIdentifier: "currency-shortened",
                format:
                    "[>=1000000000000]$#,,,,.0 T;\n" +
                    "[>=1000000000]$#,,,.0 B;\n" +
                    "[>=1000000]$#,,.0 M;\n" +
                    "[>=1000]$#,.0 K;\n" +
                    "[>=0]$#,##0;\n" +
                    "[<=-1000000000000]-$#,,,,.0 T;\n" +
                    "[<=-1000000000]-$#,,,.0 B;\n" +
                    "[<=-1000000]-$#,,.0 M;\n" +
                    "[<=-1000]-$#,.0 K;\n" +
                    "[<0]-$#,##0",
            },
            {
                name: formatMessage({
                    id: "metricComponent.numberFormat.template.largeNumbersShortened",
                }),
                localIdentifier: "large-numbers-shortened",
                format:
                    "[>=1000000000000]#,,,,.0 T;\n" +
                    "[>=1000000000]#,,,.0 B;\n" +
                    "[>=1000000]#,,.0 M;\n" +
                    "[>=1000]#,.0 K;\n" +
                    "[>=0]#,##0;\n" +
                    "[<=-1000000000000]-#,,,,.0 T;\n" +
                    "[<=-1000000000]-#,,,.0 B;\n" +
                    "[<=-1000000]-#,,.0 M;\n" +
                    "[<=-1000]-#,.0 K;\n" +
                    "[<0]-#,##0",
            },
            {
                name: formatMessage({
                    id: "metricComponent.numberFormat.template.largeNumbersShortenedWithColors",
                }),
                localIdentifier: "large-numbers-shortened-with-colors",
                format:
                    "[>=1000000000000][green]#,,,,.0 T;\n" +
                    "[>=1000000000][green]#,,,.0 B;\n" +
                    "[>=1000000][green]#,,.0 M;\n" +
                    "[>=1000][black]#,.0 K;\n" +
                    "[>=0][black]#,##0;\n" +
                    "[<=-1000000000000][red]-#,,,,.0 T;\n" +
                    "[<=-1000000000][red]-#,,,.0 B;\n" +
                    "[<=-1000000][red]-#,,.0 M;\n" +
                    "[<=-1000][red]-#,.0 K;\n" +
                    "[<0][black]-#,##0",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.negativeNumbersRed" }),
                localIdentifier: "negative-numbers-red",
                format: "[<0][red]-#,##0.0;\n" + "[black]#,##0.0",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.financial" }),
                localIdentifier: "financial",
                format: "[<0](#,##0.0);\n" + "#,##0.0",
            },
            {
                name: formatMessage({
                    id: "metricComponent.numberFormat.template.decimalWithoutThousandsSeparator",
                }),
                localIdentifier: "decimal-without-thousands-separator",
                format: "0.00",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.conditionalColors" }),
                localIdentifier: "conditional-colors",
                format: "[<0][red]#,#.##;\n" + "[<1000][black]#,0.##;\n" + "[>=1000][green]#,#.##",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.trendSymbols" }),
                localIdentifier: "trend-symbols",
                format: "[<0][green]▲ #,##0.0%;\n" + "[=0][black]#,##0.0%;\n" + "[>0][red]▼ #,##0.0%",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.timeFromSeconds" }),
                localIdentifier: "time-from-seconds",
                format:
                    "[>=86400]{{{86400||0d}}} {{{3600|24|00}}}h;\n" +
                    "[>=3600]{{{3600|24|00}}}h {{{60|60|00}}}m;\n" +
                    "[>=60]{{{60|60|00}}}m {{{|60.|00}}}s;\n" +
                    "[>0]{{{|60.|00.0}}}s;\n" +
                    "[=0]{{{|60.|0}}}",
            },
            {
                name: formatMessage({ id: "metricComponent.numberFormat.template.zeroInsteadOfNull" }),
                localIdentifier: "zero-instead-of-null",
                format: "[=null]0.00;\n" + "[>=0]#,#0.00;\n" + "[<0]-#,#0.00",
            },
        ];

        if (metricType === "CURRENCY") {
            return allTemplates.filter((template) =>
                CURRENCY_TEMPLATE_IDS.includes(template.localIdentifier),
            );
        }

        return allTemplates;
    }, [formatMessage, metricType]);

    return {
        presets,
        templates,
    };
}

function useFormatChangeHandler(presets: IFormatPreset[], onChange: (format: string | null) => void) {
    return useCallback(
        (format: string | null) => {
            const preset = presets.find(
                (p) => p.format === format || (format === null && p.localIdentifier === "inherit"),
            );
            if (preset?.localIdentifier === "inherit") {
                onChange(null);
            } else {
                onChange(format);
            }
        },
        [onChange, presets],
    );
}
