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
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer.js";
import { selectRenderMode, useDashboardSelector } from "../../../../../model/index.js";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble.js";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble.js";
import { RenderMode } from "../../../../../types.js";
import {
    CustomUiMenuContentItemComponent,
    CustomUiMenuHeaderComponent,
    CustomUiMenuInteractiveItemComponent,
    CustomUiMenuStaticItemComponent,
    IMenuData,
    IMenuItemData,
} from "./CustomUiMenuComponents.js";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";

const convertToUiMenuItems = (
    items: IInsightMenuItem[],
    setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>,
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
                subItems: item.items ? convertToUiMenuItems(item.items, setSubmenu, widget) : [],
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
                    subItems: convertToUiMenuItems(item.items, setSubmenu, widget),
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
    const { items, widget, insight, submenu, setSubmenu, onClose, renderMode } = props;

    const uiMenuItems = useMemo(
        () => convertToUiMenuItems(items, setSubmenu, widget),
        [items, setSubmenu, widget],
    );

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const renderSubmenuComponent =
        !!submenu && !!submenu.SubmenuComponent ? (
            <submenu.SubmenuComponent widget={widget} onClose={onClose} onGoBack={() => setSubmenu(null)} />
        ) : null;

    const handleSelect = (item: IUiMenuItem<IMenuItemData>) => {
        if (item.type === "interactive" && item.data?.onClick) {
            // Call onClick directly - the event properties are not used in the handlers
            item.data.onClick({} as React.MouseEvent);
        }
    };

    const menuId = `insight-menu-${widgetRefAsString}`;
    const menuLabelId = `${menuId}-label`;

    return submenu ? (
        submenu.renderSubmenuComponentOnly ? (
            renderSubmenuComponent
        ) : (
            <DashboardInsightSubmenuContainer
                onClose={onClose}
                title={submenu.itemName}
                onBack={() => setSubmenu(null)}
            >
                {renderSubmenuComponent}
            </DashboardInsightSubmenuContainer>
        )
    ) : (
        <UiFocusTrap autofocusOnOpen={true} initialFocus={menuId}>
            <DashboardInsightMenuContainer
                onClose={onClose}
                widget={widget}
                insight={insight}
                renderMode={renderMode}
                titleId={menuLabelId}
                isSubmenu={!!submenu}
            >
                <UiMenu<IMenuItemData, IMenuData>
                    items={uiMenuItems}
                    onClose={onClose}
                    InteractiveItemComponent={CustomUiMenuInteractiveItemComponent}
                    ContentItemComponent={CustomUiMenuContentItemComponent}
                    StaticItemComponent={CustomUiMenuStaticItemComponent}
                    MenuHeaderComponent={CustomUiMenuHeaderComponent}
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
