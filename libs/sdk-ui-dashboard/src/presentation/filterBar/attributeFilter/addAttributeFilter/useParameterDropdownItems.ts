// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IdentifierRef } from "@gooddata/sdk-model";
import { groupParametersByTag } from "@gooddata/sdk-ui-kit";

import { type IStaticListItem } from "./staticListItems.js";

/**
 * Addable workspace parameter the dropdown's "parameters" tab offers (automation dialogs only).
 * `isFromDashboard` marks the ones with a control on the dashboard tab so they list first, `tags`
 * drive the tag groups.
 *
 * @internal
 */
export interface IAddableParameter {
    ref: IdentifierRef;
    title: string;
    isFromDashboard: boolean;
    tags: string[];
}

/**
 * Parameter row rendered in the dropdown's "parameters" tab.
 *
 * @internal
 */
export interface IParameterDropdownListItem {
    type: "parameter";
    ref: IdentifierRef;
    title: string;
}

export function isParameterDropdownListItem(item: unknown): item is IParameterDropdownListItem {
    return typeof item === "object" && item !== null && "type" in item && item.type === "parameter";
}

export type IParameterDropdownItem = IParameterDropdownListItem | IStaticListItem;

const messages = defineMessages({
    fromDashboard: { id: "attributesDropdown.parameters.section.from_dashboard" },
    ungrouped: { id: "attributesDropdown.parameters.section.ungrouped" },
});

interface IUseParameterDropdownItemsParams {
    parameters: IAddableParameter[];
    searchQuery: string;
}

export function useParameterDropdownItems({
    parameters,
    searchQuery,
}: IUseParameterDropdownItemsParams): IParameterDropdownItem[] {
    const intl = useIntl();
    const collator = useMemo(() => new Intl.Collator(intl.locale), [intl.locale]);

    return useMemo(() => {
        const needle = searchQuery.toLowerCase();
        const matching = needle
            ? parameters.filter((parameter) => parameter.title.toLowerCase().includes(needle))
            : parameters;
        const fromDashboard = matching
            .filter((parameter) => parameter.isFromDashboard)
            .sort((a, b) => collator.compare(a.title, b.title));
        const tagGroups = groupParametersByTag(matching, intl.formatMessage(messages.ungrouped), collator);
        const items: IParameterDropdownItem[] = [];

        if (fromDashboard.length > 0) {
            items.push({ type: "header", title: intl.formatMessage(messages.fromDashboard) });
            items.push(...fromDashboard.map(toListItem));
        }
        if (fromDashboard.length > 0 && tagGroups.length > 0) {
            items.push({ type: "separator" });
        }
        for (const group of tagGroups) {
            items.push({ type: "header", title: group.tag });
            items.push(...group.parameters.map(toListItem));
        }

        return items;
    }, [collator, intl, parameters, searchQuery]);
}

function toListItem({ ref, title }: IAddableParameter): IParameterDropdownListItem {
    return { type: "parameter", ref, title };
}
