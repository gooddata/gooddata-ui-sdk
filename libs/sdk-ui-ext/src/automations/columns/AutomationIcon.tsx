// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IAutomationMetadataObject } from "node_modules/@gooddata/sdk-model/esm/automations/index.js";
import { useIntl } from "react-intl";

import { UiIcon, useToastMessage } from "@gooddata/sdk-ui-kit";

import { AutomationIconTooltip } from "./AutomationIconTooltip.js";
import { bem } from "../../notificationsPanel/bem.js";
import { AUTOMATION_ICON_CONFIGS } from "../constants.js";
import { formatAutomationSubtitle, formatCellValue } from "../format.js";
import { messages } from "../messages.js";
import { IAutomationIconProps } from "../types.js";

const { e } = bem("gd-ui-ext-automation-icon-tooltip");

export function AutomationIcon({ type, automation, state }: IAutomationIconProps) {
    const intl = useIntl();
    const { addSuccess } = useToastMessage();

    const failedHeaderText = useMemo(() => {
        if (!automation) {
            return "";
        }
        if (automation.schedule) {
            return intl.formatMessage(messages.automationIconTooltipHeaderSchedule);
        }
        return intl.formatMessage(messages.automationIconTooltipHeaderAlert);
    }, [automation, intl]);

    if (!type) {
        return null;
    }

    const props =
        state === "PAUSED" ? AUTOMATION_ICON_CONFIGS[`${type}${state}`] : AUTOMATION_ICON_CONFIGS[type];

    if (type === "FAILED") {
        const traceId = automation?.lastRun?.traceId;
        const status = automation?.lastRun?.errorMessage;

        const onCopyTraceId = () => {
            navigator.clipboard.writeText(traceId);
            addSuccess(messages.messageAutomationIconTooltipTraceIdCopied);
        };

        return (
            <AutomationIconTooltip
                header={failedHeaderText}
                sections={[
                    {
                        header: intl.formatMessage(messages.automationIconTooltipStatus),
                        content: formatCellValue(status),
                    },
                    {
                        header: intl.formatMessage(messages.automationIconTooltipTraceId),
                        content: formatCellValue(traceId),
                        icon: "copy",
                        onIconClick: onCopyTraceId,
                    },
                ]}
            >
                <UiIcon {...props} layout="block" />
            </AutomationIconTooltip>
        );
    }

    if (type === "automationDetails") {
        return (
            <AutomationIconTooltip
                header={formatCellValue(automation.title)}
                content={formatCellValue(formatAutomationSubtitle(automation, intl))}
                sections={
                    automation.recipients?.length
                        ? [
                              {
                                  header: intl.formatMessage(messages.columnRecipients),
                                  content: <TooltipRecipientsList automation={automation} />,
                              },
                          ]
                        : []
                }
            >
                <UiIcon {...props} layout="block" />
            </AutomationIconTooltip>
        );
    }

    return <UiIcon {...props} />;
}

function TooltipRecipientsList({ automation }: { automation: IAutomationMetadataObject }) {
    return (
        <div className={e("recipients-list")}>
            {automation.recipients?.map((recipient) => (
                <span className={e("recipient")} key={recipient.id}>
                    {recipient.name}
                </span>
            ))}
        </div>
    );
}
