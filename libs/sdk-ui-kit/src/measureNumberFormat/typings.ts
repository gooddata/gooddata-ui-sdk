// (C) 2020-2021 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export interface IFormatPreset {
    name: string;
    localIdentifier: string;
    format: string | null;
    previewNumber: number | null;
    shortFormat?: string;
    type?: PresetType;
}

/**
 * @internal
 */
export enum PresetType {
    CUSTOM_FORMAT = "customFormat",
}

/**
 * @internal
 */
export interface IToggleButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: React.SyntheticEvent) => void;
    selectedPreset: IFormatPreset;
    disabled?: boolean;
}

/**
 * @internal
 */
export interface IFormatTemplate {
    localIdentifier: string;
    format: string;
    name: string;
}
