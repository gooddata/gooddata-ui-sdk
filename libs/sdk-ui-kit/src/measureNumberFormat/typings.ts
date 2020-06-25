// (C) 2020 GoodData Corporation
import * as React from "react";

/**
 * @alpha
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
 * @alpha
 */
export enum PresetType {
    CUSTOM_FORMAT = "customFormat",
}

/**
 * @alpha
 */
export interface IToggleButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: React.SyntheticEvent) => void;
}
