// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject, IAutomationStatus } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, UiIcon, UiIconButton, useToastMessage } from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { AUTOMATION_ICON_CONFIGS } from "../constants.js";
import { formatCellValue } from "../format.js";
import { messages } from "../messages.js";
import { AutomationsType } from "../types.js";

const { b, e } = bem("gd-ui-ext-automation-icon-tooltip");

export function AutomationIcon({
    type,
    automation,
}: {
    type: AutomationsType | IAutomationStatus;
    automation?: IAutomationMetadataObject;
}) {
    if (!type) {
        return null;
    }

    const props = AUTOMATION_ICON_CONFIGS[type];

    return type === "FAILED" ? (
        <BubbleHoverTrigger hideDelay={300} eventsOnBubble={true}>
            <UiIcon {...props} layout="block" />
            <Bubble
                className="bubble-light"
                alignPoints={[{ align: "bc tc" }]}
                arrowStyle={{ display: "none" }}
            >
                <AutomationIconTooltipContent automation={automation} />
            </Bubble>
        </BubbleHoverTrigger>
    ) : (
        <UiIcon {...props} />
    );
}

function AutomationIconTooltipContent({ automation }: { automation: IAutomationMetadataObject }) {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();
    const traceId = automation?.lastRun?.traceId;
    const status = automation?.lastRun?.errorMessage;

    const headerText = useMemo(() => {
        if (!automation) {
            return "";
        }
        if (automation.schedule) {
            return intl.formatMessage(messages.automationIconTooltipHeaderSchedule);
        }
        return intl.formatMessage(messages.automationIconTooltipHeaderAlert);
    }, [automation, intl]);

    const onCopyTraceId = useCallback(() => {
        navigator.clipboard.writeText(traceId);
        addSuccess(messages.messageAutomationIconTooltipTraceIdCopied);
    }, [traceId, addSuccess]);

    return (
        <div className={b()}>
            <div className={e("header")}>{headerText}</div>
            <div>
                <div className={e("sub-header")}>
                    {intl.formatMessage(messages.automationIconTooltipStatus).toUpperCase()}
                </div>
                {status ? <div className={e("content")}>{formatCellValue(status)}</div> : null}
            </div>
            <div>
                <div className={e("sub-header")}>
                    {intl.formatMessage(messages.automationIconTooltipTraceId).toUpperCase()}
                </div>
                {traceId ? (
                    <div className={e("content")}>
                        <div className={e("trace-id")}>{formatCellValue(traceId)}</div>
                        <div className={e("icon-button")}>
                            <UiIconButton
                                icon="copy"
                                size="xsmall"
                                variant="tertiary"
                                onClick={onCopyTraceId}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
