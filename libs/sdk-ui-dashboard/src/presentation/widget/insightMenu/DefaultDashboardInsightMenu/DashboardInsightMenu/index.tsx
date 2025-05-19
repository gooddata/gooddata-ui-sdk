// (C) 2021-2025 GoodData Corporation
import React, { useState, useMemo } from "react";
import { UiMenu, IUiMenuItem, UiFocusTrap } from "@gooddata/sdk-ui-kit";

import {
    IDashboardInsightMenuProps,
    IInsightMenuSubmenu,
    IInsightMenuItem,
    isIInsightMenuSubmenu,
} from "../../types.js";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer.js";
import { selectRenderMode, useDashboardSelector } from "../../../../../model/index.js";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble.js";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble.js";
import { RenderMode } from "../../../../../types.js";
import {
    CustomUiMenuContentItemComponent,
    CustomUiMenuHeaderComponent,
    CustomUiMenuInteractiveItemComponent,
    CustomUiMenuStaticItemComponent,
    CustomUiMenuContentComponent,
    IMenuData,
    IMenuItemData,
} from "./CustomUiMenuComponents.js";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";

const convertToUiMenuItems = (
    items: IInsightMenuItem[],
    widget: IDashboardInsightMenuProps["widget"],
): Array<IUiMenuItem<IMenuItemData>> => {
    return items.map((item): IUiMenuItem<IMenuItemData> => {
        if (item.type === "separator") {
            return {
                type: "static" as const,
                id: item.itemId,
                data: null,
            };
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
                const WrappedSubmenuComponent: React.FC<{ onBack?: () => void; onClose?: () => void }> = ({
                    onBack,
                    onClose,
                }) => {
                    const SubmenuComponent = item.SubmenuComponent!;
                    return (
                        <SubmenuComponent
                            widget={widget}
                            onClose={onClose ?? (() => {})}
                            onGoBack={onBack ?? (() => {})}
                        />
                    );
                };
                return {
                    ...baseFocusableItem,
                    type: "content" as const,
                    component: WrappedSubmenuComponent,
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

export const DashboardInsightMenuBody: React.FC<
    IDashboardInsightMenuProps & {
        submenu: IInsightMenuSubmenu | null;
        setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
        renderMode: RenderMode;
    }
> = (props) => {
    const { items, widget, insight, onClose, renderMode } = props;

    const uiMenuItems = useMemo(() => convertToUiMenuItems(items, widget), [items, widget]);

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const handleSelect = (item: IUiMenuItem<IMenuItemData>) => {
        if (item.type === "interactive" && item.data?.onClick) {
            // Call onClick directly - the event properties are not used in the handlers
            item.data.onClick({} as React.MouseEvent);
        }
    };

    const menuId = `insight-menu-${widgetRefAsString}`;
    const menuLabelId = `${menuId}-label`;

    return (
        <UiFocusTrap autofocusOnOpen={true} initialFocus={menuId}>
            <DashboardInsightMenuContainer>
                <UiMenu<IMenuItemData, IMenuData>
                    className="insight-configuration-menu"
                    items={uiMenuItems}
                    onClose={onClose}
                    InteractiveItem={CustomUiMenuInteractiveItemComponent}
                    ContentItem={CustomUiMenuContentItemComponent}
                    Content={CustomUiMenuContentComponent}
                    StaticItem={CustomUiMenuStaticItemComponent}
                    MenuHeader={CustomUiMenuHeaderComponent}
                    shouldCloseOnSelect={true}
                    ariaAttributes={{
                        id: menuId,
                        "aria-labelledby": menuLabelId,
                    }}
                    onSelect={handleSelect}
                    menuCtxData={{
                        widget,
                        insight,
                        renderMode,
                    }}
                />
            </DashboardInsightMenuContainer>
        </UiFocusTrap>
    );
};

export const DashboardInsightMenu: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { widget, onClose } = props;
    const renderMode = useDashboardSelector(selectRenderMode);
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return renderMode === "edit" ? (
        <DashboardInsightEditMenuBubble onClose={onClose} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody
                {...props}
                submenu={submenu}
                setSubmenu={setSubmenu}
                renderMode={renderMode}
            />
        </DashboardInsightEditMenuBubble>
    ) : (
        <DashboardInsightMenuBubble onClose={onClose} widget={widget} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody
                {...props}
                submenu={submenu}
                setSubmenu={setSubmenu}
                renderMode={renderMode}
            />
        </DashboardInsightMenuBubble>
    );
};
