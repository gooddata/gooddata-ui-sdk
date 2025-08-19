// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject, IAutomationStatus } from "@gooddata/sdk-model";
import { UiIcon, UiIconButton, UiTooltip, useToastMessage } from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { AUTOMATION_ICON_CONFIGS } from "../constants.js";
import { formatCellValue } from "../format.js";
import { messages } from "../messages.js";
import { AutomationsType } from "../types.js";

const { b, e } = bem("gd-ui-ext-automation-icon-tooltip");

export const AutomationIcon = ({
    type,
    automation,
}: {
    type: AutomationsType | IAutomationStatus;
    automation?: IAutomationMetadataObject;
}) => {
    if (!type) {
        return null;
    }

    const props = AUTOMATION_ICON_CONFIGS[type];

    return type === "FAILED" ? (
        <UiTooltip
            content={
                <AutomationIconTooltipContent
                    status={automation?.lastRun?.errorMessage}
                    traceId={automation?.lastRun?.traceId}
                />
            }
            triggerBy={["hover"]}
            anchor={<UiIcon layout="block" {...props} />}
        ></UiTooltip>
    ) : (
        <UiIcon {...props} />
    );
};

const AutomationIconTooltipContent = ({ status, traceId }: { status: string; traceId: string }) => {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();

    const onCopyTraceId = useCallback(() => {
        navigator.clipboard.writeText(traceId);
        addSuccess(messages.messageAutomationIconTooltipTraceIdCopied);
    }, [traceId, addSuccess]);

    return (
        <div className={b()}>
            <div className={e("header")}>{intl.formatMessage(messages.automationIconTooltipHeader)}</div>
            <div>
                <div className={e("sub-header")}>
                    {intl.formatMessage(messages.automationIconTooltipStatus).toUpperCase()}
                </div>
                <div className={e("content")}>{formatCellValue(status)}</div>
            </div>
            <div>
                <div className={e("sub-header")}>
                    {intl.formatMessage(messages.automationIconTooltipTraceId).toUpperCase()}
                </div>
                <div className={e("content")}>
                    {formatCellValue(traceId)}
                    <div className={e("icon-button")}>
                        <UiIconButton icon="copy" size="xsmall" variant="tertiary" onClick={onCopyTraceId} />
                    </div>
                </div>
            </div>
        </div>
    );
};
