// (C) 2026 GoodData Corporation

import { type FC, useCallback } from "react";

import { useIntl } from "react-intl";
import { connect, useSelector } from "react-redux";

import { UiChip } from "@gooddata/sdk-ui-kit";

import { collectContextReferences } from "../context/collectContextReferences.js";
import { userContextSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { removeContextReferenceAction } from "../store/chatWindow/chatWindowSlice.js";
import { type IGenAIContextObject } from "../types.js";

import { getIconByType } from "./utils/icons.js";

type GenAIChatContextIndicatorOwnProps = {
    onDelete?: () => void;
};

type GenAIChatContextIndicatorDispatchProps = {
    removeContextReference: typeof removeContextReferenceAction;
};

/**
 * Shows what ambient context the assistant is answering about — the open dashboard and its live
 * filters (e.g. "Answering about: Revenue Dashboard · Region: Europe · Q1 2026"). Renders nothing
 * when no ambient dashboard context is present. Re-renders whenever the host re-syncs the context,
 * so filter changes on the dashboard are reflected immediately.
 *
 * @internal
 */
function GenAIChatContextIndicatorCore({
    removeContextReference,
    onDelete,
}: GenAIChatContextIndicatorDispatchProps & GenAIChatContextIndicatorOwnProps) {
    const intl = useIntl();
    const emptyReferenceLabel = intl.formatMessage({ id: "gd.gen-ai.context.untitled" });

    const context = useSelector(userContextSelector);
    const references = collectContextReferences(context, emptyReferenceLabel);

    const onDeleteHandler = useCallback(
        (reference: IGenAIContextObject) => {
            return () => {
                removeContextReference({ object: reference });
                onDelete?.();
            };
        },
        [removeContextReference, onDelete],
    );

    if (references.length === 0) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__context-indicator" aria-live="polite">
            {references.map((reference, index) => (
                <UiChip
                    key={index}
                    isDisabled
                    isDeletable
                    {...getIconByType(reference.type)}
                    label={reference.title}
                    isExpandable={false}
                    onDelete={onDeleteHandler(reference)}
                />
            ))}
        </div>
    );
}

const mapDispatchToProps = {
    removeContextReference: removeContextReferenceAction,
};

export const GenAIChatContextIndicator: FC<GenAIChatContextIndicatorOwnProps> = connect(
    null,
    mapDispatchToProps,
)(GenAIChatContextIndicatorCore);
