// (C) 2026 GoodData Corporation

import { type FC, useCallback } from "react";

import { connect, useSelector } from "react-redux";

import { UiChip } from "@gooddata/sdk-ui-kit";

import { collectContextReferences } from "../context/collectContextReferences.js";
import { effectiveContextSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { removeAmbientUserContextAction } from "../store/chatWindow/chatWindowSlice.js";

import { getIconByType } from "./utils/icons.js";

type GenAIChatContextIndicatorOwnProps = {
    onDelete?: () => void;
};

type GenAIChatContextIndicatorDispatchProps = {
    removeAmbientUserContext: typeof removeAmbientUserContextAction;
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
    removeAmbientUserContext,
    onDelete,
}: GenAIChatContextIndicatorDispatchProps & GenAIChatContextIndicatorOwnProps) {
    const { ambient } = useSelector(effectiveContextSelector);
    const ambientReferences = collectContextReferences(ambient, "ambient");

    const onAmbientDelete = useCallback(() => {
        return () => {
            removeAmbientUserContext();
            onDelete?.();
        };
    }, [removeAmbientUserContext, onDelete]);

    if (ambientReferences.length === 0) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__context-indicator" aria-live="polite">
            {ambientReferences.map((reference, index) => (
                <UiChip
                    key={index}
                    {...getIconByType(reference.type)}
                    label={reference.title}
                    isExpandable={false}
                    isDeletable
                    onDelete={onAmbientDelete()}
                />
            ))}
        </div>
    );
}

const mapDispatchToProps = {
    removeAmbientUserContext: removeAmbientUserContextAction,
};

export const GenAIChatContextIndicator: FC<GenAIChatContextIndicatorOwnProps> = connect(
    null,
    mapDispatchToProps,
)(GenAIChatContextIndicatorCore);
