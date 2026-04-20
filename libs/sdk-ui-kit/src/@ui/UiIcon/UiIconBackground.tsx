// (C) 2024-2026 GoodData Corporation

import { type ReactNode } from "react";

import { type ThemeColor } from "@gooddata/sdk-model";

import { type BackgroundShape, type BackgroundType } from "../@types/background.js";
import { b } from "./iconBackgroundBem.js";

export function UiIconBackground({
    children,
    size,
    color,
    type = "fill",
    shape = "circle",
}: {
    children: ReactNode;
    size?: number;
    color?: ThemeColor;
    type?: BackgroundType;
    shape?: BackgroundShape;
}) {
    return size ? (
        <div
            className={b({ color: color ?? false, type, shape })}
            style={{
                width: size,
                height: size,
            }}
        >
            {children}
        </div>
    ) : (
        children
    );
}
