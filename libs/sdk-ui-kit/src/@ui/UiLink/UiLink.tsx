// (C) 2025-2026 GoodData Corporation

import { type HTMLProps, type MouseEvent } from "react";

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-link");

/**
 * @internal
 */
export interface IUiLinkProps extends Omit<HTMLProps<HTMLAnchorElement>, "className" | "as"> {
    variant: "primary" | "secondary" | "inverse";
    flipUnderline?: boolean;
    fullWidth?: boolean;
    dataTestId?: string;
    /**
     * Element to render. Defaults to `"a"`. Use `"span"` when the link visually needs
     * UiLink styling but is rendered inside another anchor — HTML5 forbids nested
     * `<a>` elements, so wrappers (e.g. a fully clickable card) need their inner
     * link-styled labels rendered as spans.
     */
    as?: "a" | "span";
    /**
     * When true, the link is rendered in a disabled visual state, removed from the
     * focus order, and (for `as="a"`) clicks are suppressed and `href` is stripped.
     */
    isDisabled?: boolean;
}

/**
 * @internal
 */
export function UiLink({
    variant = "secondary",
    flipUnderline = false,
    fullWidth = false,
    isDisabled = false,
    dataTestId,
    as = "a",
    href,
    onClick,
    tabIndex,
    ...rest
}: IUiLinkProps) {
    const className = b({ variant, flipUnderline, fullWidth, isDisabled });
    const ariaDisabled = isDisabled || undefined;
    const effectiveTabIndex = isDisabled ? -1 : tabIndex;

    if (as === "span") {
        return (
            <span
                {...rest}
                className={className}
                data-testid={dataTestId}
                aria-disabled={ariaDisabled}
                tabIndex={effectiveTabIndex}
            />
        );
    }

    const handleClick = isDisabled
        ? (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()
        : onClick;

    return (
        <a
            {...rest}
            className={className}
            data-testid={dataTestId}
            href={isDisabled ? undefined : href}
            onClick={handleClick}
            aria-disabled={ariaDisabled}
            tabIndex={effectiveTabIndex}
        />
    );
}
