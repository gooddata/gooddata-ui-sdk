// (C) 2020-2025 GoodData Corporation
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { ISeparators, IntlWrapper } from "@gooddata/sdk-ui";

import { CustomFormatDialog } from "./customFormatDialog/CustomFormatDialog.js";
import { PresetsDropdown } from "./presetsDropdown/PresetsDropdown.js";
import { IFormatPreset, IFormatTemplate, IToggleButtonProps, PresetType } from "./typings.js";
import { IPositioning } from "../typings/positioning.js";

export const CUSTOM_FORMAT_PRESET_LOCAL_IDENTIFIER = "customFormat";

/**
 * @internal
 */
export interface IMeasureNumberFormatOwnProps {
    toggleButton: React.ComponentType<IToggleButtonProps>;
    presets: ReadonlyArray<IFormatPreset>;
    separators: ISeparators;
    selectedFormat: string | null;
    setFormat: (format: string | null) => void;
    anchorElementSelector?: string;
    presetsDropdownPositioning?: IPositioning[];
    customFormatDialogPositioning?: IPositioning[];
    defaultCustomFormat?: string;
    documentationLink?: string;
    templates?: ReadonlyArray<IFormatTemplate>;
    locale?: string;
    disabled?: boolean;
}

export type MeasureNumberFormatProps = IMeasureNumberFormatOwnProps & WrappedComponentProps;

const WrappedMeasureNumberFormat = memo(function WrappedMeasureNumberFormat(props: MeasureNumberFormatProps) {
    const {
        toggleButton: ToggleButton,
        disabled,
        anchorElementSelector,
        presets,
        separators,
        selectedFormat,
        defaultCustomFormat,
        presetsDropdownPositioning,
        customFormatDialogPositioning,
        documentationLink,
        templates,
        intl,
        setFormat,
    } = props;

    const toggleButtonEl = useRef<HTMLElement>();

    const getCustomFormatPreset = useCallback(
        (): IFormatPreset => ({
            name: intl.formatMessage({ id: "measureNumberFormat.custom.optionLabel" }),
            localIdentifier: CUSTOM_FORMAT_PRESET_LOCAL_IDENTIFIER,
            format: null,
            previewNumber: null,
            type: PresetType.CUSTOM_FORMAT,
        }),
        [intl],
    );

    const findSelectedPreset = useCallback(
        (): IFormatPreset =>
            presets.find((preset: IFormatPreset) => preset.format === selectedFormat) ||
            getCustomFormatPreset(),
        [presets, selectedFormat, getCustomFormatPreset],
    );

    const [showDropdown, setShowDropdown] = useState(false);
    const [showCustomFormatDialog, setShowCustomFormatDialog] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(() => findSelectedPreset());

    // Update selectedPreset when props change
    useEffect(() => {
        setSelectedPreset(findSelectedPreset());
    }, [findSelectedPreset]);

    const isCustomPreset = useCallback(
        ({ localIdentifier, type }: IFormatPreset) =>
            localIdentifier === CUSTOM_FORMAT_PRESET_LOCAL_IDENTIFIER && type === PresetType.CUSTOM_FORMAT,
        [],
    );

    const toggleCustomFormatDialog = useCallback((open = false) => {
        setShowCustomFormatDialog(open);
    }, []);

    const closeDropdown = useCallback(() => {
        setShowDropdown(false);
    }, []);

    const toggleDropdownOpened = useCallback(
        (e: React.SyntheticEvent<HTMLElement>) => {
            toggleButtonEl.current = e.currentTarget;

            setShowDropdown((prevState) => !prevState);
            toggleCustomFormatDialog();
        },
        [toggleCustomFormatDialog],
    );

    const onCustomFormatDialogApply = useCallback(
        (format: string) => {
            toggleCustomFormatDialog(false);
            setSelectedPreset(getCustomFormatPreset());
            setFormat(format);
        },
        [toggleCustomFormatDialog, getCustomFormatPreset, setFormat],
    );

    const onCustomFormatDialogCancel = useCallback(() => {
        toggleCustomFormatDialog(false);
    }, [toggleCustomFormatDialog]);

    const onSelect = useCallback(
        (selectedPreset: IFormatPreset) => {
            closeDropdown();

            if (isCustomPreset(selectedPreset)) {
                toggleCustomFormatDialog(true);
            } else {
                setSelectedPreset(selectedPreset);
                setFormat(selectedPreset.format);
            }
        },
        [closeDropdown, isCustomPreset, toggleCustomFormatDialog, setFormat],
    );

    const buttonText = useMemo(
        () =>
            intl.formatMessage(
                { id: "measureNumberFormat.buttonLabel" },
                { selectedFormatPresetName: selectedPreset.name },
            ),
        [intl, selectedPreset.name],
    );
    const anchorEl = anchorElementSelector || toggleButtonEl.current;
    const customPreset = getCustomFormatPreset();

    return (
        <>
            <ToggleButton
                text={buttonText}
                isOpened={showDropdown || showCustomFormatDialog}
                toggleDropdown={toggleDropdownOpened}
                selectedPreset={selectedPreset}
                disabled={disabled}
            />
            {showDropdown ? (
                <PresetsDropdown
                    presets={presets}
                    customPreset={customPreset}
                    separators={separators}
                    selectedPreset={selectedPreset}
                    onSelect={onSelect}
                    onClose={closeDropdown}
                    anchorEl={anchorEl}
                    positioning={presetsDropdownPositioning}
                    intl={intl}
                />
            ) : null}
            {showCustomFormatDialog ? (
                <CustomFormatDialog
                    onApply={onCustomFormatDialogApply}
                    onCancel={onCustomFormatDialogCancel}
                    formatString={selectedFormat || defaultCustomFormat}
                    separators={separators}
                    anchorEl={anchorEl}
                    positioning={customFormatDialogPositioning}
                    documentationLink={documentationLink}
                    templates={templates}
                    intl={intl}
                />
            ) : null}
        </>
    );
});

const MeasureNumberFormatWithIntl = injectIntl(WrappedMeasureNumberFormat);

/**
 * @internal
 */
export const MeasureNumberFormat = memo(function MeasureNumberFormat(props: IMeasureNumberFormatOwnProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <MeasureNumberFormatWithIntl {...props} />
        </IntlWrapper>
    );
});
