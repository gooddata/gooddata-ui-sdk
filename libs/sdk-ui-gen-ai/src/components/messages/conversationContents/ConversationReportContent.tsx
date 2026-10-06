// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { type IReportDefinition, type ObjRef, isIdentifierRef } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem } from "../../../model.js";
import {
    ambientContextSelector,
    isPreviewSelector,
    settingsSelector,
} from "../../../store/chatWindow/chatWindowSelectors.js";
import { conversationSelector } from "../../../store/messages/messagesSelectors.js";
import { formatReportPeriod, getReportItemUrl } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";

export type ConversationReportContentProps = {
    message: IChatConversationLocalItem;
    report: IReportDefinition | null;
    saved?: string | null;
    baseReportId?: string | null;
    refines?: string | null;
    className?: string;
};

function isOpenReport(openRef: ObjRef | undefined, reportId: string | null | undefined) {
    return isIdentifierRef(openRef) && openRef.identifier === reportId;
}

export function ConversationReportContent({
    message,
    report,
    saved,
    baseReportId,
    refines,
    className,
}: ConversationReportContentProps) {
    const intl = useIntl();
    const config = useConfig();
    const workspaceId = useWorkspaceStrict();
    const conversationId = useSelector(conversationSelector)?.id;
    const isReportsAppEnabled = Boolean(useSelector(settingsSelector)?.enableBusinessBriefingReportsApp);
    const isPreview = useSelector(isPreviewSelector);
    const openReport = useSelector(ambientContextSelector)?.view?.report;

    if (!isReportsAppEnabled || isPreview) {
        return null;
    }

    if (!report) {
        return (
            <div className="gd-gen-ai-chat__conversation__item__content--error">
                {intl.formatMessage({ id: "gd.gen-ai.report.unavailable" })}
            </div>
        );
    }

    const itemUrl = getReportItemUrl({
        workspaceId,
        saved,
        baseReportId,
        conversationId,
        itemId: message.id,
    });
    const targetReportId = saved || baseReportId;
    const isForOpenReport = Boolean(targetReportId) && isOpenReport(openReport?.ref, targetReportId);
    const isForOpenDraft = !targetReportId && Boolean(refines) && openReport?.draftRef === refines;
    const isChangeToOpenReport = isForOpenReport || isForOpenDraft;
    const buttonLabel = isChangeToOpenReport
        ? intl.formatMessage({ id: "gd.gen-ai.report.apply" })
        : intl.formatMessage({ id: "gd.gen-ai.report.open-report" });

    const handleOpen = itemUrl
        ? (e: MouseEvent | KeyboardEvent) => {
              if (config.allowNativeLinks) {
                  window.location.href = itemUrl;
                  return;
              }
              config.linkHandler?.({
                  type: "report",
                  id: saved ?? message.id,
                  workspaceId,
                  newTab: e.metaKey,
                  preventDefault: e.preventDefault.bind(e),
                  itemUrl,
                  action: "open",
              });
          }
        : undefined;

    const period = formatReportPeriod(report.periodStart, report.periodEnd, intl);
    const count = report.content.pages.length;
    const details = period
        ? intl.formatMessage({ id: "gd.gen-ai.report.details" }, { period, count })
        : intl.formatMessage({ id: "gd.gen-ai.report.page-count" }, { count });

    return (
        <div
            className={cx(
                "gd-gen-ai-chat__conversation__item__content",
                "gd-gen-ai-chat__conversation__item__content--report",
                className,
            )}
        >
            <div className="gd-gen-ai-chat__conversation__item__content-report-frame">
                <div className="gd-gen-ai-chat__conversation__item__content-report-icon">
                    <UiIcon
                        type="file"
                        size={14}
                        color="complementary-6"
                        backgroundSize={26}
                        backgroundColor="complementary-2"
                    />
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-report-content">
                    <div className="gd-gen-ai-chat__conversation__item__content-report-content-title">
                        {report.title}
                    </div>
                    <div className="gd-gen-ai-chat__conversation__item__content-report-content-details">
                        {details}
                    </div>
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-report-item-buttons">
                    <UiButton
                        label={buttonLabel}
                        variant="secondary"
                        isDisabled={!handleOpen}
                        onClick={handleOpen}
                    />
                </div>
            </div>
        </div>
    );
}
