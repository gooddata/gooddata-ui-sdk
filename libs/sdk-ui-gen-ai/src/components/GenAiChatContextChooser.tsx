// (C) 2026 GoodData Corporation

import { type FC } from "react";

import { defineMessages, useIntl } from "react-intl";
import { connect } from "react-redux";

import { type IGenAIUserContext } from "@gooddata/sdk-model";
import { Dropdown, UiIconButton, UiMenu, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { type IGenAIContextObject } from "../context/collectContextReferences.js";
import { ambientContextSelector, effectiveContextSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { addContextReferenceAction } from "../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../store/types.js";

import { useContextItems } from "./hooks/useContextItems.js";

type GenAiChatContextChooserOwnProps = {
    onAddContext?: (context: IGenAIContextObject) => void;
};

type GenAiChatContextChooserStateProps = {
    currentAmbient: IGenAIUserContext | undefined;
    selectedAmbient: IGenAIUserContext | undefined;
};

type IGenAiChatContextChooserDispatchProps = {
    addContextReference: typeof addContextReferenceAction;
};

const msgs = defineMessages({
    add: {
        id: "gd.gen-ai.context.add_context",
    },
});

function GenAiChatContextChooserCore({
    currentAmbient,
    selectedAmbient,
    addContextReference,
    onAddContext,
}: GenAiChatContextChooserOwnProps &
    GenAiChatContextChooserStateProps &
    IGenAiChatContextChooserDispatchProps) {
    const intl = useIntl();
    const items = useContextItems(currentAmbient, selectedAmbient, "ambient");

    if (!currentAmbient) {
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
                renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => (
                    <UiIconButton
                        icon="plus"
                        variant="tertiary"
                        size="small"
                        dataTestId="choose_context"
                        isActive={isOpen}
                        accessibilityConfig={{
                            ...accessibilityConfig,
                            ariaLabel: intl.formatMessage(msgs.add),
                        }}
                        onClick={toggleDropdown}
                        isDisabled={!items.length}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu<{ interactive: IGenAIContextObject }>
                        dataTestId="agent_dropdown_menu"
                        items={items}
                        size="medium"
                        minWidth={245}
                        maxWidth={245}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                        MenuHeader={ContextMenuHeader}
                        ariaAttributes={ariaAttributes}
                        onSelect={(item) => {
                            addContextReference({ object: item.data });
                            onAddContext?.(item.data);
                            closeDropdown();
                        }}
                    />
                )}
            />
        </div>
    );
}

const mapStateToProps = (state: RootState): GenAiChatContextChooserStateProps => {
    const currentAmbient = ambientContextSelector(state);
    const { ambient } = effectiveContextSelector(state);

    return {
        currentAmbient,
        selectedAmbient: ambient,
    };
};

const mapDispatchToProps = {
    addContextReference: addContextReferenceAction,
};

export const GenAiChatContextChooser: FC<GenAiChatContextChooserOwnProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAiChatContextChooserCore);

function ContextMenuHeader() {
    const intl = useIntl();

    return <UiSubmenuHeader title={intl.formatMessage(msgs.add)} height="medium" />;
}
