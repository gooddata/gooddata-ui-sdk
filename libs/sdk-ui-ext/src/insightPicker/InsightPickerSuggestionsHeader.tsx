// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";

export function InsightPickerSuggestionsHeader() {
    const intl = useIntl();

    return (
        <div className="gd-ui-ext-insight-picker-suggestions-header">
            <UiIcon type="genai" size={12} color="complementary-6" />
            <span>{intl.formatMessage(messages.suggestions)}</span>
        </div>
    );
}
