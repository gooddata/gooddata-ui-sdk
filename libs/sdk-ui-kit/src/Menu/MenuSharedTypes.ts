// (C) 2007-2018 GoodData Corporation

/**
 * @internal
 */
export type OpenAction = "click" | "hover";

/**
 * @internal
 */
export type MenuAlignment =
    | ["bottom", "right"]
    | ["bottom", "left"]
    | ["top", "right"]
    | ["top", "left"]
    | ["right", "top"]
    | ["right", "bottom"]
    | ["left", "top"]
    | ["left", "bottom"];

/**
 * @internal
 */
export interface IOnOpenedChangeParams {
    opened: boolean;
    source: "TOGGLER_BUTTON_CLICK" | "OUTSIDE_CLICK" | "SCROLL" | "CLOSE_MENU_RENDER_PROP" | "HOVER_TIMEOUT";
}

/**
 * @internal
 */
export type OnOpenedChange = (params: IOnOpenedChangeParams) => void;

/**
 * @internal
 */
export interface IMenuPositionConfig {
    alignment: MenuAlignment;
    spacing: number;
    offset: number;
}
