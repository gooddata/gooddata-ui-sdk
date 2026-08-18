// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Dropdown, UiIconButton, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { ambientContextSelector, userContextSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { addContextReferenceAction, initContextObjectsAction } from "../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../store/types.js";
import { type IGenAIContextObject } from "../types.js";

import { GenAiChatContextChooserBody } from "./GenAiChatContextChooserBody.js";
import { useContextItems } from "./hooks/useContextItems.js";

const msgs = defineMessages({
    add: {
        id: "gd.gen-ai.context.add_context",
    },
});

type GenAiChatContextChooserOwnProps = {
    onAddContext?: (context: IGenAIContextObject) => void;
};

export function GenAiChatContextChooser({ onAddContext }: GenAiChatContextChooserOwnProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const titleId = useIdPrefixed("context-chooser-title");
    const ambient = useSelector((state: RootState) => ambientContextSelector(state));
    const active = useSelector((state: RootState) => userContextSelector(state));
    const { items: inputItems, isLoading, hasNextPage, loadNextPage } = useContextItems(ambient, active);
    const addContextLabel = intl.formatMessage(msgs.add);

    const onOpenStateChanged = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                dispatch(initContextObjectsAction());
            }
        },
        [dispatch],
    );

    if (!ambient) {
        return null;
    }

    return (
        <div className="gd-gen-ai-chat__input__context">
            <Dropdown
                alignPoints={[{ align: "tl bl", offset: { x: 0, y: 0 } }]}
                closeOnEscape
                fullscreenOnMobile={false}
                autofocusOnOpen
                accessibilityConfig={{}}
                onOpenStateChanged={onOpenStateChanged}
                renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => (
                    <UiIconButton
                        icon="plus"
                        variant="tertiary"
                        size="small"
                        dataTestId="choose_context"
                        isActive={isOpen}
                        accessibilityConfig={{
                            ...accessibilityConfig,
                            ariaLabel: addContextLabel,
                        }}
                        onClick={toggleDropdown}
                        isDisabled={!inputItems.length && !hasNextPage && !isLoading}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <GenAiChatContextChooserBody
                        inputItems={inputItems}
                        title={addContextLabel}
                        titleId={titleId}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        loadNextPage={loadNextPage}
                        ariaAttributes={ariaAttributes}
                        closeDropdown={closeDropdown}
                        onSelect={(item) => {
                            dispatch(addContextReferenceAction({ object: item }));
                            onAddContext?.(item);
                        }}
                    />
                )}
            />
        </div>
    );
}
