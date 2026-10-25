// (C) 2023-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { FormattedMessage, defineMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, IconCopy } from "@gooddata/sdk-ui-kit";

import { type IShowAddMessagePayload } from "../../actions/messages_actions.js";

interface ITraceIdMessageProps {
    traceId: string;
    canManageProject: boolean;
    showToastMessage: (payload: IShowAddMessagePayload) => void;
}

const ERROR_MESSAGE_TOOLTIP_ALIGN_POINTS = [{ align: "tc bc" }];
const COPY_ICON_TOOLTIP_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 5, y: 0 } }];

export function TraceIdMessage({ traceId, canManageProject, showToastMessage }: ITraceIdMessageProps) {
    const copyTraceId = useCallback(
        () =>
            navigator.clipboard.writeText(traceId).then(() =>
                showToastMessage({
                    translationKey: defineMessage({
                        id: "dashboard.message.invalid_configuration.trace_id_message.copy_to_clipboard.success",
                    }).id,
                    type: "success",
                    durationInMs: 3000,
                }),
            ),
        [traceId, showToastMessage],
    );

    const traceIdTooltipKey = useMemo(() => {
        return canManageProject
            ? defineMessage({ id: "dashboard.message.invalid_configuration.trace_id_message.tooltip.manage" })
                  .id
            : defineMessage({
                  id: "dashboard.message.invalid_configuration.trace_id_message.tooltip.analyze",
              }).id;
    }, [canManageProject]);

    return (
        <div className="report-error-trace-id s-report-error-trace-id">
            <FormattedMessage
                id="dashboard.message.invalid_configuration.trace_id_message"
                values={{
                    span: (chunk) => (
                        <BubbleHoverTrigger hideDelay={0} showDelay={0}>
                            <span className="report-error-trace-id-title">{chunk}</span>
                            <Bubble
                                className="bubble-primary trace-id-title-bubble"
                                alignPoints={ERROR_MESSAGE_TOOLTIP_ALIGN_POINTS}
                            >
                                <FormattedMessage id={traceIdTooltipKey} />
                            </Bubble>
                        </BubbleHoverTrigger>
                    ),
                    traceId: (
                        <BubbleHoverTrigger hideDelay={0} showDelay={0}>
                            <span
                                className="report-error-trace-id-data s-report-error-trace-id-data"
                                onClick={copyTraceId}
                            >
                                {traceId}
                                <IconCopy className="adi-catalog-identifier-icon" width={14} height={14} />
                            </span>
                            <Bubble className="bubble-primary" alignPoints={COPY_ICON_TOOLTIP_ALIGN_POINTS}>
                                <FormattedMessage id="dashboard.message.invalid_configuration.trace_id_message.copy_icon.tooltip" />
                            </Bubble>
                        </BubbleHoverTrigger>
                    ),
                }}
            />
        </div>
    );
}
