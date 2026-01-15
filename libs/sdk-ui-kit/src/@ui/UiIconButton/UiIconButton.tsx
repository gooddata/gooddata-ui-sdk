// (C) 2024-2026 GoodData Corporation

import { forwardRef } from "react";

import { type IUiIconButtonPublicProps, UiIconButtonRenderer } from "./UiIconButtonRenderer.js";

/**
 * @internal
 */
export type UiIconButtonProps = IUiIconButtonPublicProps;

/**
 * @internal
 */
export const UiIconButton = forwardRef<HTMLButtonElement, UiIconButtonProps>((props, ref) => {
    return <UiIconButtonRenderer {...props} ref={ref} />;
});

UiIconButton.displayName = "UiIconButton";
