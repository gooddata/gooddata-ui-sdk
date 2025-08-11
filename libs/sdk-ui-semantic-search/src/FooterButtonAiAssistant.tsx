// (C) 2025 GoodData Corporation

import * as React from "react";
import { UiButton } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";

/**
 * @public
 */
export interface FooterButtonAiAssistantProps {
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * @public
 */
export function FooterButtonAiAssistant({ onClick }: FooterButtonAiAssistantProps) {
    const intl = useIntl();

    return (
        <div className="gd-semantic-search__ai_assistant_button">
            <UiButton
                label={intl.formatMessage({ id: "semantic-search.ask.ai.assistant" })}
                variant="tertiary"
                iconBefore="genai2"
                onClick={onClick}
                accessibilityConfig={{
                    iconAriaHidden: true,
                }}
            />
        </div>
    );
}
