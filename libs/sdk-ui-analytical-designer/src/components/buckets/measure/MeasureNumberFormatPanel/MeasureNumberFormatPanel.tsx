// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import classNames from "classnames";
import { defineMessages, useIntl } from "react-intl";
import { connect } from "react-redux";

import {
    Button,
    type IFormatPreset,
    type IToggleButtonProps,
    MeasureNumberFormat,
    useMetricTypePresets,
} from "@gooddata/sdk-ui-kit";

import { setBucketItemFormat } from "../../../../actions/buckets_actions.js";
import {
    CUSTOM_FORMAT_DIALOG_POSITIONING,
    PRESETS_DROPDOWN_POSITIONING,
} from "../../../../constants/measure_number_format_positioning.js";
import { type IAppState } from "../../../../store/types.js";

import { getEffectiveSelectedFormat } from "./effectiveFormatUtils.js";
import {
    type IMeasureNumberFormatStateProps,
    makeMeasureNumberFormatSelector,
} from "./measure_number_format_panel_selector.js";

const messages = defineMessages({
    inherit: { id: "measureNumberFormat.numberFormat.preset.inherit" },
});

interface IMeasureNumberFormatOwnProps {
    bucketItemLocalIdentifier: string;
}

interface IMeasureNumberDispatchProps {
    setBucketItemFormat: (localIdentifier: string, format: string | null, presetId?: string) => void;
}

type MeasureNumberFormatProps = IMeasureNumberFormatOwnProps &
    IMeasureNumberFormatStateProps &
    IMeasureNumberDispatchProps;

const mapDispatchToProps: IMeasureNumberDispatchProps = {
    setBucketItemFormat,
};

const mapStateToProps = (_state: IAppState, ownProps: IMeasureNumberFormatOwnProps) => {
    return makeMeasureNumberFormatSelector(ownProps.bucketItemLocalIdentifier);
};

export const MeasureNumberFormatPanel = connect<
    IMeasureNumberFormatStateProps,
    IMeasureNumberDispatchProps,
    IMeasureNumberFormatOwnProps,
    IAppState
>(
    mapStateToProps,
    mapDispatchToProps,
)(function MeasureNumberFormatPanel({
    separators,
    bucketItemLocalIdentifier,
    selectedFormat,
    defaultCustomFormat,
    setBucketItemFormat,
    formattingDocumentationLink,
    inheritAvailable,
    metricType,
    enableMetricFormatOverrides,
    currencyFormatOverride,
}: MeasureNumberFormatProps) {
    const intl = useIntl();

    // Determine effective metric type based on feature flag
    const effectiveMetricType = enableMetricFormatOverrides ? metricType : undefined;

    const {
        presets: metricTypePresets,
        templates,
        inheritPreset: currencyInheritPreset,
    } = useMetricTypePresets({
        metricType: effectiveMetricType,
        currencyFormatOverride,
        formatMessage: (descriptor) => intl.formatMessage(descriptor),
    });

    // Build final presets:
    // - For CURRENCY metrics: use currency presets from hook (includes inherit if override exists)
    // - For non-CURRENCY metrics: use standard presets, add legacy inherit preset if available
    const presets = useMemo((): IFormatPreset[] => {
        if (effectiveMetricType === "CURRENCY") {
            // Currency presets already include inherit if currencyFormatOverride exists
            return metricTypePresets;
        }

        // For non-CURRENCY: add legacy inherit preset if available
        if (inheritAvailable) {
            const legacyInheritPreset: IFormatPreset = {
                name: intl.formatMessage(messages.inherit),
                localIdentifier: "inherit",
                format: null,
                previewNumber: 1000.12,
            };
            return [legacyInheritPreset, ...metricTypePresets];
        }

        return metricTypePresets;
    }, [effectiveMetricType, metricTypePresets, inheritAvailable, intl]);

    // Determine the effective inherit preset
    const inheritPreset = useMemo(() => {
        if (effectiveMetricType === "CURRENCY") {
            return currencyInheritPreset;
        }
        return inheritAvailable ? presets.find((p) => p.localIdentifier === "inherit") : null;
    }, [effectiveMetricType, currencyInheritPreset, inheritAvailable, presets]);

    // Determine the effective selected format using the utility function
    const effectiveSelectedFormat = useMemo(
        () => getEffectiveSelectedFormat(selectedFormat, defaultCustomFormat, inheritPreset),
        [selectedFormat, defaultCustomFormat, inheritPreset],
    );

    const setFormat = useCallback(
        (format: string | null) => {
            const selectedPreset = presets.find((preset) => preset.format === format);
            // If selecting inherit preset, store null as the format
            const formatToStore = selectedPreset?.localIdentifier === "inherit" ? null : format;
            setBucketItemFormat(bucketItemLocalIdentifier, formatToStore, selectedPreset?.localIdentifier);
        },
        [setBucketItemFormat, bucketItemLocalIdentifier, presets],
    );

    return (
        <section className="adi-measure-number-format-wrapper">
            <MeasureNumberFormat
                toggleButton={ToggleButton}
                anchorElementSelector={".adi-measure-number-format-button-wrapper"}
                presetsDropdownPositioning={PRESETS_DROPDOWN_POSITIONING}
                customFormatDialogPositioning={CUSTOM_FORMAT_DIALOG_POSITIONING}
                presets={presets}
                separators={separators}
                templates={templates}
                selectedFormat={effectiveSelectedFormat}
                defaultCustomFormat={defaultCustomFormat}
                setFormat={setFormat}
                documentationLink={formattingDocumentationLink}
                locale={intl.locale}
                key={effectiveSelectedFormat}
            />
        </section>
    );
});

function ToggleButton({ isOpened, text, toggleDropdown }: IToggleButtonProps) {
    const buttonClassNames = classNames(
        "gd-button-link",
        "button-dropdown",
        "adi-measure-number-format-button",
        "s-measure-number-format",
        {
            "is-active": isOpened,
        },
    );
    const iconRight = isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown";
    return (
        <div className={"adi-measure-number-format-button-wrapper"}>
            <Button
                className={buttonClassNames}
                title={text}
                value={text}
                onClick={toggleDropdown}
                iconLeft={"adi-icon-number-format"}
                iconRight={iconRight}
            />
        </div>
    );
}
