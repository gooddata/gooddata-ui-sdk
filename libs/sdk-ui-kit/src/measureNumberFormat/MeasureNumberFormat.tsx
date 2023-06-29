// (C) 2020-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ISeparators, IntlWrapper } from "@gooddata/sdk-ui";

import { IFormatPreset, IFormatTemplate, IToggleButtonProps, PresetType } from "./typings.js";
import { PresetsDropdown } from "./presetsDropdown/PresetsDropdown.js";
import { CustomFormatDialog } from "./customFormatDialog/CustomFormatDialog.js";
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
}

export type MeasureNumberFormatProps = IMeasureNumberFormatOwnProps & WrappedComponentProps;

interface IMeasureNumberFormatState {
    showDropdown: boolean;
    showCustomFormatDialog: boolean;
    selectedPreset: IFormatPreset;
}

class WrappedMeasureNumberFormat extends React.PureComponent<
    MeasureNumberFormatProps,
    IMeasureNumberFormatState
> {
    private toggleButtonEl?: HTMLElement;

    constructor(props: MeasureNumberFormatProps) {
        super(props);

        this.state = {
            selectedPreset: this.findSelectedPreset(),
            showDropdown: false,
            showCustomFormatDialog: false,
        };
    }

    public render() {
        const {
            toggleButton: ToggleButton,
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
        } = this.props;
        const { showDropdown, showCustomFormatDialog, selectedPreset } = this.state;

        const buttonText = intl.formatMessage(
            { id: "measureNumberFormat.buttonLabel" },
            { selectedFormatPresetName: selectedPreset.name },
        );
        const anchorEl = anchorElementSelector || this.toggleButtonEl;
        const customPreset = this.getCustomFormatPreset();

        return (
            <>
                <ToggleButton
                    text={buttonText}
                    isOpened={showDropdown || showCustomFormatDialog}
                    toggleDropdown={this.toggleDropdownOpened}
                    selectedPreset={selectedPreset}
                />
                {showDropdown ? (
                    <PresetsDropdown
                        presets={presets}
                        customPreset={customPreset}
                        separators={separators}
                        selectedPreset={selectedPreset}
                        onSelect={this.onSelect}
                        onClose={this.closeDropdown}
                        anchorEl={anchorEl}
                        positioning={presetsDropdownPositioning}
                        intl={intl}
                    />
                ) : null}
                {showCustomFormatDialog ? (
                    <CustomFormatDialog
                        onApply={this.onCustomFormatDialogApply}
                        onCancel={this.onCustomFormatDialogCancel}
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
    }

    private findSelectedPreset = (): IFormatPreset =>
        this.props.presets.find((preset: IFormatPreset) => preset.format === this.props.selectedFormat) ||
        this.getCustomFormatPreset();

    private toggleDropdownOpened = (e: React.SyntheticEvent<HTMLElement>) => {
        this.toggleButtonEl = e.currentTarget;

        this.setState((state) => ({
            ...state,
            showDropdown: !state.showDropdown,
        }));
        this.toggleCustomFormatDialog();
    };

    private closeDropdown = () => {
        this.setState({ showDropdown: false });
    };

    private toggleCustomFormatDialog = (open = false) => {
        this.setState({
            showCustomFormatDialog: open,
        });
    };

    private onCustomFormatDialogApply = (format: string) => {
        this.toggleCustomFormatDialog(false);
        this.setState({
            selectedPreset: this.getCustomFormatPreset(),
        });
        this.props.setFormat(format);
    };

    private onCustomFormatDialogCancel = () => {
        this.toggleCustomFormatDialog(false);
    };

    private onSelect = (selectedPreset: IFormatPreset) => {
        const { setFormat } = this.props;

        this.closeDropdown();

        if (this.isCustomPreset(selectedPreset)) {
            this.toggleCustomFormatDialog(true);
        } else {
            this.setState((state) => ({
                ...state,
                selectedPreset,
            }));
            setFormat(selectedPreset.format);
        }
    };

    private isCustomPreset = ({ localIdentifier, type }: IFormatPreset) =>
        localIdentifier === CUSTOM_FORMAT_PRESET_LOCAL_IDENTIFIER && type === PresetType.CUSTOM_FORMAT;

    private getCustomFormatPreset = (): IFormatPreset => ({
        name: this.props.intl.formatMessage({ id: "measureNumberFormat.custom.optionLabel" }),
        localIdentifier: CUSTOM_FORMAT_PRESET_LOCAL_IDENTIFIER,
        format: null,
        previewNumber: null,
        type: PresetType.CUSTOM_FORMAT,
    });
}

const MeasureNumberFormatWithIntl = injectIntl(WrappedMeasureNumberFormat);

/**
 * @internal
 */
export class MeasureNumberFormat extends React.PureComponent<IMeasureNumberFormatOwnProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <MeasureNumberFormatWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
