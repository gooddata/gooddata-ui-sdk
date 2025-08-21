// (C) 2021-2025 GoodData Corporation
import React, { useMemo, useState } from "react";

import { IInsightWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";
import {
    IUiMenuContext,
    IUiMenuItem,
    UiFocusManager,
    UiMenu,
    getSelectedMenuId,
    separatorStaticItem,
} from "@gooddata/sdk-ui-kit";

import {
    CustomUiMenuContentComponent,
    CustomUiMenuContentItemComponent,
    CustomUiMenuHeaderComponent,
    CustomUiMenuInteractiveItemComponent,
    IMenuData,
    IMenuItemData,
} from "./CustomUiMenuComponents.js";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble.js";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble.js";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer.js";
import { selectRenderMode, useDashboardSelector } from "../../../../../model/index.js";
import { RenderMode } from "../../../../../types.js";
import {
    IDashboardInsightMenuProps,
    IInsightMenuItem,
    IInsightMenuSubmenu,
    isIInsightMenuSubmenu,
} from "../../types.js";

function getWrappedSubmenuComponent(item: IInsightMenuSubmenu, widget: IInsightWidget) {
    function WrappedSubmenuComponent({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
        const SubmenuComponent = item.SubmenuComponent!;
        return <SubmenuComponent widget={widget} onClose={onClose} onGoBack={onBack} />;
    }

    return WrappedSubmenuComponent;
}

const convertToUiMenuItems = (
    items: IInsightMenuItem[],
    widget: IDashboardInsightMenuProps["widget"],
): Array<IUiMenuItem<IMenuItemData>> => {
    return items.map((item): IUiMenuItem<IMenuItemData> => {
        if (item.type === "separator") {
            return separatorStaticItem;
        }

        if (item.type === "group") {
            return {
                type: "group" as const,
                id: item.itemId,
                data: null,
                stringTitle: item.itemName,
                subItems: item.items ? convertToUiMenuItems(item.items, widget) : [],
            };
        }
        const baseFocusableItem = {
            id: item.itemId,
            stringTitle: item.itemName,
            isDisabled: item.disabled,
            data: {
                icon: item.icon,
                className: item.className,
                tooltip: item.tooltip,
                onClick: item.onClick,
            },
        };

        if (isIInsightMenuSubmenu(item)) {
            if (item.items?.length) {
                return {
                    ...baseFocusableItem,
                    type: "interactive" as const,
                    subItems: convertToUiMenuItems(item.items, widget),
                    data: {
                        ...baseFocusableItem.data,
                        subMenu: true,
                    },
                };
            }
            if (item.SubmenuComponent) {
                return {
                    ...baseFocusableItem,
                    type: "content" as const,
                    Component: getWrappedSubmenuComponent(item, widget),
                    showComponentOnly: item.renderSubmenuComponentOnly,
                    data: {
                        ...baseFocusableItem.data,
                        subMenu: true,
                    },
                };
            }
        }

        return {
            ...baseFocusableItem,
            type: "interactive" as const,
        };
    });
};

export function DashboardInsightMenuBody(
    props: IDashboardInsightMenuProps & {
        setSubmenu?: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
        renderMode: RenderMode;
    },
) {
    const { items, widget, insight, onClose, renderMode, setSubmenu } = props;

    const uiMenuItems = useMemo(() => convertToUiMenuItems(items, widget), [items, widget]);

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const handleSelect = (item: IUiMenuItem<IMenuItemData>) => {
        if (item.type === "interactive" && item.data?.onClick) {
            // Call onClick directly - the event properties are not used in the handlers
            item.data.onClick({} as React.MouseEvent);
        }
    };

    const handleSubmenuOpen = (level: number, item?: IUiMenuItem<IMenuItemData>) => {
        if (level > 0) {
            const submenuItem = items.find((i) => i.itemId === item?.id);
            if (submenuItem) {
                setSubmenu?.(submenuItem as IInsightMenuSubmenu);
            }
        } else {
            setSubmenu?.(null);
        }
    };

    const menuId = `insight-menu-${widgetRefAsString}`;
    const menuLabelId = `${menuId}-label`;

    const getMaxHeight = (context: IUiMenuContext<IMenuItemData, unknown>) => {
        if (getSelectedMenuId(context) === "Alerts") {
            return 500;
        }
        return 350;
    };

    return (
        <UiFocusManager enableAutofocus={{ initialFocus: menuId }} enableFocusTrap enableReturnFocusOnUnmount>
            <DashboardInsightMenuContainer>
                <UiMenu<IMenuItemData, IMenuData>
                    maxHeight={getMaxHeight}
                    containerBottomPadding="small"
                    items={uiMenuItems}
                    onClose={onClose}
                    InteractiveItem={CustomUiMenuInteractiveItemComponent}
                    ContentItem={CustomUiMenuContentItemComponent}
                    Content={CustomUiMenuContentComponent}
                    MenuHeader={CustomUiMenuHeaderComponent}
                    shouldCloseOnSelect={true}
                    ariaAttributes={{
                        id: menuId,
                        "aria-labelledby": menuLabelId,
                    }}
                    onSelect={handleSelect}
                    onLevelChange={handleSubmenuOpen}
                    menuCtxData={{
                        widget,
                        insight,
                        renderMode,
                    }}
                />
            </DashboardInsightMenuContainer>
        </UiFocusManager>
    );
}

export function DashboardInsightMenu(props: IDashboardInsightMenuProps) {
    const { widget, onClose } = props;
    const renderMode = useDashboardSelector(selectRenderMode);
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return renderMode === "edit" ? (
        <DashboardInsightEditMenuBubble onClose={onClose} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody {...props} setSubmenu={setSubmenu} renderMode={renderMode} />
        </DashboardInsightEditMenuBubble>
    ) : (
        <DashboardInsightMenuBubble onClose={onClose} widget={widget} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody {...props} setSubmenu={setSubmenu} renderMode={renderMode} />
        </DashboardInsightMenuBubble>
    );
}
