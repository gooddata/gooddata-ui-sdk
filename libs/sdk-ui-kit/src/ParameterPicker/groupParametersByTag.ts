// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export interface ITaggedParameter {
    title: string;
    tags?: string[];
}

/**
 * @internal
 */
export interface IParameterGroup<T extends ITaggedParameter> {
    tag: string;
    parameters: ReadonlyArray<T>;
}

/**
 * Groups parameters by their tags: tags are trimmed and merged case-insensitively, groups are
 * sorted by tag and parameters by title with `collator`, a parameter appears under each of its
 * tags, and untagged parameters go last under `ungroupedLabel`.
 *
 * @internal
 */
export function groupParametersByTag<T extends ITaggedParameter>(
    parameters: ReadonlyArray<T>,
    ungroupedLabel: string,
    collator: Intl.Collator,
): ReadonlyArray<IParameterGroup<T>> {
    const tagged = new Map<string, { tag: string; parameters: T[] }>();
    const untagged: T[] = [];

    for (const parameter of parameters) {
        const paramTagKeys = new Set<string>();
        for (const raw of parameter.tags ?? []) {
            const trimmed = raw.trim();
            if (!trimmed) {
                continue;
            }
            const key = trimmed.toLowerCase();
            if (paramTagKeys.has(key)) {
                continue;
            }
            paramTagKeys.add(key);
            const bucket = tagged.get(key);
            if (bucket) {
                bucket.parameters.push(parameter);
            } else {
                tagged.set(key, { tag: trimmed, parameters: [parameter] });
            }
        }

        if (paramTagKeys.size === 0) {
            untagged.push(parameter);
        }
    }

    const byTitle = (a: T, b: T) => collator.compare(a.title, b.title);
    const byTag = (a: { tag: string }, b: { tag: string }) => collator.compare(a.tag, b.tag);

    const sortedTagged = Array.from(tagged.values())
        .sort(byTag)
        .map(({ tag, parameters: groupParameters }) => ({
            tag,
            parameters: groupParameters.sort(byTitle),
        }));

    if (untagged.length === 0) {
        return sortedTagged;
    }

    return [...sortedTagged, { tag: ungroupedLabel, parameters: untagged.sort(byTitle) }];
}
