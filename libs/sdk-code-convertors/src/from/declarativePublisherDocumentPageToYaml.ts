// (C) 2026 GoodData Corporation

import { Pair, YAMLMap, YAMLSeq } from "yaml";

import { type DeclarativeFilterContext } from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IPublisherBoxStyle,
    type IPublisherDocumentPage,
    type IPublisherImageSlot,
    type IPublisherPageBody,
    type IPublisherSlotPlaceholder,
    type IPublisherTextSlot,
    type IPublisherTextStyle,
    type IPublisherVisualizationSlot,
    type PublisherPageLayoutNode,
    type PublisherSlot,
    type PublisherTextSource,
    dashboardFilterReferenceObjRef,
    isPublisherImageBackground,
    isPublisherImageSlot,
    isPublisherLayoutSection,
    isPublisherTextSlot,
    isPublisherVisualizationSlot,
    objRefToString,
} from "@gooddata/sdk-model";

import { CoreErrorCode, newError } from "../utils/errors.js";
import { referencesAsWritten } from "../utils/publisherFilterRefs.js";
import { getIdentifier } from "../utils/yamlUtils.js";

import { declarativeFilterContextToYaml } from "./declarativeDashboardToYaml.js";

/**
 * A document holds its filters the way a dashboard's filter context does, so the same convertor writes
 * them; only the envelope it expects is put around them here.
 *
 * @internal
 */
export function filtersToYaml(filters: FilterContextItem[] | undefined): YAMLMap | undefined {
    if (!filters?.length) {
        return undefined;
    }
    const { filters: written } = declarativeFilterContextToYaml(undefined, {
        content: { filters: referencesAsWritten(filters), version: "2" },
    } as DeclarativeFilterContext);
    return emptyToUndefined(written);
}

/**
 * Collapses a mapping that says only one thing down to that thing, the way a bucket with nothing
 * but a `using` is written as the field it uses.
 */
function shorten(map: YAMLMap, soloKeys: string[]): unknown | undefined {
    if (map.items.length !== 1) {
        return undefined;
    }
    const [item] = map.items;
    return soloKeys.includes(item.key as string) ? item.value : undefined;
}

function add(map: YAMLMap, key: string, value: unknown): void {
    if (value !== undefined) {
        map.add(new Pair(key, value));
    }
}

/** @internal */
export function mapOf(entries: Array<[string, unknown]>): YAMLMap {
    const map = new YAMLMap();
    for (const [key, value] of entries) {
        add(map, key, value);
    }
    return map;
}

function emptyToUndefined(map: YAMLMap): YAMLMap | undefined {
    return map.items.length === 0 ? undefined : map;
}

function placeholderToYaml(placeholder: IPublisherSlotPlaceholder | undefined): unknown | undefined {
    if (placeholder === undefined) {
        return undefined;
    }
    const map = mapOf([
        ["hint", placeholder.hint],
        ["required", placeholder.required],
    ]);
    // A placeholder saying only that it is required is written as `true`, one saying only what to
    // put there as that hint.
    return shorten(map, ["hint", "required"]) ?? emptyToUndefined(map);
}

function textToYaml(source: PublisherTextSource | undefined): unknown | undefined {
    if (source === undefined) {
        return undefined;
    }
    if (source.type === "static") {
        return source.content;
    }
    return mapOf([
        ["prompt", source.prompt],
        ["text", source.content],
        ["generated_at", source.generatedAt],
    ]);
}

function textStyleToYaml(
    style: IPublisherTextStyle | undefined,
    page: IPageBeingWritten,
): unknown | undefined {
    if (style === undefined) {
        return undefined;
    }
    const map = mapOf([
        ["type", (style as { type?: string }).type],
        ["color", style.color],
        ["horizontal_align", style.horizontalAlign],
        ["vertical_align", style.verticalAlign],
        ["background", backgroundToYaml(style.background, page)],
        ["border_radius", style.borderRadius],
        ["padding", style.padding],
    ]);
    return shorten(map, ["type"]) ?? emptyToUndefined(map);
}

function imageStyleToYaml(style: IPublisherImageSlot["style"]): YAMLMap | undefined {
    if (style === undefined) {
        return undefined;
    }
    return emptyToUndefined(
        mapOf([
            ["horizontal_align", style.horizontalAlign],
            ["vertical_align", style.verticalAlign],
        ]),
    );
}

/** The image itself, without the identity of whatever draws it. */
function imageContentToYaml(slot: IPublisherImageSlot): unknown {
    const source = slot.source;
    const map = mapOf([
        ["url", source?.type === "url" ? source.url : undefined],
        ["asset", source?.type === "asset" ? objRefToString(source.ref) : undefined],
        ["alt_text", slot.altText],
        ["fit", slot.fit],
        ["style", imageStyleToYaml(slot.style)],
        ["placeholder", placeholderToYaml(slot.placeholder)],
    ]);
    return shorten(map, ["url"]) ?? map;
}

/**
 * A page being written out: the slots it can still draw from, the slots the tree places, and the
 * backdrops already written down, so nothing is written twice under two different boxes.
 */
interface IPageBeingWritten {
    slotsById: Map<string, PublisherSlot>;
    placedByLayout: Set<string>;
    writtenBackdrops: Set<string>;
}

function placedSlotIds(node: PublisherPageLayoutNode, into: Set<string>): Set<string> {
    if (isPublisherLayoutSection(node)) {
        for (const child of node.children) {
            placedSlotIds(child, into);
        }
    } else {
        into.add(node.slotId);
    }
    return into;
}

function backgroundToYaml(
    background: IPublisherBoxStyle["background"],
    page: IPageBeingWritten,
): unknown | undefined {
    if (background === undefined) {
        return undefined;
    }
    if (!isPublisherImageBackground(background)) {
        return background.color;
    }

    const { slotId } = background;

    // A slot the tree also places writes itself there, and one already written under another box
    // stands where it was written: either way this box only names it, so the page holds it once.
    if (page.placedByLayout.has(slotId) || page.writtenBackdrops.has(slotId)) {
        return mapOf([["image", mapOf([["ref", slotId]])]]);
    }
    page.writtenBackdrops.add(slotId);

    const slot = page.slotsById.get(slotId);
    // A backdrop naming a slot the page does not hold paints nothing, and is written as the bare
    // reference it is rather than invented content.
    if (slot === undefined || !isPublisherImageSlot(slot)) {
        return mapOf([["image", mapOf([["ref", slotId]])]]);
    }

    const content = imageContentToYaml(slot);
    const entries: Array<[string, unknown]> =
        content instanceof YAMLMap
            ? content.items.map((item) => [item.key as string, item.value] as [string, unknown])
            : [["url", content]];
    return mapOf([["image", mapOf([["id", slotId] as [string, unknown], ...entries])]]);
}

function boxStyleToYaml(style: IPublisherBoxStyle | undefined, page: IPageBeingWritten): YAMLMap | undefined {
    if (style === undefined) {
        return undefined;
    }
    return emptyToUndefined(
        mapOf([
            ["background", backgroundToYaml(style.background, page)],
            ["border_radius", style.borderRadius],
            ["padding", style.padding],
        ]),
    );
}

function visualizationSlotToYaml(slot: IPublisherVisualizationSlot, weight: number | undefined): YAMLMap {
    // A hidden title with no text to keep is written as `title: false`, which says both at once;
    // every other combination states the two separately, so neither is lost.
    const hiddenWithNoText = slot.showTitle === false && slot.title === undefined;

    return mapOf([
        ["id", slot.localIdentifier],
        ["weight", weight],
        ["visualization", slot.insight === undefined ? null : objRefToString(slot.insight)],
        ["title", hiddenWithNoText ? false : slot.title],
        ["show_title", hiddenWithNoText ? undefined : slot.showTitle],
        ["properties", slot.properties],
        ["date", slot.dateDataSet === undefined ? undefined : objRefToString(slot.dateDataSet)],
        ["ignore_report_period", slot.ignoreReportPeriod],
        ["filters", filtersToYaml(slot.filters)],
        [
            "ignored_filters",
            slot.ignoredFilters?.length
                ? slot.ignoredFilters.map((reference) =>
                      getIdentifier(referencesAsWritten(dashboardFilterReferenceObjRef(reference))),
                  )
                : undefined,
        ],
        ["placeholder", placeholderToYaml(slot.placeholder)],
    ]);
}

function textSlotToYaml(
    slot: IPublisherTextSlot,
    weight: number | undefined,
    page: IPageBeingWritten,
): YAMLMap {
    return mapOf([
        ["id", slot.localIdentifier],
        ["weight", weight],
        [slot.type, textToYaml(slot.source) ?? ""],
        ["style", textStyleToYaml(slot.style, page)],
        ["placeholder", placeholderToYaml(slot.placeholder)],
    ]);
}

function imageSlotToYaml(slot: IPublisherImageSlot, weight: number | undefined): YAMLMap {
    return mapOf([
        ["id", slot.localIdentifier],
        ["weight", weight],
        ["image", imageContentToYaml(slot)],
    ]);
}

function layoutNodeToYaml(node: PublisherPageLayoutNode, page: IPageBeingWritten): YAMLMap {
    if (isPublisherLayoutSection(node)) {
        const children = new YAMLSeq();
        for (const child of node.children) {
            children.add(layoutNodeToYaml(child, page));
        }
        return mapOf([
            ["weight", node.weight],
            [node.direction, children],
            ["style", boxStyleToYaml(node.style, page)],
        ]);
    }

    const slot = page.slotsById.get(node.slotId);
    if (slot === undefined) {
        // A leaf naming a slot the page does not hold renders as an empty area, and is written as
        // the empty visualization it behaves like rather than dropped.
        return mapOf([
            ["id", node.slotId],
            ["weight", node.weight],
            ["visualization", null],
        ]);
    }
    if (isPublisherVisualizationSlot(slot)) {
        return visualizationSlotToYaml(slot, node.weight);
    }
    if (isPublisherTextSlot(slot)) {
        return textSlotToYaml(slot, node.weight, page);
    }
    if (isPublisherImageSlot(slot)) {
        return imageSlotToYaml(slot, node.weight);
    }
    // A slot of a kind this version does not know cannot be written without saying it is something
    // it is not, so the page is refused rather than quietly rewritten into a shape it never had.
    throw newError(CoreErrorCode.ItemNotSupported, [JSON.stringify({ slot: (slot as PublisherSlot).type })]);
}

/**
 * Writes a page out as the single tree it is authored as: the geometry and the slots it places
 * become one, and a slot only a box paints with is written under that box.
 *
 * A slot nothing points at is written nowhere, so it is gone once the document is read back. That
 * is what the page model asks for - every slot is placed - and what the editor does on its own when
 * the box painted with an image is repainted.
 *
 * @internal
 */
export function publisherPageBodyEntries(body: IPublisherPageBody): Array<[string, unknown]> {
    const page: IPageBeingWritten = {
        slotsById: new Map(body.slots.map((slot) => [slot.localIdentifier, slot])),
        placedByLayout: placedSlotIds(body.layout, new Set()),
        writtenBackdrops: new Set(),
    };

    // The page's own paint is written first, so a backdrop it shares with a box inside it is
    // written down at the page and only named further in.
    const style = boxStyleToYaml(body.style, page);
    const layout = layoutNodeToYaml(body.layout, page);

    return [
        ["kind", body.kind],
        ["format", body.format],
        ["style", style],
        ["layout", layout],
        ["filters", filtersToYaml(body.filters)],
    ];
}

/** @internal */
export function declarativePublisherDocumentPageToYaml(body: IPublisherDocumentPage): YAMLMap {
    return mapOf([["id", body.localIdentifier] as [string, unknown], ...publisherPageBodyEntries(body)]);
}
