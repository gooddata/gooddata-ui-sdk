// (C) 2026 GoodData Corporation

import type { Bucket, Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { getFullBucket } from "../utils/sharedUtils.js";

import { type ConfigDefaults, type ConfigEntry, getValueOrDefault, saveConfigObject } from "./utils.js";

/**
 * Secondary axis of a dual-axis line, column or bar chart. It is the right axis of line and column
 * charts (`secondary_yaxis`) and the top axis of bar charts (`secondary_xaxis`).
 *
 * @internal
 */
export type SecondaryAxisProperties = {
    measures: string[];
    format: "inherit" | "auto";
    max: number | string;
    min: number | string;
    name: {
        visible: boolean;
        position: "center" | "left" | "right" | "auto";
    };
    labelsEnabled: boolean;
    rotation: "0" | "30" | "60" | "90" | "auto";
    visible: boolean;
};

/** @internal */
export const SECONDARY_AXIS_DEFAULTS: ConfigDefaults<SecondaryAxisProperties> = {
    measures: [],
    format: "auto",
    max: "",
    min: "",
    name: {
        visible: true,
        position: "auto",
    },
    labelsEnabled: true,
    rotation: "auto",
    visible: true,
};

/**
 * Prefix of the AAC config keys that hold the secondary axis settings.
 */
type SecondaryAxisConfigPrefix = "yaxis_secondary" | "xaxis_secondary";

/**
 * Converts the stored secondary axis settings to AAC config entries. The measures on the axis are not
 * part of the config, they are expressed as `axis: secondary` on the metrics instead.
 *
 * @internal
 */
export function loadSecondaryAxis(
    value: Partial<SecondaryAxisProperties>,
    prefix: SecondaryAxisConfigPrefix,
): ConfigEntry[] {
    const defaults = SECONDARY_AXIS_DEFAULTS;
    return [
        [`${prefix}_format`, getValueOrDefault(value.format, defaults.format)],
        [`${prefix}_max`, getValueOrDefault(value.max, defaults.max, "number")],
        [`${prefix}_min`, getValueOrDefault(value.min, defaults.min, "number")],
        [`${prefix}_name_position`, getValueOrDefault(value.name?.position, defaults.name.position)],
        [`${prefix}_name_visible`, getValueOrDefault(value.name?.visible, defaults.name.visible, "bool")],
        [`${prefix}_rotation`, getValueOrDefault(value.rotation, defaults.rotation)],
        [`${prefix}_visible`, getValueOrDefault(value.visible, defaults.visible, "bool")],
        [`${prefix}_labels`, getValueOrDefault(value.labelsEnabled, defaults.labelsEnabled, "bool")],
    ];
}

/**
 * Builds the stored secondary axis settings from the AAC config and from the metrics marked with
 * `axis: secondary`.
 *
 * @internal
 */
export function saveSecondaryAxis(
    config: NonNullable<Visualisation["config"]>,
    prefix: SecondaryAxisConfigPrefix,
    metrics: Bucket[] = [],
): SecondaryAxisProperties | undefined {
    const defaults = SECONDARY_AXIS_DEFAULTS;
    const measures = metrics
        .map(getFullBucket)
        .filter((bucket) => bucket.axis === "secondary" && bucket.field)
        .map((bucket) => bucket.field as string);

    return saveConfigObject({
        measures: measures.length > 0 ? measures : undefined,
        format: getValueOrDefault(config[`${prefix}_format`], defaults.format),
        max: getValueOrDefault(config[`${prefix}_max`], defaults.max),
        min: getValueOrDefault(config[`${prefix}_min`], defaults.min),
        name: saveConfigObject({
            position: getValueOrDefault(config[`${prefix}_name_position`], defaults.name.position),
            visible: getValueOrDefault(config[`${prefix}_name_visible`], defaults.name.visible, "bool"),
        }),
        rotation: getValueOrDefault(config[`${prefix}_rotation`], defaults.rotation),
        visible: getValueOrDefault(config[`${prefix}_visible`], defaults.visible, "bool"),
        labelsEnabled: getValueOrDefault(config[`${prefix}_labels`], defaults.labelsEnabled, "bool"),
    } as Partial<SecondaryAxisProperties>) as SecondaryAxisProperties | undefined;
}
