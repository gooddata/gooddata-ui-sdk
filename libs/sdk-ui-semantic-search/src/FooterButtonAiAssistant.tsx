// (C) 2025 GoodData Corporation

import * as React from "react";
import { Icon } from "@gooddata/sdk-ui-kit";
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
        <button className="gd-semantic-search__ai_assistant_button" onClick={onClick}>
            <div className="gd-semantic-search__ai_assistant_button_content">
                <Icon.GenAI2 width={18} height={18} ariaHidden />
                <div className="gd-semantic-search__ai_assistant_button_text">
                    {intl.formatMessage({ id: "semantic-search.ask.ai.assistant" })}
                </div>
            </div>
        </button>
    );
}
