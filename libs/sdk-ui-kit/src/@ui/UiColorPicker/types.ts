// (C) 2021-2026 GoodData Corporation

/**
 * Channels, each 0 to 255.
 *
 * @internal
 */
export interface IUiColorPickerRgb {
    r: number;
    g: number;
    b: number;
}

/**
 * Channels, each 0 to 255, with opacity from 0 (transparent) to 1 (opaque).
 *
 * @internal
 */
export interface IUiColorPickerRgba extends IUiColorPickerRgb {
    a: number;
}

/**
 * What every picker takes, whichever way it reports the color it gathers.
 *
 * @internal
 */
export interface IUiColorPickerBaseProps {
    /**
     * The color to start from. The picker follows it when it changes.
     *
     * @remarks
     * Never feed the picker the color it just reported: read in again it loses the hue that a gray,
     * black or white cannot carry, and the handle jumps off the wheel mid-drag. A caller applying
     * changes live should hold the color it seeds the picker with apart from the one it stores.
     */
    initialRgbColor: IUiColorPickerRgb | IUiColorPickerRgba;

    /**
     * Adds an opacity control and lets the reported color carry one.
     *
     * @remarks
     * Off by default: a consumer that stores a color without an opacity would drop the one the user
     * had set, without saying so.
     */
    supportsAlpha?: boolean;
}

/**
 * A picker that gathers a color and reports it once, when confirmed.
 *
 * @internal
 */
export interface IUiColorPickerCommitProps extends IUiColorPickerBaseProps {
    onSubmit: (color: IUiColorPickerRgba) => void;

    /**
     * Dismisses the picker, leaving the color as it was.
     */
    onCancel: () => void;

    onChange?: never;
}

/**
 * A picker that reports every change as it is made, and so has nothing to confirm or take back: the
 * color is already applied, and going back from it is the caller's to offer.
 *
 * @internal
 */
export interface IUiColorPickerLiveProps extends IUiColorPickerBaseProps {
    onChange: (color: IUiColorPickerRgba) => void;

    onSubmit?: never;
}

/**
 * @internal
 */
export type IUiColorPickerProps = IUiColorPickerCommitProps | IUiColorPickerLiveProps;
