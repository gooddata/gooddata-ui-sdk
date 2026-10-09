// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { type IPublisherDocumentDefinition } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";

import type { IChatConversationLocalItem } from "../../../model.js";
import { isPreviewSelector, settingsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { conversationSelector } from "../../../store/messages/messagesSelectors.js";
import { formatPublisherDocumentPeriod, getPublisherDocumentItemUrl } from "../../../utils.js";
import { useConfig } from "../../ConfigContext.js";

export type ConversationPublisherDocumentContentProps = {
    message: IChatConversationLocalItem;
    publisherDocument: IPublisherDocumentDefinition | null;
    saved?: string | null;
    baseDocumentId?: string | null;
    className?: string;
};

export function ConversationPublisherDocumentContent({
    message,
    publisherDocument,
    saved,
    baseDocumentId,
    className,
}: ConversationPublisherDocumentContentProps) {
    const intl = useIntl();
    const config = useConfig();
    const workspaceId = useWorkspaceStrict();
    const conversationId = useSelector(conversationSelector)?.id;
    const isPublisherAppEnabled = Boolean(useSelector(settingsSelector)?.enableBusinessBriefingReportsApp);
    const isPreview = useSelector(isPreviewSelector);

    if (!isPublisherAppEnabled || isPreview) {
        return null;
    }

    if (!publisherDocument) {
        return (
            <div className="gd-gen-ai-chat__conversation__item__content--error">
                {intl.formatMessage({ id: "gd.gen-ai.publisherDocument.unavailable" })}
            </div>
        );
    }

    const itemUrl = getPublisherDocumentItemUrl({
        workspaceId,
        saved,
        baseDocumentId,
        conversationId,
        itemId: message.id,
    });
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

    const period = formatPublisherDocumentPeriod(
        publisherDocument.periodStart,
        publisherDocument.periodEnd,
        intl,
    );
    const count = publisherDocument.content.pages.length;
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
                        {publisherDocument.title}
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
