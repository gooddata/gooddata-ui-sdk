// (C) 2007-2026 GoodData Corporation

import { isEmpty, isEqual, isPlainObject, omit } from "lodash-es";

import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";
import { type ColumnWidthItem } from "@gooddata/sdk-ui-pivot";

import { type IVisualizationPropertiesControls } from "../../typings/properties.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);

function isRemovalEntry(item: unknown): boolean {
    return isRecord(item) && "color" in item && item["color"] === null;
}

/** Container-preserving map over the values of a controls record (or a bare list — pinned). */
function mapControlValues<C extends IVisualizationPropertiesControls | unknown[]>(
    controls: C,
    mapper: (value: unknown) => unknown,
): C {
    if (Array.isArray(controls)) {
        return controls.map(mapper) as C;
    }
    const result: IVisualizationPropertiesControls = {};
    for (const [key, value] of Object.entries(controls)) {
        result[key] = mapper(value);
    }
    return result as C;
}

function filterControlValues<C extends IVisualizationPropertiesControls | unknown[]>(
    controls: C,
    predicate: (value: unknown) => boolean,
): C {
    if (Array.isArray(controls)) {
        return controls.filter(predicate) as C;
    }
    const result: IVisualizationPropertiesControls = {};
    for (const [key, value] of Object.entries(controls)) {
        if (predicate(value)) {
            result[key] = value;
        }
    }
    return result as C;
}

// strips removal entries from list controls; a list emptied by the strip becomes null
function stripRemovalEntries<C extends IVisualizationPropertiesControls | unknown[]>(controls: C): C {
    return mapControlValues(controls, (value) => {
        if (!Array.isArray(value)) {
            return value;
        }
        const withoutRemovals = value.filter((item) => !isRemovalEntry(item));
        return withoutRemovals.length === 0 && withoutRemovals.length !== value.length
            ? null
            : withoutRemovals;
    });
}

/**
 * Merges a controls push into the stored controls. List-valued controls (colorMapping) merge by
 * entry id: an entry whose `color` is null is a REMOVAL INSTRUCTION for the stored entry with the
 * same id, a matching id replaces in place, an unknown id appends, and a list emptied by removals
 * drops the whole key. `undefined` over a stored list drops the key, `null` keeps the stored list.
 * Record-valued controls shallow-merge; primitives replace. `columnWidths`,
 * `thresholdMeasures` and `disableKeyDriveAnalysisOn` are replaced, never merged.
 */
export function joinControls(
    currentControls: IVisualizationPropertiesControls | undefined,
    newControls: IVisualizationPropertiesControls | undefined,
): IVisualizationPropertiesControls {
    const current: IVisualizationPropertiesControls = currentControls ?? {};
    const incoming: IVisualizationPropertiesControls = newControls ?? {};

    // declared-type extractions from the open controls bag
    const columnWidths = incoming["columnWidths"] as ColumnWidthItem[] | undefined;
    const thresholdMeasures = incoming["thresholdMeasures"] as string[] | undefined;
    const disableKeyDriveAnalysisOn = incoming["disableKeyDriveAnalysisOn"] as
        | Record<string, string>
        | undefined;

    let controls: IVisualizationPropertiesControls = { ...current };
    for (const [key, newItem] of Object.entries(incoming)) {
        if (!(key in current)) {
            controls[key] = newItem;
            continue;
        }
        const currentItem = current[key];

        if (Array.isArray(currentItem)) {
            // colorMapping
            if (newItem === undefined) {
                controls[key] = null;
                continue;
            }
            if (newItem === null) {
                continue;
            }

            let mergedList = currentItem;
            if (Array.isArray(newItem)) {
                for (const newListItem of newItem) {
                    const index = mergedList.findIndex((mergedListItem) => {
                        return isRecord(mergedListItem) && isRecord(newListItem)
                            ? mergedListItem["id"] === newListItem["id"]
                            : mergedListItem === newListItem;
                    });
                    // an entry with null color removes the stored entry with the same id
                    if (isRemovalEntry(newListItem)) {
                        if (index !== -1) {
                            mergedList = mergedList.filter((_, i) => i !== index);
                        }
                    } else if (index === -1) {
                        mergedList = [...mergedList, newListItem];
                    } else {
                        mergedList = mergedList.map((item, i) => (i === index ? newListItem : item));
                    }
                }
            }
            controls[key] = mergedList.length === 0 ? null : mergedList;
            continue;
        }

        if (isRecord(currentItem) && isRecord(newItem)) {
            // shallow merge, one level only
            controls[key] = { ...currentItem, ...newItem };
            continue;
        }
        controls[key] = newItem; // primitive type
    }

    // removal entries in lists the current state does not have yet must not be stored
    controls = stripRemovalEntries(controls);

    // column widths should be replaced not merged
    if (columnWidths) {
        controls = { ...controls, columnWidths };
    }
    // threshold measures should be replaced not merged
    if (thresholdMeasures) {
        controls = { ...controls, thresholdMeasures };
    }
    // disableKeyDriveAnalysisOn should be replaced not merged
    if (disableKeyDriveAnalysisOn) {
        controls = { ...controls, disableKeyDriveAnalysisOn };
    }
    return filterControlValues(controls, (value) => value !== null);
}

const isEmptyCollectionValue = (value: unknown): boolean =>
    Array.isArray(value) ? value.length === 0 : isRecord(value) && Object.keys(value).length === 0;

export function getMergedProperties(
    currentProperties: IVisualizationProperties | undefined,
    newProperties: IVisualizationProperties | undefined,
): IVisualizationProperties {
    const current: Record<string, unknown> = currentProperties ?? {};
    const incoming: Record<string, unknown> = newProperties ?? {};
    const currentControls = (current["controls"] || {}) as IVisualizationPropertiesControls;

    // Will deep merge controls properties and replace all others
    const reducedProperties: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(incoming)) {
        reducedProperties[key] =
            key === "controls"
                ? joinControls(currentControls, value as IVisualizationPropertiesControls)
                : value;
    }

    const controls = reducedProperties["controls"];
    if (!controls || isEmptyCollectionValue(controls)) {
        delete reducedProperties["controls"];
    }
    return reducedProperties as IVisualizationProperties;
}

export function removeInvalidControls(
    newControls: IVisualizationPropertiesControls | undefined,
): IVisualizationPropertiesControls {
    const incoming: IVisualizationPropertiesControls = newControls ?? {};

    // removal entries are merge instructions and must not be stored
    let filteredControls = filterControlValues(
        stripRemovalEntries(incoming),
        (value) => !(value === null || value === undefined),
    );
    const columnWidths = incoming["columnWidths"] as ColumnWidthItem[] | undefined;
    // column widths should be replaced
    if (columnWidths) {
        filteredControls = { ...filteredControls, columnWidths };
    }
    const thresholdMeasures = incoming["thresholdMeasures"] as string[] | undefined;
    // threshold measures should be replaced
    if (thresholdMeasures) {
        filteredControls = { ...filteredControls, thresholdMeasures };
    }
    const disableKeyDriveAnalysisOn = incoming["disableKeyDriveAnalysisOn"] as
        | Record<string, string>
        | undefined;
    // disableKeyDriveAnalysisOn should be replaced
    if (disableKeyDriveAnalysisOn) {
        filteredControls = { ...filteredControls, disableKeyDriveAnalysisOn };
    }
    return filteredControls;
}

export function getReplacedProperties(
    currentProperties: IVisualizationProperties | undefined,
    newProperties: IVisualizationProperties | undefined,
): IVisualizationProperties {
    const current: Record<string, unknown> = currentProperties ?? {};
    const incoming: Record<string, unknown> = newProperties ?? {};

    const result: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(incoming)) {
        // a falsy or empty-collection push keeps whatever the current properties hold for the key
        if (!value || isEmptyCollectionValue(value)) {
            continue;
        }
        result[key] =
            key === "controls" ? removeInvalidControls(value as IVisualizationPropertiesControls) : value;
    }
    return result as IVisualizationProperties;
}

/**
 * Drops an EMPTY `controls` bag, then answers `null` for properties that are empty afterwards —
 * the rule behind `VIS_PROPERTIES_INITIALIZED`'s extended-reference-point write, moved here from
 * the deleted properties apply reducer: it is a properties-domain rule the ERP leaf case
 * composes, exactly like {@link setDualAxisControl} below.
 *
 * The test is `isPlainObject && isEmpty`, not lodash `isEmpty` alone: `isEmpty` answers true for
 * `undefined` as well, so a MISSING `controls` — and a non-object one — must be left alone.
 */
export function sanitizeInitializedProperties(
    properties: IVisualizationProperties,
): IVisualizationProperties | null {
    const controls = properties?.controls;
    const supportedPropertiesBase =
        isPlainObject(controls) && isEmpty(controls) ? omit(properties, "controls") : properties;
    return isPlainObject(supportedPropertiesBase) && isEmpty(supportedPropertiesBase)
        ? null
        : supportedPropertiesBase;
}

/**
 * Sets the `dualAxis` control. The properties domain's own rule, exported as a narrow pure helper so
 * the buckets DUAL-AXIS operation can compose it without knowing where controls live.
 *
 * `BUCKET_TOGGLE_DUAL_AXIS` writes TWO domains — this control and every item's `showOnSecondaryAxis`
 * — and both land in ONE dispatch, so no half-applied state is observable.
 *
 * GUARDED on deep equality, for the same reason every other case in `properties_slice.ts` is:
 * identity is explicit, never inherited.
 */
export function setDualAxisControl(
    properties: IVisualizationProperties,
    value: boolean,
): IVisualizationProperties {
    const next: IVisualizationProperties = {
        ...properties,
        controls: { ...properties.controls, dualAxis: value },
    };

    return isEqual(properties, next) ? properties : next;
}
