// (C) 2023-2025 GoodData Corporation

import React from "react";

import { Icon, withBubble } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

function ColoredIcon() {
    const theme = useTheme();

    const QuestionMarkIcon = Icon["QuestionMark"];

    return <QuestionMarkIcon color={theme?.palette?.complementary?.c7 ?? "#B0BECA"} />;
}

export const QuestionMarkIcon = withBubble(ColoredIcon);
