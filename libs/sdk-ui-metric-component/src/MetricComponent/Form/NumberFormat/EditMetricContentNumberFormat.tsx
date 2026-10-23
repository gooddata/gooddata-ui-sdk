// (C) 2021-2026 GoodData Corporation

import { memo, useCallback } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import {
    Button,
    type IFormatPreset,
    type IToggleButtonProps,
    MeasureNumberFormat,
    useCurrencyFormatDefaults,
    useMetricTypePresets,
} from "@gooddata/sdk-ui-kit";

import { useEvents } from "../../../shared/eventing/useEvents.js";
import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { MetricTypeField } from "../Header/MetricTypeField.js";
import { useMetricFormatState } from "../hooks/useMetricFormatState.js";

import { events } from "./EditMetricContentNumberFormat.events.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        display: "flex",
        alignItems: "center",
        gap: 20,
    },
    label: {
        fontSize: "14px",
        marginRight: "10px",
        color: theme.globals.colors.description,
    },
    formatSection: {
        display: "flex",
        alignItems: "center",
    },
}));

function ToggleButton({
    isOpened,
    toggleDropdown,
    selectedPreset,
    isReadOnly,
}: IToggleButtonProps & { isReadOnly?: boolean }) {
    const { cx } = useStyles();
    const iconRight = isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown";
    return (
        <div
            className={cx("s-metric_number_format_button_wrapper")}
            onMouseUp={(e) => !isReadOnly && toggleDropdown(e)}
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

interface IEditMetricContentNumberFormatProps {
    separators?: ISeparators;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
}

const DEFAULT_SEPARATORS: ISeparators = {
    thousand: ",",
    decimal: ".",
};

function EditMetricContentNumberFormatComponent({
    separators,
    currencyFormatOverride,
    enableMetricFormatOverrides = false,
}: IEditMetricContentNumberFormatProps) {
    const { classes } = useStyles();
    const intl = useIntl();

    // Get metric type from form state
    const { metricType } = useMetricFormatState({
        enableMetricFormatOverrides,
        currencyFormatOverride,
        presets: [],
    });

    // Get presets and templates based on metric type using SDK hook
    const { presets, templates } = useMetricTypePresets({
        metricType: enableMetricFormatOverrides ? metricType : undefined,
        currencyFormatOverride,
        formatMessage: (descriptor) => intl.formatMessage(descriptor),
    });

    // Get format state (normalized format, bootstrap config, etc.)
    const {
        normalizedFormat,
        isFormatMissing,
        inheritPreset,
        isReadOnly,
        setFormat,
        currencyFormatDefaultsConfig,
    } = useMetricFormatState({
        enableMetricFormatOverrides,
        currencyFormatOverride,
        presets,
    });

    // Handle currency format defaults (auto-bootstrapping)
    useCurrencyFormatDefaults({
        ...currencyFormatDefaultsConfig,
        onFormatChange: setFormat,
    });

    const onPresetChange = usePresetChange(presets, setFormat);

    const MyToggleButton = useCallback(
        (props: IToggleButtonProps & { isReadOnly?: boolean }) => (
            <ToggleButton {...props} isReadOnly={isReadOnly} />
        ),
        [isReadOnly],
    );

    return (
        <div className={classes.root}>
            {enableMetricFormatOverrides ? <MetricTypeField /> : null}
            <div className={classes.formatSection}>
                <div className={classes.label}>
                    <FormattedMessage id="metricComponent.numberFormat.label" />
                </div>
                <MeasureNumberFormat
                    locale={intl.locale}
                    toggleButton={MyToggleButton}
                    presets={presets}
                    separators={separators ?? DEFAULT_SEPARATORS}
                    templates={templates}
                    selectedFormat={
                        inheritPreset && isFormatMissing ? inheritPreset.format : (normalizedFormat ?? null)
                    }
                    setFormat={onPresetChange}
                />
            </div>
        </div>
    );
}

export const EditMetricContentNumberFormat = memo(EditMetricContentNumberFormatComponent);

/**
 * Hook that handles preset selection and tracks events.
 */
function usePresetChange(presets: IFormatPreset[], setValue: (val: string | null) => void) {
    const { metricFormatChangedEvent } = useEvents(events);

    return useCallback(
        (format: string | null) => {
            const preset = presets.find(
                (p) => p.format === format || (format === null && p.localIdentifier === "inherit"),
            );
            if (preset?.localIdentifier === "inherit") {
                setValue(null);
                metricFormatChangedEvent("inherit");
            } else {
                setValue(format);
                metricFormatChangedEvent(preset ? preset.localIdentifier : "custom");
            }
        },
        [metricFormatChangedEvent, presets, setValue],
    );
}
