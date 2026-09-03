// (C) 2026 GoodData Corporation

import { type ReactNode, useCallback, useMemo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Dropdown, UiChip, UiSkeleton, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { collectContextReferences } from "../context/collectContextReferences.js";
import {
    ambientContextLoadingSelector,
    ambientContextSelector,
    contextSetupEnabledSelector,
    selectedContextSelector,
    userContextSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import {
    removeContextReferenceAction,
    selectedContextReferencesAction,
} from "../store/chatWindow/chatWindowSlice.js";
import { type IGenAIContextObject, type SelectedContext } from "../types.js";

import { GenAiChatContextChooserBody } from "./GenAiChatContextChooserBody.js";
import { useContextChangeAnnouncement } from "./hooks/useContextChangeAnnouncement.js";
import { useAmbientContextItems } from "./hooks/useContextItems.js";
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
    focusOn: {
        id: "gd.gen-ai.context.focus_on",
    },
});

type GenAIChatContextIndicatorOwnProps = {
    onUpdate?: () => void;
};

/**
 * Shows what ambient context the assistant is answering about — the open dashboard and its live
 * filters (e.g. "Answering about: Revenue Dashboard · Region: Europe · Q1 2026"). Renders nothing
 * when no ambient dashboard context is present. Re-renders whenever the host re-syncs the context,
 * so filter changes on the dashboard are reflected immediately.
 *
 * @internal
 */
export function GenAIChatContextIndicator({ onUpdate }: GenAIChatContextIndicatorOwnProps) {
    const intl = useIntl();
    const emptyReferenceLabel = intl.formatMessage(msgs.untitled);
    const groupLabelId = useIdPrefixed("context-indicator-label");

    const isContextSetupEnabled = useSelector(contextSetupEnabledSelector);
    const ambientContext = useSelector(ambientContextSelector);
    const ambientLoading = useSelector(ambientContextLoadingSelector);
    const userContext = useSelector(userContextSelector);
    const selectedContext = useSelector(selectedContextSelector);
    const { items, search, setSearch, selectedIds } = useAmbientContextItems(ambientContext);

    const addContextLabel = intl.formatMessage(msgs.focusOn);
    const titleId = useIdPrefixed("context-focuson-title");

    const references = useMemo(
        () => collectContextReferences(userContext, selectedContext, emptyReferenceLabel),
        [userContext, selectedContext, emptyReferenceLabel],
    );

    const dispatch = useDispatch();
    const removeContextReference = useCallback(
        (payload: { object: IGenAIContextObject }) => dispatch(removeContextReferenceAction(payload)),
        [dispatch],
    );

    const onAmbientToggleHandler = useCallback(() => {
        return () => {
            dispatch(
                selectedContextReferencesAction({
                    ...selectedContext,
                    activated: !selectedContext?.activated,
                }),
            );
            onUpdate?.();
        };
    }, [dispatch, onUpdate, selectedContext]);

    const onDeleteHandler = useCallback(
        (reference: IGenAIContextObject) => {
            return () => {
                removeContextReference({ object: reference });
                onUpdate?.();
            };
        },
        [removeContextReference, onUpdate],
    );

    const onOpenStateChanged = useCallback(() => {
        setSearch("");
    }, [setSearch]);

    const announcement = useContextChangeAnnouncement(selectedContext, references);

    if (!isContextSetupEnabled) {
        return null;
    }

    return (
        <>
            <ContextWrapper groupLabel={msgs.groupLabel} groupLabelId={groupLabelId}>
                {selectedContext?.dashboard || ambientLoading ? (
                    <Dropdown
                        alignPoints={[{ align: "tl bl", offset: { x: 0, y: 0 } }]}
                        closeOnEscape
                        fullscreenOnMobile={false}
                        autofocusOnOpen
                        accessibilityConfig={{ popupRole: "dialog" }}
                        onOpenStateChanged={onOpenStateChanged}
                        renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => {
                            if (ambientLoading) {
                                return (
                                    <UiSkeleton
                                        inline
                                        itemWidth={150}
                                        itemPadding={0}
                                        itemHeight={27}
                                        itemBorderRadius={50}
                                    />
                                );
                            }

                            const item = selectedContext?.visualization ?? selectedContext?.dashboard;
                            if (!item || !selectedContext) {
                                return null;
                            }

                            return (
                                <UiChip
                                    isActionable
                                    isExpandable
                                    isActive={isOpen}
                                    {...getIconByObject(item)}
                                    label={getSelectedTitle(selectedContext, emptyReferenceLabel)}
                                    iconAction={selectedContext.activated ? "visible" : "invisible"}
                                    variant={selectedContext.activated ? "normal" : "inactive"}
                                    onClick={toggleDropdown}
                                    onAction={onAmbientToggleHandler()}
                                    accessibilityConfig={{
                                        ...accessibilityConfig,
                                        deleteAriaLabel: intl.formatMessage(msgs.remove, {
                                            title: getSelectedTitle(selectedContext, emptyReferenceLabel),
                                        }),
                                        iconBeforeAriaLabel: getTypeLabel(item.type, intl),
                                    }}
                                />
                            );
                        }}
                        renderBody={({ closeDropdown, ariaAttributes }) => (
                            <GenAiChatContextChooserBody
                                inputItems={items}
                                selectedIds={selectedIds}
                                title={addContextLabel}
                                titleId={titleId}
                                search={search}
                                onSearchChange={setSearch}
                                ariaAttributes={ariaAttributes}
                                closeDropdown={closeDropdown}
                                onSelect={(item) => {
                                    dispatch(
                                        selectedContextReferencesAction({
                                            ...selectedContext,
                                            ...(item.type === "dashboard"
                                                ? {
                                                      dashboard: item,
                                                      visualization: undefined,
                                                  }
                                                : {}),
                                            ...(item.type === "visualization" || item.type === "widget"
                                                ? {
                                                      visualization: item,
                                                  }
                                                : {}),
                                            activated: true,
                                        }),
                                    );
                                    onUpdate?.();
                                }}
                            />
                        )}
                    />
                ) : null}
                {references.length > 0
                    ? references.map((reference, index) => (
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
                      ))
                    : null}
            </ContextWrapper>
            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {announcement}
            </span>
        </>
    );
}

interface IContextWrapperProps {
    groupLabelId: string;
    groupLabel: MessageDescriptor;
    children: ReactNode;
}

function ContextWrapper({ groupLabel, groupLabelId, children }: IContextWrapperProps) {
    const intl = useIntl();

    return (
        <>
            <span className="sr-only" id={groupLabelId}>
                {intl.formatMessage(groupLabel)}
            </span>
            <div className="gd-gen-ai-chat__context-indicator" role="group" aria-labelledby={groupLabelId}>
                {children}
            </div>
        </>
    );
}

// utils

function getSelectedTitle(selectedContext: SelectedContext, emptyReferenceLabel: string) {
    const label = [
        ...(selectedContext.dashboard ? [selectedContext.dashboard.title || emptyReferenceLabel] : []),
        ...(selectedContext.visualization
            ? [selectedContext.visualization.title || emptyReferenceLabel]
            : []),
    ];

    return label.join(" / ");
}
