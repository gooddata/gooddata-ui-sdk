// (C) 2023-2026 GoodData Corporation

import { Pair, YAMLMap } from "yaml";

import { type FullFields, getFullField } from "./sharedUtils.js";
import { isAttributeField, isMetricField } from "./typeGuards.js";
import {
    type ColorMapping,
    type ColumnLocator,
    type ColumnWidth,
    type ColumnWidthItem,
    type IChartFill,
} from "../configs/types.js";
import { getValueOrDefault } from "../configs/utils.js";
import type { Color, ColorDefinition, ListOfColors, Visualisation, Width } from "../schemas/v1/metadata.js";

export function loadColorMapping(mappings: Array<ColorMapping>): YAMLMap<keyof ListOfColors, Color> {
    const map = new YAMLMap<keyof ListOfColors, Color>();

    mappings.forEach((mapping) => {
        const { color, id } = mapping;
        const col = loadColor(id, color);
        if (col) {
            map.add(col);
        }
    });

    return map;
}

export function loadColorDefinitions(mappings: Array<ColorMapping>): YAMLMap<keyof ColorDefinition, Color> {
    const map = new YAMLMap<keyof ColorDefinition, Color>();

    mappings.forEach((mapping) => {
        const { color, id } = mapping;
        const col = loadColor(getDefById(id).toString(), color);
        if (col) {
            map.add(col);
        }
    });

    return map;
}

export function loadColor(key: string, color: ColorMapping["color"] | undefined) {
    if (!color) {
        return undefined;
    }
    if (color.type === "guid") {
        switch (color.value) {
            case "positive":
                return new Pair(key, 1);
            case "negative":
                return new Pair(key, -1);
            case "equals":
                return new Pair(key, 0);
        }
        return new Pair(key, parseInt(color.value, 10));
    }
    if (color.type === "rgb") {
        return new Pair(key, `rgb(${color.value.r},${color.value.g},${color.value.b})`);
    }
    throw new Error(`Unknown color type: ${color}`);
}

export function saveColorMapping(mapping: ListOfColors): Array<ColorMapping> | undefined {
    const keys = Object.keys(mapping) as Array<keyof ListOfColors>;

    if (keys.length === 0) {
        return undefined;
    }

    return keys
        .map((key) => {
            const value = mapping[key];
            return saveColor(key, value);
        })
        .filter(Boolean) as Array<ColorMapping>;
}

export function saveColorDefinitions(mapping: ColorDefinition): Array<ColorMapping> | undefined {
    const keys = Object.keys(mapping) as Array<keyof ColorDefinition>;

    if (keys.length === 0) {
        return undefined;
    }

    return keys
        .map((key) => {
            const value = mapping[key];
            return saveColor(getIdByDef(key), value as Color);
        })
        .filter(Boolean) as Array<ColorMapping>;
}

export function saveColor(
    key: string | number,
    value: Color | undefined,
    mode: "number" | "enum" = "number",
): ColorMapping | undefined {
    if (value == null) {
        return undefined;
    }

    const regex =
        /rgb\( *0*(1?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*(1?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *, *0*(1?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]) *\)/g;
    const parsed = regex.exec(String(value)) || [];

    return {
        id: key,
        color: {
            ...(typeof value === "number" && mode === "number"
                ? {
                      type: "guid",
                      value: value.toString().padStart(2, "0"),
                  }
                : {}),
            ...(typeof value === "number" && mode === "enum"
                ? {
                      type: "guid",
                      value: value === 1 ? "positive" : value === -1 ? "negative" : "equals",
                  }
                : {}),
            ...(typeof value === "string"
                ? {
                      type: "rgb",
                      value: {
                          r: parseInt(parsed[1] ?? "0", 10),
                          g: parseInt(parsed[2] ?? "0", 10),
                          b: parseInt(parsed[3] ?? "0", 10),
                      },
                  }
                : {}),
        },
    } as ColorMapping;
}

function getDefById(id: string): keyof ColorDefinition {
    switch (id) {
        case "properties.color.total":
            return "total";
        case "properties.color.positive":
            return "positive";
        case "properties.color.negative":
            return "negative";
        default:
            throw new Error(`Unknown color definition id: ${id}`);
    }
}

function getIdByDef(def: keyof ColorDefinition): string {
    switch (def) {
        case "total":
            return "properties.color.total";
        case "positive":
            return "properties.color.positive";
        case "negative":
            return "properties.color.negative";
        default:
            throw new Error(`Unknown color definition key: ${def}`);
    }
}

export function loadColumnsWidth(widths: Array<ColumnWidthItem>): YAMLMap<keyof Width, any>[] | undefined {
    if (widths.length === 0) {
        return undefined;
    }
    return widths.map((width) => {
        const map = new YAMLMap<keyof Width, any>();

        if ("measureColumnWidthItem" in width) {
            const item = width.measureColumnWidthItem;

            loadWidth(map, item.width);
            if ("locator" in item) {
                map.add(new Pair("using", [loadLocator(item.locator)]));
            }
            if ("locators" in item) {
                map.add(
                    new Pair(
                        "using",
                        item.locators.map((locator) => loadLocator(locator)),
                    ),
                );
            }
        }

        if ("attributeColumnWidthItem" in width) {
            const item = width.attributeColumnWidthItem;

            loadWidth(map, item.width);
            map.add(new Pair("using", [item.attributeIdentifier]));
        }

        if ("mixedValuesColumnWidthItem" in width) {
            const item = width.mixedValuesColumnWidthItem;

            loadWidth(map, item.width);
            map.add(
                new Pair(
                    "using",
                    item.locators.map((locator) => loadLocator(locator)),
                ),
            );
        }

        if ("sliceMeasureColumnWidthItem" in width) {
            const item = width.sliceMeasureColumnWidthItem;

            loadWidth(map, item.width);
            map.add(
                new Pair(
                    "using",
                    item.locators.map((locator) => loadLocator(locator)),
                ),
            );
        }

        return map;
    });
}

export function saveColumnWidths(
    fields: Visualisation["query"]["fields"],
    widths: Width[] | undefined,
): ColumnWidthItem[] | undefined {
    if (!widths || widths.length === 0) {
        return undefined;
    }
    return widths.map((width) => {
        const defs =
            width.using?.map((el) => {
                if (typeof el === "string") {
                    return {
                        id: el,
                    };
                }

                const key = Object.keys(el)[0];
                if (["SUM", "AVG", "MAX", "MIN", "MED", "NAT"].includes(key)) {
                    return {
                        id: el[key],
                        total: key,
                    };
                }

                return {
                    id: key,
                    element: el[key],
                };
            }) ?? [];
        const usingFields = defs.map((def) => getFullField(fields[def.id]));

        //all
        if (usingFields.length === 0) {
            return {
                measureColumnWidthItem: {
                    ...saveWidth(width),
                },
            } as ColumnWidthItem;
        }

        //mixed or slice
        const allMetrics = usingFields.every((field) => isMetricField(field));
        if (allMetrics && usingFields.length > 1) {
            //TODO: INSIGHTS: Now we totally ignored sliceMeasureColumnWidthItem because there is not possibility
            // how to detect this ...
            return {
                mixedValuesColumnWidthItem: {
                    ...saveWidth(width),
                    locators: defs
                        .map((def) => saveLocator(getFullField(fields[def.id]), def))
                        .filter(Boolean),
                },
            } as ColumnWidthItem;
        }

        //attribute
        const allAttributes = usingFields.every((field) => isAttributeField(field));
        if (allAttributes && usingFields.length === 1 && !defs[0].total && !defs[0].element) {
            return {
                attributeColumnWidthItem: {
                    ...saveWidth(width),
                    attributeIdentifier: defs[0].id,
                },
            } as ColumnWidthItem;
        }

        const locators = defs.map((def) => saveLocator(getFullField(fields[def.id]), def)).filter(Boolean);
        const isMeasureOnly = locators.length === 1 && locators[0]!.measureLocatorItem;

        //others
        return {
            measureColumnWidthItem: {
                ...saveWidth(width),
                ...(isMeasureOnly
                    ? {
                          locator: locators[0],
                      }
                    : {}),
                ...(isMeasureOnly
                    ? {}
                    : {
                          locators,
                      }),
            },
        } as ColumnWidthItem;
    });
}

function loadWidth(map: YAMLMap, width: ColumnWidth) {
    if (width.value === "auto") {
        map.add(new Pair("value", "auto"));
    } else {
        map.add(new Pair("value", width.value));
        if (width.allowGrowToFit !== undefined) {
            map.add(new Pair("allowGrowToFit", width.allowGrowToFit));
        }
    }
}

function saveWidth(width: Width) {
    return {
        width: {
            value: width.value,
            allowGrowToFit: width.allowGrowToFit,
        },
    };
}

function loadLocator(locator: ColumnLocator) {
    if ("attributeLocatorItem" in locator) {
        const item = locator.attributeLocatorItem;
        return new Pair(item.attributeIdentifier, item.element);
    }
    if ("measureLocatorItem" in locator) {
        const item = locator.measureLocatorItem;
        return item.measureIdentifier;
    }
    if ("totalLocatorItem" in locator) {
        const item = locator.totalLocatorItem;
        return new Pair(item.totalFunction.toUpperCase(), item.attributeIdentifier);
    }
    return null;
}

function saveLocator(field: FullFields, locator: { id: string; total?: string; element?: string }) {
    if (locator.element && isAttributeField(field)) {
        return {
            attributeLocatorItem: {
                attributeIdentifier: locator.id,
                element: locator.element,
            },
        };
    }

    if (locator.total && isAttributeField(field)) {
        return {
            totalLocatorItem: {
                attributeIdentifier: locator.id,
                totalFunction: locator.total.toLowerCase(),
            },
        };
    }

    if (isMetricField(field)) {
        return {
            measureLocatorItem: {
                measureIdentifier: locator.id,
            },
        };
    }

    return null;
}

export function loadChartFill(value: IChartFill, defaultsChartFill: IChartFill) {
    return {
        type: getValueOrDefault(value.type, defaultsChartFill.type),
        pattern_name_mapping: value.measureToPatternName ?? defaultsChartFill.measureToPatternName,
    };
}

export function saveChartFill(config: Visualisation["config"], defaultsChartFill: IChartFill) {
    return {
        type: getValueOrDefault(config!.chart_fill?.type, defaultsChartFill.type),
        measureToPatternName:
            config!.chart_fill?.pattern_name_mapping ?? defaultsChartFill.measureToPatternName,
    };
}
