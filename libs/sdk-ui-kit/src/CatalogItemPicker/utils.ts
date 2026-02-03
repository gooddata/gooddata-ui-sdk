// (C) 2026 GoodData Corporation

import { objRefToString } from "@gooddata/sdk-model";

import { type ICatalogGroup, type ICatalogItemPickerItem } from "./types.js";

export const getDateDatasetOptions = (items: ICatalogItemPickerItem[]) => {
    const optionsMap = new Map<string, string>();
    items
        .filter((item) => item.type === "date" && item.dataset)
        .forEach((item) => {
            const key = objRefToString(item.dataset!.identifier);
            optionsMap.set(key, item.dataset!.title);
        });
    return Array.from(optionsMap.entries())
        .map(([key, title]) => ({ key, title }))
        .sort((a, b) => a.title.localeCompare(b.title));
};

export const groupMetricCatalogItems = (
    items: ICatalogItemPickerItem[],
    groups: ICatalogGroup[] | undefined,
    ungroupedTitle: string,
) => {
    const groupTitleById = new Map(groups?.map((group) => [group.id, group.title]) ?? []);
    const { groupsById, ungrouped } = items.reduce(
        (acc, item) => {
            const groupIds = item.groupIds ?? [];
            if (groupIds.length === 0) {
                acc.ungrouped.push(item);
                return acc;
            }
            groupIds.forEach((groupId) => {
                const title = groupTitleById.get(groupId) ?? ungroupedTitle;
                if (!acc.groupsById.has(groupId)) {
                    acc.groupsById.set(groupId, { title, items: [] });
                }
                acc.groupsById.get(groupId)!.items.push(item);
            });
            return acc;
        },
        {
            groupsById: new Map<string, { title: string; items: ICatalogItemPickerItem[] }>(),
            ungrouped: [] as ICatalogItemPickerItem[],
        },
    );

    const orderedGroups: Array<{ title: string; items: ICatalogItemPickerItem[] }> =
        groups && groups.length > 0
            ? groups
                  .map((group) => groupsById.get(group.id))
                  .filter((group): group is { title: string; items: ICatalogItemPickerItem[] } => !!group)
            : Array.from(groupsById.values());

    if (ungrouped.length > 0) {
        orderedGroups.push({ title: ungroupedTitle, items: ungrouped });
    }

    return orderedGroups;
};
