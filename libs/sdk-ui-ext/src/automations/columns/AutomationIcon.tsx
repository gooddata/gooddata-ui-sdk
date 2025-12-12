// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { UiIcon, useToastMessage } from "@gooddata/sdk-ui-kit";

import { AutomationIconTooltip } from "./AutomationIconTooltip.js";
import { bem } from "../../notificationsPanel/bem.js";
import { AUTOMATION_ICON_CONFIGS } from "../constants.js";
import { formatAutomationSubtitle, formatCellValue } from "../format.js";
import { messages } from "../messages.js";
import { type IAutomationIconProps } from "../types.js";

const { e } = bem("gd-ui-ext-automation-icon-tooltip");

export function AutomationIcon({ type, automation, state, timezone }: IAutomationIconProps) {
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
                align="bc tc"
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
        const subtitle = formatCellValue(formatAutomationSubtitle(automation, intl));
        return (
            <AutomationIconTooltip
                header={formatCellValue(automation.title)}
                align="cr cl"
                sections={[
                    ...(automation.created
                        ? [
                              {
                                  header: intl.formatMessage(messages.automationIconTooltipStartsOn),
                                  content: (
                                      <TooltipStartsOnSection automation={automation} timezone={timezone} />
                                  ),
                              },
                          ]
                        : []),
                    {
                        header: intl.formatMessage(messages.automationIconTooltipRepeats),
                        content: subtitle,
                    },

                    ...(automation.recipients?.length
                        ? [
                              {
                                  header: intl.formatMessage(messages.columnRecipients),
                                  content: <TooltipRecipientsList automation={automation} />,
                              },
                          ]
                        : []),
                ]}
            >
                <UiIcon {...props} layout="block" />
            </AutomationIconTooltip>
        );
    }

    return <UiIcon {...props} ariaHidden />;
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

function TooltipStartsOnSection({
    automation,
    timezone,
}: {
    automation: IAutomationMetadataObject;
    timezone: string;
}) {
    const [date, time] = formatCellValue(automation.created, "date", timezone)?.split(" ") ?? [];

    return (
        <div className={e("starts-on")}>
            <span>{date}</span>
            <span>{`${time} ${timezone}`}</span>
        </div>
    );
}
