// (C) 2020-2025 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import noop from "lodash/noop.js";
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
export function Tabs(props: ITabsProps): JSX.Element {
    const {
        className = "",
        onTabSelect = noop,
        selectedTabId: propSelectedTabId = "",
        tabs = [] as ITab[],
    } = props;

    const [selectedTabId, setSelectedTabId] = useState<string>(propSelectedTabId || tabs?.[0]?.id);

    const selectTab = (tab: ITab): void => {
        const newSelectedTabId = tab?.id;
        const noChange = newSelectedTabId === selectedTabId;

        if (noChange) {
            return;
        }

        setSelectedTabId(newSelectedTabId);
        onTabSelect(tab);
    };

    const renderTab = (tab: ITab) => {
        const tabClassName = cx({
            "is-active": tab.id === selectedTabId,
            "gd-tab": true,
            [`s-${stringUtils.simplifyText(tab.id)}`]: true,
        });

        return (
            <div
                aria-label={stringUtils.simplifyText(tab.id)}
                className={tabClassName}
                key={tab.id}
                onClick={() => {
                    selectTab(tab);
                }}
                onKeyDown={(event) => {
                    if (isActionKey(event)) {
                        event.preventDefault();
                        selectTab(tab);
                    }
                }}
                role="tab"
                aria-selected={tab.id === selectedTabId}
                tabIndex={0}
            >
                <span>
                    {tab.icon ? <i className={tab.icon} /> : null}
                    {tab.iconOnly ? null : <FormattedMessage id={tab.id} values={tab.values ?? {}} />}
                </span>
            </div>
        );
    };

    const renderTabs = () => {
        return tabs.map(renderTab);
    };

    const classNames = cx(className, {
        "gd-tabs": true,
        small: true,
    });

    return (
        <div role="tablist" className={classNames}>
            {renderTabs()}
        </div>
    );
}
