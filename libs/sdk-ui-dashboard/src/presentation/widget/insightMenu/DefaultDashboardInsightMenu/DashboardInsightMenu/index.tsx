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

import { useIntl } from "react-intl";

import { type IInsightWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";
import {
    type IUiMenuContext,
    type IUiMenuItem,
    UiFocusManager,
    UiMenu,
    getSelectedMenuId,
} from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectRenderMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { type RenderMode } from "../../../../../types.js";
import {
    type IDashboardInsightMenuProps,
    type IInsightMenuItem,
    type IInsightMenuSubmenu,
    isIInsightMenuSubmenu,
} from "../../types.js";

import {
    CustomUiMenuContentComponent,
    CustomUiMenuContentItemComponent,
    CustomUiMenuHeaderComponent,
    CustomUiMenuHeaderComponentWithoutTitle,
    CustomUiMenuInteractiveItemComponent,
    type IMenuData,
    type IMenuItemData,
} from "./CustomUiMenuComponents.js";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble.js";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble.js";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer.js";

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

/**
 * Custom item ids may contain whitespace, which aria-describedby would split into several IDREFs.
 * Escapes whitespace (and the escape character itself) so the result has no whitespace and distinct
 * inputs stay distinct ids.
 */
function toIdref(value: string): string {
    return value.replace(/[\s%]/g, (char) => `%${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
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
    menuId: string,
): Array<IUiMenuItem<IMenuItemData>> => {
    return items.map((item): IUiMenuItem<IMenuItemData> => {
        if (item.type === "separator") {
            return { type: "separator", id: item.itemId };
        }

        if (item.type === "group") {
            return {
                type: "group" as const,
                id: item.itemId,
                data: null,
                stringTitle: item.itemName,
                subItems: item.items
                    ? convertToUiMenuItems(item.items, latestWidgetRef, submenuComponentCache, menuId)
                    : [],
            };
        }
        // The disabled reason is the item's description, not part of its name.
        const descriptionId =
            item.disabled && item.tooltip ? toIdref(`${menuId}-${item.itemId}-description`) : undefined;
        const baseFocusableItem = {
            id: item.itemId,
            stringTitle: item.itemName,
            isDisabled: item.disabled,
            ariaAttributes: descriptionId ? { "aria-describedby": descriptionId } : undefined,
            data: {
                icon: item.icon,
                className: item.className,
                tooltip: item.tooltip,
                descriptionId,
                onClick: item.onClick,
            },
        };

        if (isIInsightMenuSubmenu(item)) {
            if (item.items?.length) {
                return {
                    ...baseFocusableItem,
                    type: "interactive" as const,
                    subItems: convertToUiMenuItems(
                        item.items,
                        latestWidgetRef,
                        submenuComponentCache,
                        menuId,
                    ),
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
    showTitle = true,
}: IDashboardInsightMenuProps & {
    setSubmenu?: Dispatch<SetStateAction<IInsightMenuSubmenu | null>>;
    renderMode: RenderMode;
    /**
     * Whether the menu names the widget it belongs to. Off for a widget the user is not allowed to
     * see, whose stored title can name the object they have no access to.
     */
    showTitle?: boolean;
}) {
    const intl = useIntl();
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

    const menuId = `insight-menu-${widgetRefAsString}`;
    const uiMenuItems = useMemo(
        () => convertToUiMenuItems(items, latestWidgetRef, submenuComponentCache.current, menuId),
        [items, menuId],
    );

    const handleSelect = (item: IUiMenuItem<IMenuItemData>) => {
        if (item.type === "interactive" && item.data?.onClick) {
            // Call onClick directly - the event properties are not used in the handlers
            item.data.onClick({} as MouseEvent);
        }
    };

    // the title of the opened submenu; the parent's label element is not rendered while a submenu is shown
    const [submenuTitle, setSubmenuTitle] = useState<string | undefined>(undefined);

    const handleSubmenuOpen = (level: number, item?: IUiMenuItem<IMenuItemData>) => {
        setSubmenuTitle(level > 0 && item && "stringTitle" in item ? item.stringTitle : undefined);
        if (level > 0) {
            const submenuItem = items.find((i) => i.itemId === item?.id);
            if (submenuItem) {
                setSubmenu?.(submenuItem as IInsightMenuSubmenu);
            }
        } else {
            setSubmenu?.(null);
        }
    };

    const menuLabelId = `${menuId}-label`;
    // without the title there is no element carrying menuLabelId, so the name goes on the menu itself
    const menuLabel = showTitle
        ? undefined
        : intl.formatMessage({ id: "insightMenu.restrictedWidget.options" });
    // names both the dialog and the menu; a shown submenu is named by its own title
    const label = submenuTitle ?? menuLabel;

    // The element that opened the menu, kept from before the menu took the focus.
    const openerRef = useRef(document.activeElement);

    // An actions menu does not trap focus: Tab out closes it and continues from where it was opened.
    const handleTabOut = () => {
        onClose();
        if (openerRef.current instanceof HTMLElement) {
            openerRef.current.focus();
        }
    };

    const getMaxHeight = (context: IUiMenuContext<IMenuItemData, unknown>) => {
        if (getSelectedMenuId(context) === "Alerts") {
            return 500;
        }
        return 350;
    };

    return (
        <UiFocusManager
            enableAutofocus={{ initialFocus: menuId }}
            enableReturnFocusOnUnmount
            tabOutHandler={handleTabOut}
        >
            <DashboardInsightMenuContainer ariaLabelledBy={label ? undefined : menuLabelId} ariaLabel={label}>
                <UiMenu<IMenuItemData, IMenuData>
                    maxHeight={getMaxHeight}
                    containerBottomPadding="small"
                    items={uiMenuItems}
                    onClose={onClose}
                    InteractiveItem={CustomUiMenuInteractiveItemComponent}
                    ContentItem={CustomUiMenuContentItemComponent}
                    Content={CustomUiMenuContentComponent}
                    MenuHeader={
                        showTitle ? CustomUiMenuHeaderComponent : CustomUiMenuHeaderComponentWithoutTitle
                    }
                    shouldCloseOnSelect
                    ariaAttributes={
                        label
                            ? { id: menuId, "aria-label": label }
                            : { id: menuId, "aria-labelledby": menuLabelId }
                    }
                    onSelect={handleSelect}
                    onLevelChange={handleSubmenuOpen}
                    menuCtxData={{
                        widget,
                        insight,
                        renderMode,
                        titleId: menuLabelId,
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
