// (C) 2025 GoodData Corporation

import React from "react";

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-link");

/**
 * @internal
 */
export interface IUiLinkProps extends Omit<React.HTMLProps<HTMLAnchorElement>, "className"> {
    variant: "primary" | "secondary" | "inverse";
    flipUnderline?: boolean;
    fullWidth?: boolean;
}

/**
 * @internal
 */
export function UiLink({
    variant = "secondary",
    flipUnderline = false,
    fullWidth = false,
    ...anchorProps
}: IUiLinkProps) {
    return <a className={b({ variant, flipUnderline, fullWidth })} {...anchorProps} />;
}
