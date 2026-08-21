// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { UiChip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { collectContextReferences } from "../context/collectContextReferences.js";
import { contextSetupEnabledSelector, userContextSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { removeContextReferenceAction } from "../store/chatWindow/chatWindowSlice.js";
import { type IGenAIContextObject } from "../types.js";

import { useContextChangeAnnouncement } from "./hooks/useContextChangeAnnouncement.js";
import { getIconByObject, getTypeLabel } from "./utils/icons.js";

const msgs = defineMessages({
    untitled: {
        id: "gd.gen-ai.context.untitled",
    },
    remove: {
        id: "gd.gen-ai.context.remove_context",
    },
    groupLabel: {
        id: "gd.gen-ai.context.group.ariaLabel",
    },
});

type GenAIChatContextIndicatorOwnProps = {
    onDelete?: () => void;
};

/**
 * Shows what ambient context the assistant is answering about — the open dashboard and its live
 * filters (e.g. "Answering about: Revenue Dashboard · Region: Europe · Q1 2026"). Renders nothing
 * when no ambient dashboard context is present. Re-renders whenever the host re-syncs the context,
 * so filter changes on the dashboard are reflected immediately.
 *
 * @internal
 */
export function GenAIChatContextIndicator({ onDelete }: GenAIChatContextIndicatorOwnProps) {
    const intl = useIntl();
    const emptyReferenceLabel = intl.formatMessage(msgs.untitled);
    const groupLabelId = useIdPrefixed("context-indicator-label");

    const isContextSetupEnabled = useSelector(contextSetupEnabledSelector);
    const context = useSelector(userContextSelector);
    const references = useMemo(
        () => collectContextReferences(context, emptyReferenceLabel),
        [context, emptyReferenceLabel],
    );

    const dispatch = useDispatch();
    const removeContextReference = useCallback(
        (payload: { object: IGenAIContextObject }) => dispatch(removeContextReferenceAction(payload)),
        [dispatch],
    );

    const onDeleteHandler = useCallback(
        (reference: IGenAIContextObject) => {
            return () => {
                removeContextReference({ object: reference });
                onDelete?.();
            };
        },
        [removeContextReference, onDelete],
    );

    const announcement = useContextChangeAnnouncement(references);

    if (!isContextSetupEnabled) {
        return null;
    }

    return (
        <>
            {references.length > 0 ? (
                <>
                    <span className="sr-only" id={groupLabelId}>
                        {intl.formatMessage(msgs.groupLabel)}
                    </span>
                    <div
                        className="gd-gen-ai-chat__context-indicator"
                        role="group"
                        aria-labelledby={groupLabelId}
                    >
                        {references.map((reference, index) => (
                            <UiChip
                                key={index}
                                isDisabled
                                isDeletable
                                {...getIconByObject(reference)}
                                label={reference.title}
                                isExpandable={false}
                                onDelete={onDeleteHandler(reference)}
                                accessibilityConfig={{
                                    deleteAriaLabel: intl.formatMessage(msgs.remove, {
                                        title: reference.title,
                                    }),
                                    iconBeforeAriaLabel: getTypeLabel(reference.type, intl),
                                }}
                            />
                        ))}
                    </div>
                </>
            ) : null}
            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {announcement}
            </span>
        </>
    );
}
