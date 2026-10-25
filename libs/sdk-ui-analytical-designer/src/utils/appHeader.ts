// (C) 2022-2026 GoodData Corporation

import { createIntl, createIntlCache, defineMessage } from "react-intl";

import { resolveLocale } from "@gooddata/sdk-ui";
import { type IHeaderMenuItem, generateHeaderStaticHelpMenuItems } from "@gooddata/sdk-ui-kit";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, resolveMessages } from "./translations.js";

// AD-specific contextual help links. Keys are intl message IDs resolved from AD's own translation
// bundle — the host shell knows nothing about these strings.
const contextualHelpMenuItems: IHeaderMenuItem[] = [
    {
        key: defineMessage({ id: "gs.header.helpMenu.firstSteps" }).id,
        href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/create-visualizations/analytical-designer/",
        target: "_blank",
    },
    {
        key: defineMessage({ id: "gs.header.helpMenu.visualizing" }).id,
        href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/create-visualizations/visualization-types/",
        target: "_blank",
    },
    {
        key: defineMessage({ id: "gs.header.helpMenu.sorting" }).id,
        href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/create-visualizations/manage-visualizations/",
        target: "_blank",
    },
    {
        key: defineMessage({ id: "gs.header.helpMenu.embedding" }).id,
        href: "https://www.gooddata.com/developers/cloud-native/doc/cloud/embed-visualizations/iframes/#embed-the-analytical-designer",
        target: "_blank",
        className: "gd-menu-item-divider",
    },
];

const staticHelpMenuItems: IHeaderMenuItem[] = generateHeaderStaticHelpMenuItems();

const intlCache = createIntlCache();

// Resolves the full menu (contextual + static) to label-bearing items so the host renders the whole
// dropdown in a single, locale-consistent language — static keys are not left for the host intl to
// resolve, which would flip them to the host locale independently and briefly mix languages.
const buildHelpMenuItems = (intl: ReturnType<typeof createIntl>): IHeaderMenuItem[] =>
    [...contextualHelpMenuItems, ...staticHelpMenuItems].map((item) => ({
        ...item,
        label: intl.formatMessage({ id: item.key }),
    }));

/**
 * Builds the AD help menu with all labels resolved from AD's eagerly-loaded default (en-US) messages.
 * Synchronous, so the pluggable mount can push a complete, correct menu immediately and avoid a flash
 * of the host's generic fallback while the localized bundle loads. (LX-2573)
 */
export const getHelpMenuItems = (): IHeaderMenuItem[] =>
    buildHelpMenuItems(
        createIntl({ locale: DEFAULT_LANGUAGE, messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE] }, intlCache),
    );

/**
 * Builds the AD help menu with all labels resolved from AD's own translations for the given locale.
 * Used by the pluggable mount to push help items to the host header: the host renders `item.label`
 * directly, so it needs no knowledge of AD-specific help-menu strings. (LX-2573)
 */
export const getTranslatedHelpMenuItemsForLocale = async (locale?: string): Promise<IHeaderMenuItem[]> => {
    const resolvedLocale = resolveLocale(locale ?? DEFAULT_LANGUAGE);
    const messages = await resolveMessages(resolvedLocale);
    return buildHelpMenuItems(createIntl({ locale: resolvedLocale, messages }, intlCache));
};
