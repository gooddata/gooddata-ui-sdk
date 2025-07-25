// (C) 2024-2025 GoodData Corporation

import { ThemeColor } from "@gooddata/sdk-model";
import { b } from "./iconBackgroundBem.js";
import React from "react";
import { BackgroundShape, BackgroundType } from "../@types/background.js";

export const UiIconBackground = ({
    children,
    size,
    color,
    type = "fill",
    shape = "circle",
}: {
    children: React.ReactNode;
    size?: number;
    color?: ThemeColor;
    type?: BackgroundType;
    shape?: BackgroundShape;
}) => {
    return size ? (
        <div
            className={b({ color, type, shape })}
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
};
