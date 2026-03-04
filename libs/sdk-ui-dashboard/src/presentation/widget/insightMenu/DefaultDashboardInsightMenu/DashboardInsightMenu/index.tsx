// (C) 2021-2026 GoodData Corporation

import {
    type Dispatch,
    type MouseEvent,
    type ReactNode,
    type SetStateAction,
    useMemo,
    useRef,
    useState,
} from "react";

import { type IInsightWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";
import {
    type IUiMenuContext,
    type IUiMenuItem,
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
    type IMenuData,
    type IMenuItemData,
} from "./CustomUiMenuComponents.js";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble.js";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble.js";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectRenderMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { type RenderMode } from "../../../../../types.js";
import {
    type IDashboardInsightMenuProps,
    type IInsightMenuItem,
    type IInsightMenuSubmenu,
    isIInsightMenuSubmenu,
} from "../../types.js";

type IWrappedSubmenuComponent = ({
    onBack,
    onClose,
}: {
    onBack: () => void;
    onClose: () => void;
}) => ReactNode;

type IInsightWidgetRef = { current: IInsightWidget };

function getWrappedSubmenuComponent(
    item: IInsightMenuSubmenu,
    latestWidgetRef: IInsightWidgetRef,
    submenuComponentCache: Map<
        string,
        {
            SubmenuComponent: IInsightMenuSubmenu["SubmenuComponent"];
            WrappedComponent: IWrappedSubmenuComponent;
        }
    >,
): IWrappedSubmenuComponent {
    const cachedSubmenu = submenuComponentCache.get(item.itemId);
    if (cachedSubmenu && cachedSubmenu.SubmenuComponent === item.SubmenuComponent) {
        return cachedSubmenu.WrappedComponent;
    }

    const SubmenuComponent = item.SubmenuComponent as NonNullable<IInsightMenuSubmenu["SubmenuComponent"]>;
    function WrappedSubmenuComponent({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
        return <SubmenuComponent widget={latestWidgetRef.current} onClose={onClose} onGoBack={onBack} />;
    }

    submenuComponentCache.set(item.itemId, {
        SubmenuComponent: item.SubmenuComponent,
        WrappedComponent: WrappedSubmenuComponent,
    });

    return WrappedSubmenuComponent;
}

const convertToUiMenuItems = (
    items: IInsightMenuItem[],
    latestWidgetRef: IInsightWidgetRef,
    submenuComponentCache: Map<
        string,
        {
            SubmenuComponent: IInsightMenuSubmenu["SubmenuComponent"];
            WrappedComponent: IWrappedSubmenuComponent;
        }
    >,
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
                subItems: item.items
                    ? convertToUiMenuItems(item.items, latestWidgetRef, submenuComponentCache)
                    : [],
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
                    subItems: convertToUiMenuItems(item.items, latestWidgetRef, submenuComponentCache),
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
                    Component: getWrappedSubmenuComponent(item, latestWidgetRef, submenuComponentCache),
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
    const widgetRefAsString = objRefToString(widgetRef(widget));
    const latestWidgetRef = useRef(widget);
    latestWidgetRef.current = widget;
    // Cache submenu components to prevent remounting caused by component identity change.
    const submenuComponentCache = useRef<
        Map<
            string,
            {
                SubmenuComponent: IInsightMenuSubmenu["SubmenuComponent"];
                WrappedComponent: IWrappedSubmenuComponent;
            }
        >
    >(new Map());

    const uiMenuItems = useMemo(
        () => convertToUiMenuItems(items, latestWidgetRef, submenuComponentCache.current),
        [items],
    );

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
                    shouldCloseOnSelect
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
