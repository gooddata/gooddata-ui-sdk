// (C) 2023-2026 GoodData Corporation

import { compact } from "lodash-es";

import { type IResultAttributeHeader } from "@gooddata/sdk-model";
import { type DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { type IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type ISeriesItem, type ISeriesNodeItem } from "../../typings/unsafe.js";

const KEYS = ["from", "to", "weight", "name"];
const DEFAULT_ATTRIBUTE_HEADER = "";
const DEFAULT_WEIGHT = 1;

type NodeKeyGetter = (item: IResultAttributeHeader | undefined) => string | undefined | null;

/**
 * Creates the function returning the identity of the node an element stands for. Nodes of both attributes
 * are matched by this identity.
 *
 * Elements of attributes with a number format are identified by their raw value: formatting may map
 * distinct values to the same text, which would merge their nodes. Other elements are identified by the
 * value they display.
 */
const createNodeKeyGetter = (
    attributeHeaders: (IUnwrappedAttributeHeadersWithItems | undefined | null)[],
): NodeKeyGetter => {
    const itemsWithNumberFormat = new Set(
        compact(attributeHeaders)
            .filter((attribute) => attribute.numberFormat)
            .flatMap((attribute) => attribute.items),
    );

    return (item) =>
        item && itemsWithNumberFormat.has(item)
            ? item.attributeHeaderItem.name
            : getMappingHeaderFormattedName(item);
};

const buildNodes = (
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    getNodeKey: NodeKeyGetter,
): ISeriesNodeItem[] => {
    return colorStrategy.getColorAssignment().map((colorAssignment, index) => {
        const headerItem = colorAssignment.headerItem as IResultAttributeHeader;
        const id = valueWithEmptyHandling(getNodeKey(headerItem), emptyHeaderTitle);
        const name = valueWithEmptyHandling(getMappingHeaderFormattedName(headerItem), emptyHeaderTitle);

        return {
            id,
            // the node shows its id unless it has a name of its own
            ...(name === id ? {} : { name }),
            color: colorStrategy.getColorByIndex(index),
        };
    });
};

const buildEmptyData = (dv: DataViewFacade) => {
    return [
        {
            from: DEFAULT_ATTRIBUTE_HEADER,
            to: DEFAULT_ATTRIBUTE_HEADER,
            weight: Number((dv.rawData().dataAt(0) as Array<number>)[0]) || DEFAULT_WEIGHT,
            name: DEFAULT_ATTRIBUTE_HEADER,
        },
    ];
};

const buildData = (
    dv: DataViewFacade,
    attributeHeaders: (IUnwrappedAttributeHeadersWithItems | undefined | null)[],
    emptyHeaderTitle: string,
    getNodeKey: NodeKeyGetter,
) => {
    const [from, to] = compact(attributeHeaders);
    const isExistingAttributeHeader = from || to;

    if (!isExistingAttributeHeader) {
        return buildEmptyData(dv);
    }

    return (dv.rawData().dataAt(0) as Array<number>).map((it, index) => {
        const fromValue = from && valueWithEmptyHandling(getNodeKey(from.items[index]), emptyHeaderTitle);
        const toValue = to && valueWithEmptyHandling(getNodeKey(to.items[index]), emptyHeaderTitle);
        const fromName =
            from &&
            valueWithEmptyHandling(getMappingHeaderFormattedName(from.items[index]), emptyHeaderTitle);

        return {
            from: fromValue,
            to: toValue,
            weight: Number(it),
            name: fromName,
        };
    });
};

export const buildSankeyChartSeries = (
    dv: DataViewFacade,
    attributeHeaders: (IUnwrappedAttributeHeadersWithItems | undefined | null)[],
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
): ISeriesItem[] => {
    const getNodeKey = createNodeKeyGetter(attributeHeaders);

    return [
        {
            keys: KEYS,
            data: buildData(dv, attributeHeaders, emptyHeaderTitle, getNodeKey),
            nodes: buildNodes(colorStrategy, emptyHeaderTitle, getNodeKey),
            seriesIndex: 0,
        },
    ];
};
