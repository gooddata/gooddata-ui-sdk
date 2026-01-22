// (C) 2020-2026 GoodData Corporation

export type * from "./typings.js";
export { Overlay } from "./Overlay.js";
export * from "./ZoomAwareOverlay.js";
export { FullScreenOverlay } from "./FullScreenOverlay.js";
export { OverlayController } from "./OverlayController.js";
export {
    OverlayContext,
    OverlayControllerProvider,
    useOverlayController,
    useOverlayZIndex,
    useOverlayZIndexWithRegister,
    type IOverlayControllerProviderProps,
} from "./OverlayContext.js";
export { ErrorOverlay, type IErrorOverlayProps } from "./ErrorOverlay.js";
export {
    alignConfigToAlignPoint,
    type AlignConfig,
    type HorizontalPosition,
    type VerticalPosition,
    type PositionPoint,
} from "./utils.js";
