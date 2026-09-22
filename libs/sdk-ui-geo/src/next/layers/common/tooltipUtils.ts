// (C) 2025-2026 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";
import { labelKey } from "@gooddata/sdk-ui-vis-commons";

import { formatValueForTooltip } from "../../map/style/tooltipFormatting.js";
import { type JsonValue } from "../../utils/guards.js";
import { type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

export type TooltipPayload = {
    title: string;
    value?: string | number;
    format?: string;
    attrId?: string;
    /**
     * Attribute element URI. By convention only set by attribute payload
     * writers (locationName, segment, tooltipText). Used by the custom-tooltip
     * execution path to build per-feature lookup keys.
     */
    uri?: string;
    /**
     * Bucket `localIdentifier` of the underlying attribute. By convention only set by
     * attribute payload writers (locationName, segment, tooltipText) — the mirror of
     * {@link TooltipPayload.localId} for measures, and used the same way: as the lookup key
     * into `ITooltipReferenceMaps.attributes`, which yields the reference keys the value is
     * published under.
     *
     * Separate from {@link TooltipPayload.attrId} because that one is the LDM identifier
     * saying WHICH attribute a slot holds, and an LDM identifier is unique only within an
     * object type: a label and a computed attribute may share one, so the identifier alone
     * cannot say which of the two a value belongs to. A localIdentifier is unique within the
     * execution.
     */
    attrLocalId?: string;
    fill?: string;
    /**
     * Bucket `localIdentifier` of the underlying measure. By convention only
     * set by measure payload writers (size, color, items in `measures[]`);
     * the parser doesn't constrain other slots. Used by the custom-tooltip
     * resolver as the lookup key into `ITooltipReferenceMaps.measures` to
     * find the LDM identifier referenced as `{metric/<id>}`.
     */
    localId?: string;
};

function isPayloadRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

export function getTooltipProperties(
    properties: GeoJSON.GeoJsonProperties | undefined,
): Record<string, JsonValue> {
    if (properties && typeof properties === "object") {
        return properties as Record<string, JsonValue>;
    }
    return {};
}

export function parseTooltipPayload(item: JsonValue): TooltipPayload | undefined {
    let parsed: JsonValue = item;
    if (typeof item === "string") {
        try {
            parsed = JSON.parse(item) as JsonValue;
        } catch {
            return undefined;
        }
    }

    if (!isPayloadRecord(parsed)) {
        return undefined;
    }

    const title = parsed["title"];
    if (typeof title !== "string" || title.length === 0) {
        return undefined;
    }

    const rawValue = parsed["value"];
    const value = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : undefined;
    const format = typeof parsed["format"] === "string" ? parsed["format"] : undefined;
    const attrId = typeof parsed["attrId"] === "string" ? parsed["attrId"] : undefined;
    const uri = typeof parsed["uri"] === "string" ? parsed["uri"] : undefined;
    const attrLocalId = typeof parsed["attrLocalId"] === "string" ? parsed["attrLocalId"] : undefined;
    const fill = typeof parsed["fill"] === "string" ? parsed["fill"] : undefined;
    const localId = typeof parsed["localId"] === "string" ? parsed["localId"] : undefined;

    return {
        title,
        value,
        format,
        attrId,
        attrLocalId,
        uri,
        fill,
        localId,
    };
}

export function isTooltipPayloadValid(item: JsonValue): boolean {
    return Boolean(parseTooltipPayload(item));
}

/**
 * Drops the later of two attribute payloads that show the same display form, so a label used
 * both as location/area and as segment-by appears once in the tooltip.
 *
 * The identity is the typed reference key of the display form, not the bare LDM identifier: an
 * LDM identifier is unique only within an object type, so a label and a computed attribute may
 * share one, and those are two different objects that both belong in the tooltip. The key comes
 * from the reference maps, looked up by the payload's localIdentifier; a payload the maps cannot
 * place is treated as a label, which is what it would have resolved as before.
 *
 * @internal
 */
export function dedupeAttributePayloads(
    payloads: Array<TooltipPayload | undefined>,
    referenceMaps: ITooltipReferenceMaps | undefined,
): Array<TooltipPayload | undefined> {
    const attributeKeysByLocalId = referenceMaps?.attributes ?? {};
    const seen = new Set<string>();
    return payloads.map((payload) => {
        if (!payload?.attrId) {
            return payload;
        }
        const keys = payload.attrLocalId ? attributeKeysByLocalId[payload.attrLocalId] : undefined;
        const identity = keys?.displayFormKey ?? labelKey(payload.attrId);
        if (seen.has(identity)) {
            return undefined;
        }
        seen.add(identity);
        return payload;
    });
}

export type TooltipFormatConfig = {
    emptyValue: string;
    escape: (value: string) => string;
};

export function buildTooltipItemHtml(
    title: string,
    valueHtml: string,
    escapeTitle: (value: string) => string,
): string {
    return `<div class="gd-viz-tooltip-item">
                <span class="gd-viz-tooltip-title">${escapeTitle(title)}</span>
                <div class="gd-viz-tooltip-value-wraper">
                    <span class="gd-viz-tooltip-value">${valueHtml}</span>
                </div>
            </div>`;
}

export function formatAttributeHtml(
    payload: TooltipPayload | undefined,
    config: TooltipFormatConfig,
): string | null {
    if (!payload?.title) {
        return null;
    }

    const rawValue = payload.value ?? config.emptyValue;
    const valueHtml = config.escape(String(rawValue));
    return buildTooltipItemHtml(payload.title, valueHtml, config.escape);
}

export function formatMeasureHtml(
    payload: TooltipPayload | undefined,
    separators: ISeparators | undefined,
    config: TooltipFormatConfig,
): string | null {
    if (!payload?.title) {
        return null;
    }

    if (typeof payload.value === "number" && Number.isFinite(payload.value)) {
        const formattedValue = formatValueForTooltip(payload.value, payload.format, separators);
        return buildTooltipItemHtml(payload.title, formattedValue, config.escape);
    }

    const valueHtml = config.escape(config.emptyValue);
    return buildTooltipItemHtml(payload.title, valueHtml, config.escape);
}
