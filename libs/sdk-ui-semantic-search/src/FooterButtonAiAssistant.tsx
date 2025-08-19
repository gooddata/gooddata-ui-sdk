// (C) 2025 GoodData Corporation

import React from "react";

import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

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
