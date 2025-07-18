// (C) 2025 GoodData Corporation

import {
    CSSProperties,
    MouseEvent,
    KeyboardEvent,
    FocusEvent,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";
import { v4 as uuid } from "uuid";

import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-navigation-bypass");

/**
 * @internal
 */
export interface IUiNavigationItem {
    id: string;
    name: string;
    targetId: string;
    tabIndex?: number;
}

/**
 * @internal
 */
export interface IUiNavigationBypassProps {
    items: IUiNavigationItem[];
    label: string;
    style?: CSSProperties;
    onItemClick?: (item: IUiNavigationItem) => void;
}

/**
 * @internal
 */
interface IUiNavigationBypassItem {
    item: IUiNavigationItem;
    onItemClick: (item: IUiNavigationItem) => void;
    onItemFocus: (el: HTMLDivElement) => void;
}

/**
 * @internal
 */
export function UiNavigationBypass({ label, items, onItemClick, style }: IUiNavigationBypassProps) {
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const focusedRef = useRef<HTMLDivElement>(null);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);
    const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
        if (containerRef.current && !containerRef.current.contains(event.relatedTarget as Node)) {
            setIsFocused(false);
        }
    }, []);
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (!isFocused) {
                return;
            }

            const current = focusedRef.current;
            const children = contentRef.current?.children;

            if (children && current && event.key === "ArrowDown") {
                const i = Array.prototype.indexOf.call(children, current) + 1;
                const next = (i >= children.length ? children[0] : children[i]) as HTMLDivElement;
                if (next) {
                    next.focus();
                }
                event.preventDefault();
            }
            if (children && current && event.key === "ArrowUp") {
                const i = Array.prototype.indexOf.call(children, current) - 1;
                const next = (i < 0 ? children[children.length - 1] : children[i]) as HTMLDivElement;
                if (next) {
                    next.focus();
                }
                event.preventDefault();
            }
        },
        [isFocused],
    );
    const handleItemClick = useCallback(
        (item: IUiNavigationItem) => {
            // Handle click on item callback if provided
            if (onItemClick) {
                onItemClick(item);
                return;
            }
            //By default, focus the target element by id
            const targetElement = document.getElementById(item.targetId);
            if (targetElement) {
                targetElement.focus();
            }
        },
        [onItemClick],
    );
    const handleItemFocus = useCallback((el: HTMLDivElement) => {
        focusedRef.current = el;
    }, []);

    const labelId = useMemo(() => {
        const hash = uuid().substring(0, 5);
        return `nb-${hash}`;
    }, []);

    return (
        <>
            <div
                role="menu"
                className={b()}
                style={style}
                ref={containerRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                aria-labelledby={labelId}
            >
                <div className={e("dropdown", { isFocused })} ref={contentRef}>
                    {items.map((item) => (
                        <UiNavigationItem
                            key={item.id}
                            item={item}
                            onItemClick={handleItemClick}
                            onItemFocus={handleItemFocus}
                        />
                    ))}
                </div>
            </div>
            <span style={{ display: "none" }} id={labelId}>
                {label}
            </span>
        </>
    );
}

function UiNavigationItem({ item, onItemClick, onItemFocus }: IUiNavigationBypassItem) {
    const { id, name, tabIndex } = item;

    const handleClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            onItemClick(item);
        },
        [onItemClick, item],
    );
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onItemClick(item);
            }
        },
        [onItemClick, item],
    );
    const handleFocus = useCallback(
        (e: FocusEvent<HTMLDivElement>) => {
            onItemFocus(e.target as HTMLDivElement);
        },
        [onItemFocus],
    );

    return (
        <div
            key={id}
            role="menuitem"
            tabIndex={tabIndex ?? 0}
            className={e("dropdown-item")}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
        >
            {name}
        </div>
    );
}
