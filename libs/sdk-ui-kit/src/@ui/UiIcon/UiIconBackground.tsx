// (C) 2024-2025 GoodData Corporation

import { ReactNode } from "react";

import { ThemeColor } from "@gooddata/sdk-model";

import { b } from "./iconBackgroundBem.js";
import { BackgroundShape, BackgroundType } from "../@types/background.js";

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
