// (C) 2020-2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { simplifyText } from "@gooddata/util";

import { isActionKey } from "../utils/events.js";

/**
 * @internal
 */
export type FormatXMLElementFn<T, R = string | T | (string | T)[]> = (parts: Array<string | T>) => R;

/**
 * @internal
 */
export interface ITab {
    id: string;
    values?: Record<
        string,
        string | number | boolean | null | undefined | Date | FormatXMLElementFn<string, string>
    >;
    iconOnly?: boolean;
    icon?: string;
}

/**
 * @internal
 */
export interface ITabsProps {
    className?: string;
    onTabSelect?: (tab: ITab) => void;
    selectedTabId?: string;
    tabs?: Array<ITab>;
}

/**
 * @internal
 */
export interface ITabsState {
    selectedTabId: string;
}

/**
 * @internal
 */
export function Tabs({
    className = "",
    onTabSelect = () => {},
    selectedTabId: propSelectedTabId = "",
    tabs = [] as ITab[],
}: ITabsProps): ReactElement {
    const [selectedTabId, setSelectedTabId] = useState<string>(propSelectedTabId || tabs?.[0]?.id);

    const selectTab = useCallback(
        (tab: ITab): void => {
            const newSelectedTabId = tab?.id;
            const noChange = newSelectedTabId === selectedTabId;

            if (noChange) {
                return;
            }

            setSelectedTabId(newSelectedTabId);
            onTabSelect(tab);
        },
        [selectedTabId, onTabSelect],
    );

    const renderTab = useCallback(
        (tab: ITab) => {
            const tabClassName = cx({
                "is-active": tab.id === selectedTabId,
                "gd-tab": true,
                [`s-${simplifyText(tab.id)}`]: true,
            });

            const handleClick = () => {
                selectTab(tab);
            };

            const handleKeyDown = (event: KeyboardEvent) => {
                if (isActionKey(event)) {
                    event.preventDefault();
                    selectTab(tab);
                }
            };

            return (
                <div
                    aria-label={simplifyText(tab.id)}
                    className={tabClassName}
                    key={tab.id}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    role="tab"
                    aria-selected={tab.id === selectedTabId}
                    tabIndex={0}
                    data-testid={`s-tab-${simplifyText(tab.id)}`}
                >
                    <span>
                        {tab.icon ? <i className={tab.icon} /> : null}
                        {tab.iconOnly ? null : (
                            <FormattedMessage
                                id={tab.id}
                                values={(tab.values ?? {}) as Record<string, string>}
                            />
                        )}
                    </span>
                </div>
            );
        },
        [selectedTabId, selectTab],
    );

    const renderedTabs = useMemo(() => {
        return tabs.map(renderTab);
    }, [tabs, renderTab]);

    const classNames = useMemo(
        () =>
            cx(className, {
                "gd-tabs": true,
                small: true,
            }),
        [className],
    );

    return (
        <div role="tablist" className={classNames}>
            {renderedTabs}
        </div>
    );
}
