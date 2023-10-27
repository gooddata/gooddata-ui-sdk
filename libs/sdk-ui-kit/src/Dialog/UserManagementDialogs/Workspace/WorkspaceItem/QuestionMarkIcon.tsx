// (C) 2023 GoodData Corporation

import React from "react";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { withBubble } from "../../../../Bubble/index.js";
import { Icon } from "../../../../Icon/Icon.js";

const ColoredIcon: React.FC = () => {
    const theme = useTheme();
    return <Icon.QuestionMark color={theme?.palette?.complementary?.c7 ?? "#B0BECA"} />
}

export const QuestionMarkIcon = withBubble(ColoredIcon)

