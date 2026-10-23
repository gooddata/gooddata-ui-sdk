// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem } from "../../../model.js";
import {
    type PublisherDocumentPart,
    publisherDocumentFormatOf,
    publisherDocumentPartFormat,
    summarizePublisherDocument,
} from "../../../publisherDocumentPart.js";
import { isPreviewSelector, settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { conversationSelector } from "../../../store/messages/messagesSelectors.js";
import { formatPublisherDocumentPeriod, getPublisherDocumentItemUrl } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";

export type ConversationPublisherDocumentContentProps = {
    message: IChatConversationLocalItem;
    part: PublisherDocumentPart;
    className?: string;
};

export function ConversationPublisherDocumentContent({
    message,
    part,
    className,
}: ConversationPublisherDocumentContentProps) {
    const intl = useIntl();
    const config = useConfig();
    const workspaceId = useWorkspaceStrict();
    const conversationId = useSelector(conversationSelector)?.id;
    const settings = useSelector(settingsSelector);
    const isPreview = useSelector(isPreviewSelector);

    if (!settings?.enableBusinessBriefingReportsApp || isPreview) {
        return null;
    }

    // gen-ai answers a draft that no longer resolves with an empty report part, whatever its version.
    const summary = summarizePublisherDocument(part);
    if (!summary) {
        return (
            <div className="gd-gen-ai-chat__conversation__item__content--error">
                {intl.formatMessage({ id: "gd.gen-ai.publisherDocument.unavailable" })}
            </div>
        );
    }
    const format = publisherDocumentPartFormat(part);
    if (format !== publisherDocumentFormatOf(settings)) {
        return (
            <div className="gd-gen-ai-chat__conversation__item__content--error">
                {format === "aac-v1"
                    ? intl.formatMessage({ id: "gd.gen-ai.publisherDocument.previousVersion" })
                    : intl.formatMessage({ id: "gd.gen-ai.publisherDocument.newerVersion" })}
            </div>
        );
    }

    const { saved, baseDocumentId } = part;

    // The Publisher app needs workspace manage; a user who has lost it gets a disabled Open button.
    const itemUrl = config.canManage
        ? getPublisherDocumentItemUrl({
              workspaceId,
              saved,
              baseDocumentId,
              conversationId,
              itemId: message.id,
              format,
          })
        : undefined;
    // The card only opens the version: a change to the document in the editor is applied there by the editor.
    const buttonLabel = intl.formatMessage({ id: "gd.gen-ai.publisherDocument.open" });

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
                  conversationId,
              });
          }
        : undefined;

    const period =
        summary.period && formatPublisherDocumentPeriod(summary.period.from, summary.period.to, intl);
    const count = summary.pageCount;
    const details = period
        ? intl.formatMessage({ id: "gd.gen-ai.publisherDocument.details" }, { period, count })
        : intl.formatMessage({ id: "gd.gen-ai.publisherDocument.page-count" }, { count });

    return (
        <div
            className={cx(
                "gd-gen-ai-chat__conversation__item__content",
                "gd-gen-ai-chat__conversation__item__content--publisherDocument",
                className,
            )}
        >
            <div className="gd-gen-ai-chat__conversation__item__content-publisherDocument-frame">
                <div className="gd-gen-ai-chat__conversation__item__content-publisherDocument-icon">
                    <UiIcon
                        type="file"
                        size={14}
                        color="complementary-6"
                        backgroundSize={26}
                        backgroundColor="complementary-2"
                    />
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-publisherDocument-content">
                    <div className="gd-gen-ai-chat__conversation__item__content-publisherDocument-content-title">
                        {summary.title}
                    </div>
                    <div className="gd-gen-ai-chat__conversation__item__content-publisherDocument-content-details">
                        {details}
                    </div>
                </div>
                <div className="gd-gen-ai-chat__conversation__item__content-publisherDocument-item-buttons">
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
