// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { EmptyObject } from "@gooddata/util";

import { Dropdown } from "../../../Dropdown/index.js";
import { useScopedId } from "../../hooks/useScopedId.js";
import { isSeparator } from "../../UiListbox/defaults/DefaultUiListboxStaticItemComponent.js";
import { IUiMenuItem } from "../../UiMenu/types.js";
import { UiMenu } from "../../UiMenu/UiMenu.js";
import { UiTabsBem } from "../bem.js";
import { getTypedUiTabsContextStore } from "../context.js";
import { IUiTabAction, IUiTabComponentProps } from "../types.js";

type IMenuItemType<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
> = IUiMenuItem<{
    interactive: { onSelect: IUiTabAction<TTabProps, TTabActionProps>["onSelect"] };
}>;

/**
 * @internal
 */
export function DefaultUiTabsTabActions<
    TTabProps extends Record<any, any> = EmptyObject,
    TTabActionProps extends Record<any, any> = EmptyObject,
>({
    tab,
    location,
    id,
    tabIndex,
    isOpen,
    onToggleOpen,
}: IUiTabComponentProps<"TabActions", TTabProps, TTabActionProps>) {
    const store = getTypedUiTabsContextStore<TTabProps, TTabActionProps>();
    const { TabActionsButton, onActionTriggered } = store.useContextStoreValues([
        "TabActionsButton",
        "onActionTriggered",
    ]);

    const tabElementId = useScopedId(tab, "container");

    const menuItems: IMenuItemType<TTabProps, TTabActionProps>[] = useMemo(
        () =>
            tab.actions?.map((action) => {
                return isSeparator(action)
                    ? action
                    : {
                          type: "interactive" as const,
                          id: action.id,
                          stringTitle: action.label,
                          isDisabled: action.isDisabled,
                          isDestructive: action.isDestructive,
                          iconLeft: action.iconLeft,
                          iconRight: action.iconRight,
                          data: {
                              onSelect: ((ctx) => {
                                  action.onSelect(ctx);
                                  onActionTriggered({ action, tab, location });
                                  if (action.closeOnSelect !== false) {
                                      onToggleOpen(false);
                                  }

                                  // Scroll to the tab after the tabs are redrawn
                                  window.setTimeout(() => {
                                      document.getElementById(tabElementId)?.scrollIntoView({
                                          inline: "nearest",
                                          block: "nearest",
                                          behavior: "instant",
                                      });
                                  }, 50);
                              }) as IUiTabAction<TTabProps, TTabActionProps>["onSelect"],
                          },
                      };
            }) ?? [],
        [tab, onActionTriggered, location, tabElementId, onToggleOpen],
    );

    const handleItemSelected = useCallback(
        (item: IMenuItemType<TTabProps, TTabActionProps>) => {
            if (item.type !== "interactive") {
                return;
            }

            item.data.onSelect?.({ tab });
        },
        [tab],
    );

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Dropdown
            className={UiTabsBem.e("actions-wrapper", { location })}
            renderButton={({ toggleDropdown, isOpen, ariaAttributes }) => (
                <TabActionsButton
                    tab={tab}
                    isOpen={isOpen}
                    location={location}
                    onClick={toggleDropdown}
                    ariaAttributes={ariaAttributes}
                    id={id}
                    tabIndex={tabIndex}
                />
            )}
            renderBody={({ ariaAttributes, closeDropdown }) => (
                <UiMenu
                    items={menuItems}
                    onSelect={handleItemSelected}
                    onClose={closeDropdown}
                    shouldCloseOnSelect={false}
                    ariaAttributes={ariaAttributes}
                    maxWidth={160}
                    maxHeight={400}
                />
            )}
            autofocusOnOpen
            shouldTrapFocus
            alignPoints={[{ align: "bl tl" }, { align: "br tr" }]}
            closeOnEscape
            closeOnOutsideClick
            accessibilityConfig={{
                triggerRole: "button",
                popupRole: "listbox",
            }}
            isOpen={isOpen}
            onToggle={onToggleOpen}
        />
    );
}
