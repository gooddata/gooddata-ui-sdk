// (C) 2025-2026 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";

import { formatValueForTooltip } from "../../map/style/tooltipFormatting.js";
import { type JsonValue } from "../../utils/guards.js";

export type TooltipPayload = {
    title: string;
    value?: string | number;
    format?: string;
    attrId?: string;
    fill?: string;
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
    const fill = typeof parsed["fill"] === "string" ? parsed["fill"] : undefined;

    return {
        title,
        value,
        format,
        attrId,
        fill,
    };
}

export function isTooltipPayloadValid(item: JsonValue): boolean {
    return Boolean(parseTooltipPayload(item));
}

export function dedupeAttributePayloadsByAttrId(
    payloads: Array<TooltipPayload | undefined>,
): Array<TooltipPayload | undefined> {
    const seenAttrIds = new Set<string>();
    return payloads.map((payload) => {
        if (!payload?.attrId) {
            return payload;
        }
        if (seenAttrIds.has(payload.attrId)) {
            return undefined;
        }
        seenAttrIds.add(payload.attrId);
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
