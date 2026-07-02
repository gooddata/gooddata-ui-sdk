// (C) 2026 GoodData Corporation

import { defineMessage, useIntl } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

const SUGGESTION_GROUP_TITLE = defineMessage({ id: "search_insights.similar" });

export const DIVIDER = { divider: true } as const;

export function InsightListDivider() {
    const intl = useIntl();

    return (
        <div className="gd-visualizations-related-header">
            <UiIcon type="genai" size={12} color="complementary-6" />
            <span>{intl.formatMessage(SUGGESTION_GROUP_TITLE)}</span>
        </div>
    );
}
