// (C) 2024-2025 GoodData Corporation

import { type ReactNode } from "react";

import { type ThemeColor } from "@gooddata/sdk-model";

import { b } from "./iconBackgroundBem.js";
import { type BackgroundShape, type BackgroundType } from "../@types/background.js";

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
