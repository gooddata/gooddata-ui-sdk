// (C) 2023-2024 GoodData Corporation

import React from "react";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Icon, withBubble } from "@gooddata/sdk-ui-kit";

interface IColoredIconProps {
    width?: number;
    height?: number;
}

const ColoredIcon: React.FC<IColoredIconProps> = ({ width, height }) => {
    const theme = useTheme();
    return (
        <Icon.QuestionMark
            color={theme?.palette?.complementary?.c7 ?? "#B0BECA"}
            width={width}
            height={height}
        />
    );
};

export const QuestionMarkIcon = withBubble(ColoredIcon);
