// (C) 2025 GoodData Corporation

import { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { messages } from "./messages.js";
import { Dropdown } from "../../Dropdown/index.js";
import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import { bem } from "../@utils/bem.js";
import { makeTabsKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { UiButton } from "../UiButton/UiButton.js";
import { IUiListboxInteractiveItem } from "../UiListbox/types.js";
import { UiListbox } from "../UiListbox/UiListbox.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface UiTabsAccessibilityConfig extends IAccessibilityConfigBase {
    tabRole?: HTMLAttributes<HTMLElement>["role"];
}

/**
 * @internal
 */
export interface UiTabsProps {
    size?: SizeSmall | SizeMedium | SizeLarge;
    tabs: Array<UiTab>;
    onTabSelect: (tab: UiTab) => void;
    selectedTabId: string;
    accessibilityConfig?: UiTabsAccessibilityConfig;
    /**
     * Maximum length for tab labels. When exceeded, the label will be truncated with ellipsis
     * and the full label will be available via aria-label.
     */
    maxLabelLength?: number;
    /**
     * Enable overflow dropdown that appears when tabs don't fit in the container.
     * When true, a dropdown button will appear showing all tabs.
     */
    enableOverflowDropdown?: boolean;
}

/**
 * @internal
 */
export interface UiTab {
    id: string;
    label: string;
}

const { b, e } = bem("gd-ui-kit-tabs");

/**
 * Truncates a string to a maximum length and adds ellipsis
 */
function truncateLabel(label: string, maxLength?: number): string {
    if (!maxLength || label.length <= maxLength) {
        return label;
    }
    return label.slice(0, maxLength - 1) + "…";
}

/**
 * @internal
 */
interface UiTabsOverflowDropdownProps {
    tabs: UiTab[];
    selectedTabId: string;
    onTabSelect: (tab: UiTab) => void;
}

/**
 * Dropdown component that shows all tabs in a list when tabs overflow
 * @internal
 */
function UiTabsOverflowDropdown({ tabs, selectedTabId, onTabSelect }: UiTabsOverflowDropdownProps) {
    const intl = useIntl();

    // Convert tabs to listbox items for the overflow dropdown
    const listboxItems: IUiListboxInteractiveItem<UiTab>[] = useMemo(
        () =>
            tabs.map((tab) => ({
                type: "interactive" as const,
                id: tab.id,
                stringTitle: tab.label,
                data: tab,
            })),
        [tabs],
    );

    const handleDropdownSelect = useCallback(
        (item: IUiListboxInteractiveItem<UiTab>) => {
            onTabSelect(item.data);
        },
        [onTabSelect],
    );

    return (
        <div className={e("dropdown")}>
            <Dropdown
                renderButton={({ toggleDropdown, isOpen }) => (
                    <UiButton
                        label={intl.formatMessage(messages["all"])} // TODO INE: hide label in mobile view
                        iconAfter={isOpen ? "chevronUp" : "chevronDown"}
                        size={"small"}
                        variant="tertiary"
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage(messages["showAllTabs"]),
                            ariaExpanded: isOpen,
                        }}
                        onClick={toggleDropdown}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiListbox
                        items={listboxItems}
                        selectedItemId={selectedTabId}
                        onSelect={(item) => {
                            handleDropdownSelect(item);
                            closeDropdown();
                        }}
                        ariaAttributes={ariaAttributes}
                        maxWidth={160}
                        maxHeight={400}
                    />
                )}
                alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                closeOnEscape
                accessibilityConfig={{
                    triggerRole: "button",
                    popupRole: "listbox",
                }}
            />
        </div>
    );
}

/**
 * @internal
 */
export function UiTabs({
    size = "medium",
    tabs,
    onTabSelect,
    selectedTabId,
    accessibilityConfig,
    maxLabelLength,
    enableOverflowDropdown = false,
}: UiTabsProps) {
    const tabRefs = useRef<HTMLButtonElement[]>([]);
    const focusedIndexRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showOverflowDropdown, setShowOverflowDropdown] = useState(false);

    const focusTab = useCallback((index: number) => {
        tabRefs.current[index]?.focus();
    }, []);

    const handleKeyDown = useMemo(
        () =>
            makeTabsKeyboardNavigation({
                onFocusPrevious: () => {
                    const previousTabIndex = (focusedIndexRef.current - 1 + tabs.length) % tabs.length;
                    focusTab(previousTabIndex);
                },
                onFocusNext: () => {
                    const nextTabIndex = (focusedIndexRef.current + 1) % tabs.length;
                    focusTab(nextTabIndex);
                },
                onFocusFirst: () => {
                    focusTab(0);
                },
                onFocusLast: () => {
                    focusTab(tabs.length - 1);
                },
                onSelect: () => {
                    const focusedTab = tabs[focusedIndexRef.current];
                    onTabSelect(focusedTab);
                },
            }),
        [tabs, onTabSelect, focusTab],
    );

    // Check if tabs overflow the container
    useEffect(() => {
        if (!enableOverflowDropdown || !containerRef.current) {
            return undefined;
        }

        const containerElement = containerRef.current;

        const checkOverflow = () => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            const hasOverflow = container.scrollWidth > container.clientWidth;
            setShowOverflowDropdown(hasOverflow);
        };

        checkOverflow();

        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(containerElement);

        return () => {
            resizeObserver.disconnect();
        };
    }, [enableOverflowDropdown, tabs]);

    // Scroll to selected tab when selection changes
    useEffect(() => {
        const selectedIndex = tabs.findIndex((tab) => tab.id === selectedTabId);
        if (selectedIndex !== -1 && tabRefs.current[selectedIndex]) {
            tabRefs.current[selectedIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [selectedTabId, tabs]);

    const handleTabClick = useCallback(
        (tab: UiTab) => {
            onTabSelect(tab);
        },
        [onTabSelect],
    );

    const handleTabFocus = useCallback((index: number) => {
        focusedIndexRef.current = index;
    }, []);

    return (
        <div
            className={b({ size, overflow: enableOverflowDropdown })}
            aria-label={accessibilityConfig?.ariaLabel}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            aria-describedby={accessibilityConfig?.ariaDescribedBy}
            aria-expanded={accessibilityConfig?.ariaExpanded}
            role={accessibilityConfig?.role}
        >
            <div className={e("container")} ref={containerRef}>
                {tabs.map((tab, index) => {
                    const truncatedLabel = truncateLabel(tab.label, maxLabelLength);
                    const needsTruncation = truncatedLabel !== tab.label;

                    const button = (
                        <button
                            key={tab.id}
                            className={e("item", { selected: tab.id === selectedTabId })}
                            onClick={() => handleTabClick(tab)}
                            role={accessibilityConfig?.tabRole}
                            aria-selected={tab.id === selectedTabId}
                            aria-label={needsTruncation ? tab.label : undefined}
                            tabIndex={tab.id === selectedTabId ? 0 : -1}
                            ref={(el) => {
                                tabRefs.current[index] = el;
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => handleTabFocus(index)}
                        >
                            <span className={e("label")}>{truncatedLabel}</span>
                        </button>
                    );

                    return needsTruncation ? (
                        <UiTooltip
                            key={tab.id}
                            anchor={button}
                            content={tab.label}
                            triggerBy={["hover", "focus"]}
                            arrowPlacement="top"
                        />
                    ) : (
                        button
                    );
                })}
            </div>
            {Boolean(enableOverflowDropdown && showOverflowDropdown) && (
                <div className={e("dropdown-wrapper")}>
                    <UiTabsOverflowDropdown
                        tabs={tabs}
                        selectedTabId={selectedTabId}
                        onTabSelect={onTabSelect}
                    />
                </div>
            )}
        </div>
    );
}
