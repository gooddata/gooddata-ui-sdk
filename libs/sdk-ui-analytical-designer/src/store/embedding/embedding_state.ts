// (C) 2026 GoodData Corporation

import { type ITheme } from "@gooddata/sdk-model";

export interface IDeviceState {
    viewport: string;
    pixelRatio: number;
    isMobile: boolean;
}

export const deviceInitialState: IDeviceState = {
    viewport: "0x0",
    pixelRatio: 0,
    isMobile: false,
};

export type IThemeState = ITheme | null;
export const themeInitialState: IThemeState = null;

export const isEmbeddedInitialState = false as boolean;
export const isReadOnlyInitialState = false as boolean;
/** Seeded explicitly; readers treat it as a boolean. */
export const isHostedComponentInitialState = false as boolean;
