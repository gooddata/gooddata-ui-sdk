// (C) 2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Dropdown, UiIconButton, UiMenu, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { ambientContextSelector, userContextSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { addContextReferenceAction } from "../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../store/types.js";
import { type IGenAIContextObject } from "../types.js";

import { useContextItems } from "./hooks/useContextItems.js";

type GenAiChatContextChooserOwnProps = {
    onAddContext?: (context: IGenAIContextObject) => void;
};

const msgs = defineMessages({
    add: {
        id: "gd.gen-ai.context.add_context",
    },
});

export function GenAiChatContextChooser({ onAddContext }: GenAiChatContextChooserOwnProps) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const ambient = useSelector((state: RootState) => ambientContextSelector(state));
    const active = useSelector((state: RootState) => userContextSelector(state));
    const items = useContextItems(ambient, active);

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
                        containerTopPadding="none"
                        containerBottomPadding="none"
                        MenuHeader={ContextMenuHeader}
                        ariaAttributes={ariaAttributes}
                        onSelect={(item) => {
                            dispatch(addContextReferenceAction({ object: item.data }));
                            onAddContext?.(item.data);
                            closeDropdown();
                        }}
                    />
                )}
            />
        </div>
    );
}

function ContextMenuHeader() {
    const intl = useIntl();

    return <UiSubmenuHeader title={intl.formatMessage(msgs.add)} height="medium" />;
}
