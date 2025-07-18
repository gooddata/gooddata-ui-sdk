// (C) 2023-2025 GoodData Corporation

import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Icon, withBubble } from "@gooddata/sdk-ui-kit";

function ColoredIcon() {
    const theme = useTheme();
    return <Icon.QuestionMark color={theme?.palette?.complementary?.c7 ?? "#B0BECA"} />;
}

export const QuestionMarkIcon = withBubble(ColoredIcon);
