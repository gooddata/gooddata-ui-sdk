// (C) 2023-2025 GoodData Corporation

import React from "react";

import { Icon, withBubble } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

interface IColoredIconProps {
    width?: number;
    height?: number;
}

function ColoredIcon({ width, height }: IColoredIconProps) {
    const theme = useTheme();
    return (
        <Icon.QuestionMark
            color={theme?.palette?.complementary?.c7 ?? "#B0BECA"}
            width={width}
            height={height}
        />
    );
}

export const QuestionMarkIcon = withBubble(ColoredIcon);
