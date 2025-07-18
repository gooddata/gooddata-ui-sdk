// (C) 2024-2025 GoodData Corporation

import { forwardRef } from "react";

import { UiIconButtonRenderer, UiIconButtonPublicProps } from "./UiIconButtonRenderer.js";

/**
 * @internal
 */
export type UiIconButtonProps = UiIconButtonPublicProps;

/**
 * @internal
 */
export const UiIconButton = forwardRef<HTMLButtonElement, UiIconButtonProps>((props, ref) => {
    return <UiIconButtonRenderer {...props} ref={ref} />;
});

UiIconButton.displayName = "UiIconButton";
