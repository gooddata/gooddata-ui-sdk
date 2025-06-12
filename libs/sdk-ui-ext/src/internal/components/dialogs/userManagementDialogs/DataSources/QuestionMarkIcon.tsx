// (C) 2023-2024 GoodData Corporation

import React from "react";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Icon, withBubble } from "@gooddata/sdk-ui-kit";

const ColoredIcon: React.FC = () => {
    const theme = useTheme();
    return <Icon.QuestionMark color={theme?.palette?.complementary?.c7 ?? "#B0BECA"} />;
};

export const QuestionMarkIcon = withBubble(ColoredIcon);
