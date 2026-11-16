// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IGenAIAssistantSendButtonProps } from "./types.js";

const msgs = defineMessages({
    send: {
        id: "gd.gen-ai.button.send",
    },
});

/**
 * Default implementation of the SendButton slot.
 * @public
 */
export function DefaultSendButton({ isDisabled, onClick }: IGenAIAssistantSendButtonProps) {
    const intl = useIntl();
    const sendLabel = intl.formatMessage(msgs.send);

    return (
        <UiTooltip
            triggerBy={["focus", "hover"]}
            arrowPlacement="bottom"
            anchor={
                <UiIconButton
                    icon="arrowUp"
                    variant="primary"
                    size="small"
                    dataTestId="send_message"
                    isDisabled={isDisabled}
                    onClick={isDisabled ? undefined : onClick}
                    accessibilityConfig={{
                        ariaLabel: sendLabel,
                    }}
                />
            }
            content={sendLabel}
        />
    );
}
