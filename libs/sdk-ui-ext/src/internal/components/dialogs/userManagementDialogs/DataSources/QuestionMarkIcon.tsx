// (C) 2023-2025 GoodData Corporation

import React from "react";

import { Icon, withBubble } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const ColoredIcon: React.FC = () => {
    const theme = useTheme();
    return <Icon.QuestionMark color={theme?.palette?.complementary?.c7 ?? "#B0BECA"} />;
};

export const QuestionMarkIcon = withBubble(ColoredIcon);
