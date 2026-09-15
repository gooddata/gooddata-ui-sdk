// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface IUiToolbarColorSwatchProps {
    /**
     * "fill" paints the whole chip. "text" shows a glyph with the colour as a bar beneath it.
     * @defaultValue "fill"
     */
    variant?: "fill" | "text";
    /**
     * Any CSS colour.
     */
    color?: string;
    /**
     * Outline for colours too pale to read against the toolbar.
     * @defaultValue false
     */
    hasBorder?: boolean;
    /**
     * No colour is set. Applies to the "fill" variant only.
     * @defaultValue false
     */
    isTransparent?: boolean;
    /**
     * Glyph of the "text" variant.
     * @defaultValue "A"
     */
    glyph?: ReactNode;
}

const { b, e } = bem("gd-ui-kit-toolbar-color-swatch");

/**
 * 20x20 preview of the colour a toolbar control is set to. Decorative: the owning control carries
 * the accessible name.
 *
 * @internal
 */
export function UiToolbarColorSwatch({
    variant = "fill",
    color,
    hasBorder = false,
    isTransparent = false,
    glyph = "A",
}: IUiToolbarColorSwatchProps) {
    const isTransparentFill = variant === "fill" && isTransparent;

    return (
        <span className={b({ variant, hasBorder, isTransparent: isTransparentFill })} aria-hidden>
            {variant === "fill" ? (
                <span
                    className={e("fill")}
                    style={{ backgroundColor: isTransparentFill ? undefined : color }}
                >
                    {isTransparentFill ? <span className={e("transparent")} /> : null}
                </span>
            ) : (
                <>
                    <span className={e("glyph")}>{glyph}</span>
                    <span className={e("bar")} style={{ backgroundColor: color }} />
                </>
            )}
        </span>
    );
}
