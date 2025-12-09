// (C) 2025 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { ISeparators, MetricType } from "@gooddata/sdk-model";
import {
    Button,
    Dropdown,
    DropdownList,
    type IToggleButtonProps,
    MeasureNumberFormat,
    SingleSelectListItem,
    useCurrencyFormatDefaults,
    useMetricTypePresets,
} from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";

const metricTypeMessages = defineMessages({
    unspecified: { id: "metricComponent.metricType.unspecified" },
    currency: { id: "metricComponent.metricType.currency" },
});

/**
 * Currency format preset messages used by useMetricTypePresets hook.
 * These are declared here to make them traceable by i18n-toolkit.
 * The actual usage is dynamic via the hook from sdk-ui-kit.
 */
void defineMessages({
    currency: { id: "metricComponent.numberFormat.preset.currency" },
    currency1: { id: "metricComponent.numberFormat.preset.currency1" },
    currencyRounded: { id: "metricComponent.numberFormat.preset.currencyRounded" },
    inherit: { id: "metricComponent.numberFormat.preset.inherit" },
});

const METRIC_TYPE_OPTIONS: Array<{ value: MetricType | undefined; message: MessageDescriptor }> = [
    { value: undefined, message: metricTypeMessages.unspecified },
    { value: "CURRENCY", message: metricTypeMessages.currency },
];

const DEFAULT_SEPARATORS = {
    thousand: ",",
    decimal: ".",
};

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
    const formatMessage = useCallback((descriptor: { id: string }) => intl.formatMessage(descriptor), [intl]);
    const normalizedFormat = normalizeFormatValue(format);
    const metricOverridesEnabled = Boolean(enableMetricFormatOverrides);
    const effectiveMetricType = metricOverridesEnabled ? metricType : undefined;
    const { presets, templates, inheritPreset } = useMetricTypePresets({
        metricType: effectiveMetricType,
        currencyFormatOverride,
        formatMessage,
    });
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
        hasInheritPreset: metricOverridesEnabled && inheritPreset !== null,
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

function useFormatChangeHandler(
    presets: ReturnType<typeof useMetricTypePresets>["presets"],
    onChange: (format: string | null) => void,
) {
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
