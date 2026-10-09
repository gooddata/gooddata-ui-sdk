// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    useCallback,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { makeGridKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { iconPaths } from "../UiIcon/icons.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { hasSystemModifier } from "../UiToolbar/rovingFocusUtils.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import {
    type IUiResizableSidebarNavigationBadge,
    type IUiResizableSidebarNavigationItem,
    type IUiResizableSidebarNavigationSubItem,
    type UiResizableSidebarNavigationNamingConfig,
} from "./types.js";
import { useOptionalUiResizableSidebar } from "./UiResizableSidebarContext.js";

const { b, e } = bem("gd-ui-kit-resizable-sidebar-navigation");

const ICON_SIZE = 18;
const CHEVRON_SIZE = 14;

/**
 * @internal
 */
export type UiResizableSidebarNavigationItem =
    | IUiResizableSidebarNavigationItem
    | IUiResizableSidebarNavigationSubItem;

/**
 * @internal
 */
export interface IUiResizableSidebarNavigationProps {
    items: IUiResizableSidebarNavigationItem[];
    /**
     * Called when the user activates an item. A link item is not prevented from following its `href`;
     * call `event.preventDefault()` to route it in the application instead. A click with Alt, Ctrl, Meta
     * or Shift on a link item is left to the browser (new tab, window or download) and does not call
     * this.
     *
     * A group with an `href` calls this only while it is not active. Activating an active group toggles
     * its sub-items, so its own `href` is then reached only by a modified click; list a group page that
     * must stay reachable as one of its sub-items. In rail mode every top-level item calls this,
     * including a group without an `href`, whose sub-items the consumer can reach by expanding the
     * sidebar.
     */
    onSelect?: (item: UiResizableSidebarNavigationItem, event: MouseEvent | KeyboardEvent) => void;
    accessibilityConfig: UiResizableSidebarNavigationNamingConfig;
    /**
     * Rail mode lists only the icons of the top-level items, each with a tooltip, and no sub-items.
     * Defaults to whether the nearest {@link UiResizableSidebarProvider} is collapsed to a rail.
     */
    isRail?: boolean;
    dataTestId?: string;
}

interface IRow {
    item: UiResizableSidebarNavigationItem;
    parent?: IUiResizableSidebarNavigationItem;
    /**
     * Identity of the row in the list. Sub-item ids only have to be unique within their group, so the
     * key qualifies them by the group; the JSON encoding keeps it unique for any id strings.
     */
    key: string;
}

function makeRow(item: UiResizableSidebarNavigationItem, parent?: IUiResizableSidebarNavigationItem): IRow {
    return { item, parent, key: JSON.stringify(parent ? [parent.id, item.id] : [item.id]) };
}

interface IExpansionState {
    selectionKey: string;
    toggles: ReadonlyMap<string, boolean>;
}

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// A label can start with an emoji or a combined character that spans several UTF-16 code units.
function getFirstGrapheme(label: string): string {
    return graphemeSegmenter.segment(label)[Symbol.iterator]().next().value?.segment ?? "";
}

// Any supplied href, even an empty one, makes the item a link.
function isLink(item: UiResizableSidebarNavigationItem): boolean {
    return item.href !== undefined;
}

function isIconType(icon: unknown): icon is IconType {
    return typeof icon === "string" && icon in iconPaths;
}

function isGroup(item: IUiResizableSidebarNavigationItem): boolean {
    return (item.children?.length ?? 0) > 0;
}

function isActive(item: IUiResizableSidebarNavigationItem): boolean {
    return !!item.isSelected || !!item.children?.some((child) => child.isSelected);
}

function getSelectionKey(items: IUiResizableSidebarNavigationItem[]): string {
    return items
        .flatMap((item) => [makeRow(item), ...(item.children ?? []).map((child) => makeRow(child, item))])
        .filter((row) => row.item.isSelected)
        .map((row) => row.key)
        .join();
}

/**
 * Item list of a sidebar: top-level pages and expandable groups of sub-pages. A group expands by itself
 * when it or one of its sub-items is selected, and the user can expand and collapse it with its chevron
 * or the Left and Right arrow keys. The list is one tab stop: Up and Down move between the listed items,
 * Home and End jump to the ends.
 *
 * @remarks
 * Selection is driven by the `isSelected` flags of the items; the list does not keep a selection of its
 * own. A group with a selected sub-item is highlighted together with the sub-item.
 *
 * @internal
 */
export function UiResizableSidebarNavigation({
    items,
    onSelect,
    accessibilityConfig,
    isRail: isRailProp,
    dataTestId,
}: IUiResizableSidebarNavigationProps): ReactElement {
    const sidebar = useOptionalUiResizableSidebar();
    const isRail = isRailProp ?? (!!sidebar && sidebar.isCollapsed && sidebar.hasRail);
    const idPrefix = useId();

    const selectionKey = getSelectionKey(items);
    const [expansion, setExpansion] = useState<IExpansionState>({ selectionKey, toggles: new Map() });

    // A change of selection forgets the manual toggles, so the group of the new page always opens.
    if (expansion.selectionKey !== selectionKey) {
        setExpansion({ selectionKey, toggles: new Map() });
    }

    const isExpanded = useCallback(
        (item: IUiResizableSidebarNavigationItem) =>
            !isRail && isGroup(item) && (expansion.toggles.get(item.id) ?? isActive(item)),
        [expansion.toggles, isRail],
    );

    const setExpanded = useCallback((id: string, expanded: boolean) => {
        setExpansion((current) => ({
            ...current,
            toggles: new Map(current.toggles).set(id, expanded),
        }));
    }, []);

    const rows = useMemo<IRow[]>(
        () =>
            items.flatMap((item): IRow[] => {
                const own = makeRow(item);
                return isExpanded(item)
                    ? [own, ...(item.children ?? []).map((child) => makeRow(child, item))]
                    : [own];
            }),
        [items, isExpanded],
    );

    const [focusedKey, setFocusedKey] = useState<string | null>(null);
    const tabStopKey = useMemo(() => {
        if (rows.some((row) => row.key === focusedKey)) {
            return focusedKey;
        }

        const selected = rows.find((row) => row.item.isSelected) ?? rows.find((row) => isActive(row.item));

        return (selected ?? rows[0])?.key ?? null;
    }, [rows, focusedKey]);

    const elementsRef = useRef(new Map<string, HTMLElement>());

    const focusRow = useCallback((key: string | undefined) => {
        if (key !== undefined) {
            elementsRef.current.get(key)?.focus();
        }
    }, []);

    const getRowIndex = useCallback(
        (target: EventTarget) => {
            const entry = [...elementsRef.current.entries()].find(([, element]) =>
                element.contains(target as Node),
            );

            return entry ? rows.findIndex((row) => row.key === entry[0]) : -1;
        },
        [rows],
    );

    const onKeyDown = useMemo(() => {
        // Enter and Space stay unhandled, so links and buttons keep their native activation.
        const handleKey = makeGridKeyboardNavigation<KeyboardEvent<HTMLElement>>({
            onFocusUp: (event) => {
                const index = getRowIndex(event.target);
                focusRow(rows[Math.max(0, index - 1)]?.key);
            },
            onFocusDown: (event) => {
                const index = getRowIndex(event.target);
                focusRow(rows[Math.min(rows.length - 1, index + 1)]?.key);
            },
            onFocusFirst: () => focusRow(rows[0]?.key),
            onFocusLast: () => focusRow(rows[rows.length - 1]?.key),
            onFocusRight: (event) => {
                const row = rows[getRowIndex(event.target)];
                const item = row?.item as IUiResizableSidebarNavigationItem | undefined;

                if (!item || row.parent || !isGroup(item) || isRail) {
                    return;
                }

                if (isExpanded(item)) {
                    const firstChild = item.children?.[0];
                    focusRow(firstChild ? makeRow(firstChild, item).key : undefined);
                } else {
                    setExpanded(item.id, true);
                }
            },
            onFocusLeft: (event) => {
                const row = rows[getRowIndex(event.target)];

                if (!row) {
                    return;
                }

                if (row.parent) {
                    focusRow(makeRow(row.parent).key);
                } else if (isExpanded(row.item as IUiResizableSidebarNavigationItem)) {
                    setExpanded(row.item.id, false);
                }
            },
        });

        // Modified keys stay with the browser, e.g. Alt+Left for history navigation.
        return (event: KeyboardEvent<HTMLElement>) => {
            if (!hasSystemModifier(event)) {
                handleKey(event);
            }
        };
    }, [rows, getRowIndex, focusRow, isExpanded, setExpanded, isRail]);

    const registerElement = useCallback((key: string, element: HTMLElement | null) => {
        if (element) {
            elementsRef.current.set(key, element);
        } else {
            elementsRef.current.delete(key);
        }
    }, []);

    const onActivate = useCallback(
        (row: IRow, event: MouseEvent | KeyboardEvent) => {
            const item = row.item as IUiResizableSidebarNavigationItem;

            if (isLink(item) && (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {
                return;
            }

            if (row.parent || isRail || !isGroup(item)) {
                onSelect?.(item, event);
                return;
            }

            if (!isLink(item) || isActive(item)) {
                event.preventDefault();
                setExpanded(item.id, !isExpanded(item));
                return;
            }

            setExpanded(item.id, true);
            onSelect?.(item, event);
        },
        [onSelect, isRail, isExpanded, setExpanded],
    );

    const renderRow = (row: IRow): ReactNode => {
        const item = row.item as IUiResizableSidebarNavigationItem;
        const group = !row.parent && isGroup(item);
        const expanded = isExpanded(item);
        const childrenId = `${idPrefix}-${encodeURIComponent(item.id)}`;

        // A collapsed group shows the badge of a sub-page, so the marker stays visible from outside.
        const badge =
            item.badge ??
            (group && !expanded ? item.children?.find((child) => child.badge)?.badge : undefined);

        const element = (
            <NavigationRow
                item={item}
                badge={badge}
                rowKey={row.key}
                isChild={!!row.parent}
                isRail={isRail}
                isActive={!row.parent && isActive(item)}
                isExpanded={group && !isRail ? expanded : undefined}
                childrenId={group ? childrenId : undefined}
                tabIndex={row.key === tabStopKey ? 0 : -1}
                onFocus={() => setFocusedKey(row.key)}
                onActivate={(event) => onActivate(row, event)}
                registerElement={registerElement}
            />
        );

        return (
            <li key={row.key} className={e("row", { rail: isRail })}>
                {isRail ? (
                    <UiTooltip
                        anchor={element}
                        content={item.label}
                        arrowPlacement="left"
                        triggerBy={["hover", "focus"]}
                        accessibilityHidden
                        closeOnAnchorClick
                    />
                ) : (
                    element
                )}
                {group && expanded ? (
                    <ul id={childrenId} className={e("children")}>
                        {item.children?.map((child) => renderRow(makeRow(child, item)))}
                    </ul>
                ) : null}
            </li>
        );
    };

    return (
        <nav
            className={b({ rail: isRail })}
            {...accessibilityConfigToAttributes(accessibilityConfig)}
            data-testid={dataTestId}
            onKeyDown={onKeyDown}
        >
            <ul className={e("list")}>{items.map((item) => renderRow(makeRow(item)))}</ul>
        </nav>
    );
}

interface INavigationRowProps {
    item: IUiResizableSidebarNavigationItem;
    badge: IUiResizableSidebarNavigationBadge | undefined;
    rowKey: string;
    isChild: boolean;
    isRail: boolean;
    isActive: boolean;
    isExpanded: boolean | undefined;
    childrenId: string | undefined;
    tabIndex: number;
    onFocus: () => void;
    onActivate: (event: MouseEvent | KeyboardEvent) => void;
    registerElement: (key: string, element: HTMLElement | null) => void;
}

function NavigationRow({
    item,
    badge,
    rowKey,
    isChild,
    isRail,
    isActive,
    isExpanded,
    childrenId,
    tabIndex,
    onFocus,
    onActivate,
    registerElement,
}: INavigationRowProps): ReactElement {
    const showIcon = !isChild;
    const showChevron = isExpanded !== undefined;
    // A group whose current sub-page is not rendered (collapsed, or in the rail) stands in for it.
    const holdsHiddenCurrentPage = isActive && !item.isSelected && isExpanded !== true;
    const ariaCurrent = item.isSelected
        ? ("page" as const)
        : holdsHiddenCurrentPage
          ? ("true" as const)
          : undefined;
    const badgeElement = badge ? (
        <span className={e("badge", { kind: badge.kind })}>
            <span className={e("sr-only")}>{badge.label}</span>
        </span>
    ) : null;

    const content = (
        <>
            {showIcon ? (
                <span className={e("icon")} aria-hidden="true">
                    {isIconType(item.icon) ? (
                        <UiIcon type={item.icon} size={ICON_SIZE} color="currentColor" layout="block" />
                    ) : (
                        (item.icon ?? getFirstGrapheme(item.label))
                    )}
                </span>
            ) : null}
            <span className={e(isRail ? "sr-only" : "label")}>{item.label}</span>
            {badgeElement}
            {showChevron ? (
                <span className={e("chevron", { expanded: !!isExpanded })} aria-hidden="true">
                    <UiIcon type="chevronRight" size={CHEVRON_SIZE} color="currentColor" layout="block" />
                </span>
            ) : null}
        </>
    );

    const sharedProps = {
        className: e("item", {
            selected: !!item.isSelected,
            active: isActive,
            child: isChild,
            rail: isRail,
        }),
        tabIndex,
        "aria-current": ariaCurrent,
        "aria-expanded": isExpanded,
        "aria-controls": isExpanded ? childrenId : undefined,
        "data-testid": item.dataTestId,
        onFocus,
        onClick: onActivate,
    };

    if (isLink(item)) {
        return (
            <a ref={(element) => registerElement(rowKey, element)} href={item.href} {...sharedProps}>
                {content}
            </a>
        );
    }

    return (
        <button ref={(element) => registerElement(rowKey, element)} type="button" {...sharedProps}>
            {content}
        </button>
    );
}
