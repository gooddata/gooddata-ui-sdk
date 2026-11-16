// (C) 2026 GoodData Corporation

import { useContext } from "react";

import { IntlContext, type IntlShape, createIntl } from "react-intl";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../translations/translations.js";
import { type ITabsProps } from "../Tabs.data.js";

/**
 * The accessible names of the tab strip's controls.
 */
export interface ITabsLabels {
    tabList: string;
    create: string;
    minimize: string;
    maximize: string;
    exitMaximize: string;
    close: string;
    closeTab: (title: string) => string;
    scrollLeft: string;
    scrollRight: string;
}

let fallbackIntl: IntlShape | undefined;

// Outside an IntlProvider (a bare render) the names still come from the default messages.
function getFallbackIntl(): IntlShape {
    fallbackIntl ??= createIntl({ locale: DEFAULT_LANGUAGE, messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE] });
    return fallbackIntl;
}

/**
 * Every icon-only control needs an accessible name, so each one has a localized default; a label in
 * `locales` overrides it.
 */
export function useTabsLabels(locales: NonNullable<ITabsProps["locales"]>): ITabsLabels {
    const intl = useContext(IntlContext) ?? getFallbackIntl();

    return {
        tabList: locales.tabList ?? intl.formatMessage({ id: "metricComponent.tabs.tabList" }),
        create: locales.createTooltip ?? intl.formatMessage({ id: "metricComponent.createMetric.title" }),
        minimize: locales.minimize ?? intl.formatMessage({ id: "metricComponent.tabs.minimize" }),
        maximize: locales.maximize ?? intl.formatMessage({ id: "metricComponent.tabs.maximize" }),
        exitMaximize: locales.exitMaximize ?? intl.formatMessage({ id: "metricComponent.tabs.exitMaximize" }),
        close: locales.close ?? intl.formatMessage({ id: "metricComponent.tabs.close" }),
        closeTab:
            locales.closeTab ??
            ((title: string) => intl.formatMessage({ id: "metricComponent.tabs.closeTab" }, { title })),
        scrollLeft: locales.scrollLeft ?? intl.formatMessage({ id: "metricComponent.tabs.scrollLeft" }),
        scrollRight: locales.scrollRight ?? intl.formatMessage({ id: "metricComponent.tabs.scrollRight" }),
    };
}
