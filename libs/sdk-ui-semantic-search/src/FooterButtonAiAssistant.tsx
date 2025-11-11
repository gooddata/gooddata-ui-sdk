// (C) 2025 GoodData Corporation

import { MouseEvent } from "react";

import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import * as styles from "./FooterButtonAiAssistant.module.scss.js";

/**
 * @public
 */
export interface FooterButtonAiAssistantProps {
    onClick?: (e: MouseEvent) => void;
}

/**
 * @public
 */
export function FooterButtonAiAssistant({ onClick }: FooterButtonAiAssistantProps) {
    const intl = useIntl();

    return (
        <div className={styles.aiAssistantButton}>
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
