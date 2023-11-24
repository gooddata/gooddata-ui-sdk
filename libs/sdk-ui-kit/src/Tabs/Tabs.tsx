// (C) 2020-2022 GoodData Corporation
import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import noop from "lodash/noop.js";

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
export class Tabs extends Component<ITabsProps, ITabsState> {
    static defaultProps = {
        className: "",
        onTabSelect: noop,
        selectedTabId: "",
        tabs: [] as ITab[],
    };

    constructor(props: ITabsProps) {
        super(props);

        this.state = {
            selectedTabId: props.selectedTabId || props.tabs?.[0]?.id,
        };
    }

    private selectTab(tab: ITab): void {
        const selectedTabId = tab?.id;
        const noChange = selectedTabId === this.state.selectedTabId;

        if (noChange) {
            return;
        }

        this.setState({
            selectedTabId,
        });

        this.props.onTabSelect(tab);
    }

    private renderTab(tab: ITab) {
        const tabClassName = cx({
            "is-active": tab.id === this.state.selectedTabId,
            "gd-tab": true,
            [`s-${stringUtils.simplifyText(tab.id)}`]: true,
        });

        return (
            <div
                aria-label={stringUtils.simplifyText(tab.id)}
                className={tabClassName}
                key={tab.id}
                onClick={() => {
                    this.selectTab(tab);
                }}
            >
                <span>
                    {tab.icon ? <i className={tab.icon} /> : null}
                    {tab.iconOnly ? null : <FormattedMessage id={tab.id} values={tab.values ?? {}} />}
                </span>
            </div>
        );
    }

    private renderTabs() {
        return this.props.tabs.map(this.renderTab, this);
    }

    public render(): JSX.Element {
        const classNames = cx(this.props.className, {
            "gd-tabs": true,
            small: true,
        });

        return (
            <div role="tabs" className={classNames}>
                {this.renderTabs()}
            </div>
        );
    }
}
