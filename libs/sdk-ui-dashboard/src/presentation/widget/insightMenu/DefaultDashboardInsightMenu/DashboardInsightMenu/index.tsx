// (C) 2021-2025 GoodData Corporation
import { useState, useMemo, Dispatch, SetStateAction, MouseEvent } from "react";
import {
    UiMenu,
    IUiMenuItem,
    IUiMenuContext,
    getSelectedMenuId,
    separatorStaticItem,
    UiFocusManager,
} from "@gooddata/sdk-ui-kit";

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
        function WrappedSubmenuComponent({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
            const SubmenuComponent = (item as IInsightMenuSubmenu).SubmenuComponent!;
            return <SubmenuComponent widget={widget} onClose={onClose} onGoBack={onBack} />;
        }

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
                    Component: WrappedSubmenuComponent,
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

export function DashboardInsightMenuBody({
    items,
    widget,
    insight,
    onClose,
    renderMode,
    setSubmenu,
}: IDashboardInsightMenuProps & {
    setSubmenu?: Dispatch<SetStateAction<IInsightMenuSubmenu | null>>;
    renderMode: RenderMode;
}) {
    const uiMenuItems = useMemo(() => convertToUiMenuItems(items, widget), [items, widget]);

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const handleSelect = (item: IUiMenuItem<IMenuItemData>) => {
        if (item.type === "interactive" && item.data?.onClick) {
            // Call onClick directly - the event properties are not used in the handlers
            item.data.onClick({} as MouseEvent);
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
