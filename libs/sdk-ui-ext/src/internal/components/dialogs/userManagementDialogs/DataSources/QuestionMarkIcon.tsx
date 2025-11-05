// (C) 2023-2025 GoodData Corporation

import { IconQuestionMark, withBubble } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

function ColoredIcon() {
    const theme = useTheme();

    return <IconQuestionMark color={theme?.palette?.complementary?.c7 ?? "#B0BECA"} />;
}

export const QuestionMarkIcon = withBubble(ColoredIcon);
