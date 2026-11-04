// (C) 2026 GoodData Corporation

import {
    type ReactElement,
    type KeyboardEvent as ReactKeyboardEvent,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { type EditorView } from "@codemirror/view";
import classNames from "classnames";
import { createPortal } from "react-dom";
import { useIntl } from "react-intl";

import { Separator } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../theme/styles.js";

import { changeAllOccurrences, copySelection, cutSelection, pasteFromClipboard } from "./commands.js";

/**
 * An action of the context menu of an editor.
 */
export interface IContextMenuItem {
    id: string;
    label: string;
    /**
     * The key of the action, written the way the platform writes it.
     */
    shortcut?: string;
    /**
     * Actions of the same group sit together; a separator divides the groups.
     */
    group: string;
    /**
     * Whether the action is offered in a read-only editor. Copy is; edits are not.
     */
    readOnly?: boolean;
    run: (editor: EditorView) => unknown;
}

export interface IMenuPosition {
    x: number;
    y: number;
}

export interface IContextMenuProps {
    editor: EditorView;
    items: IContextMenuItem[];
    position: IMenuPosition;
    onClose: () => void;
}

export const CONTEXT_MENU_CLASS = "maql-editor-context-menu";
export const CONTEXT_MENU_TEST_CLASS = "s-maql-editor-context-menu";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * The key of a shortcut the way the platform writes it: symbols on a Mac, names elsewhere.
 */
export function platformShortcut(mac: string, other: string): string {
    return isMac ? mac : other;
}

/**
 * The actions every editor of this package offers in its context menu, labelled in the locale of
 * the application: multi-cursor editing in the edit group, and the clipboard group.
 */
export function useCommonMenuItems(): {
    changeAllOccurrences: IContextMenuItem;
    clipboard: IContextMenuItem[];
} {
    const intl = useIntl();

    return useMemo(
        () => ({
            changeAllOccurrences: {
                id: "change-all-occurrences",
                group: "edit",
                label: intl.formatMessage({
                    id: "metricComponent.editMetric.contextMenu.changeAllOccurrences",
                }),
                shortcut: platformShortcut("⌘F2", "Ctrl+F2"),
                run: changeAllOccurrences,
            },
            clipboard: [
                {
                    id: "cut",
                    group: "clipboard",
                    label: intl.formatMessage({ id: "metricComponent.editMetric.contextMenu.cut" }),
                    run: cutSelection,
                },
                {
                    id: "copy",
                    group: "clipboard",
                    label: intl.formatMessage({ id: "metricComponent.editMetric.contextMenu.copy" }),
                    readOnly: true,
                    run: copySelection,
                },
                {
                    id: "paste",
                    group: "clipboard",
                    label: intl.formatMessage({ id: "metricComponent.editMetric.contextMenu.paste" }),
                    run: pasteFromClipboard,
                },
            ],
        }),
        [intl],
    );
}

const useStyles = makeStyles()((theme) => ({
    menu: {
        position: "fixed",
        // Above the dialogs of the UI kit.
        zIndex: 10002,
        display: "block",
        minWidth: 200,
    },
    item: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        paddingLeft: 10,
        paddingRight: 10,
        cursor: "pointer",
        // The keyboard moves the focus among the items; the focused item looks like the hovered one.
        "&:focus": {
            outline: "none",
            background: theme.suggestion.colors.selectedBackground,
        },
    },
    shortcut: {
        color: theme.content.colors.lineNumber,
    },
}));

/**
 * Keeps the menu inside the window: it opens down and to the right of the pointer, and flips
 * when there is no room.
 */
function usePlacement(position: IMenuPosition): [RefObject<HTMLDivElement | null>, IMenuPosition] {
    const element = useRef<HTMLDivElement | null>(null);
    const [placed, setPlaced] = useState(position);

    useLayoutEffect(() => {
        const rect = element.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        setPlaced({
            x:
                position.x + rect.width > window.innerWidth
                    ? Math.max(0, position.x - rect.width)
                    : position.x,
            y:
                position.y + rect.height > window.innerHeight
                    ? Math.max(0, position.y - rect.height)
                    : position.y,
        });
    }, [position]);

    return [element, placed];
}

/**
 * The context menu of an editor, with the actions Monaco's menu offered. It closes on a click
 * outside, on Escape, and when the window changes.
 */
export function ContextMenu({ editor, items, position, onClose }: IContextMenuProps): ReactElement | null {
    const { classes } = useStyles();
    const [element, placed] = usePlacement(position);
    const readOnly = editor.state.readOnly;
    const offered = items.filter((item) => !readOnly || item.readOnly);

    useEffect(() => {
        const isInside = (event: Event) => element.current?.contains(event.target as Node) ?? false;
        // A right button press is followed by a contextmenu event, which is dealt with below.
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (event.button !== 2 && !isInside(event)) {
                onClose();
            }
        };
        // A right click on the menu keeps it, without the browser's menu; one elsewhere closes
        // it, and leaves the event to whatever is there: the editor reopens the menu, another
        // control opens its own.
        const takeOverContextMenu = (event: MouseEvent) => {
            if (isInside(event)) {
                event.preventDefault();
            } else {
                onClose();
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onClose();
                editor.focus();
            }
        };
        document.addEventListener("mousedown", closeOnOutsideClick, true);
        document.addEventListener("contextmenu", takeOverContextMenu, true);
        document.addEventListener("keydown", closeOnEscape, true);
        window.addEventListener("resize", onClose);
        window.addEventListener("blur", onClose);

        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick, true);
            document.removeEventListener("contextmenu", takeOverContextMenu, true);
            document.removeEventListener("keydown", closeOnEscape, true);
            window.removeEventListener("resize", onClose);
            window.removeEventListener("blur", onClose);
        };
    }, [element, editor, onClose]);

    useEffect(() => {
        menuItemsOf(element.current)[0]?.focus();
    }, [element]);

    if (offered.length === 0) {
        return null;
    }

    const closeAndFocusEditor = () => {
        onClose();
        editor.focus();
    };

    return createPortal(
        <div
            ref={element}
            role="menu"
            className={classNames(
                "gd-menu-wrapper",
                classes.menu,
                CONTEXT_MENU_CLASS,
                CONTEXT_MENU_TEST_CLASS,
            )}
            style={{ top: placed.y, left: placed.x }}
            onKeyDown={(event) => moveFocus(event, closeAndFocusEditor)}
        >
            {offered.map((item, index) => {
                const run = () => {
                    closeAndFocusEditor();
                    void item.run(editor);
                };
                return (
                    <div key={item.id}>
                        {index > 0 && offered[index - 1].group !== item.group ? <Separator /> : null}
                        <div
                            role="menuitem"
                            tabIndex={-1}
                            className={classNames("gd-list-item gd-menu-item", classes.item, `s-${item.id}`)}
                            onClick={run}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    run();
                                }
                            }}
                        >
                            <span>{item.label}</span>
                            {item.shortcut ? (
                                <span className={classes.shortcut} aria-hidden="true">
                                    {item.shortcut}
                                </span>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>,
        document.body,
    );
}

function menuItemsOf(menu: HTMLElement | null): HTMLElement[] {
    return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
}

/**
 * Moves the focus among the items with the arrow keys, Home and End, the way a menu does; Tab
 * leaves the menu.
 */
function moveFocus(event: ReactKeyboardEvent<HTMLDivElement>, onLeave: () => void): void {
    const items = menuItemsOf(event.currentTarget);
    if (items.length === 0) {
        return;
    }
    const current = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
        ArrowDown: (current + 1) % items.length,
        ArrowUp: (current - 1 + items.length) % items.length,
        Home: 0,
        End: items.length - 1,
    };
    if (event.key in moves) {
        event.preventDefault();
        items[moves[event.key]].focus();
    } else if (event.key === "Tab") {
        onLeave();
    }
}
