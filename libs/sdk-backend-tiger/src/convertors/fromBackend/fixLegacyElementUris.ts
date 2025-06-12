// (C) 2019-2022 GoodData Corporation
import {
    IInsightDefinition,
    ILocatorItem,
    isAttributeLocator,
    isMeasureSort,
    ISortItem,
    VisualizationProperties,
    IWidgetDefinition,
    isInsightWidget,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import flow from "lodash/flow.js";

/**
 * Purpose of methods in this file is to remove & replace legacy element uris in the visualization properties & sorts
 * in favor of label text values (primary keys on Tiger).
 * In the past, we generated fake uris for attribute elements on Tiger to workaround some PivotTable internals,
 * but these uris are used in AD to pair attribute elements with custom colors/sortItems/columnWidths of the visualization.
 * Now, we don't need to fake these uris anymore and label text values are used directly for this on Tiger
 * so strip the fake uris and keep only label text values for the element ids.
 */

const FAKE_ELEMENT_URI_REGEX = /\/obj\/\d+\/elements\?id=(.*)/;

// Fix color mapping

/**
 * @internal
 */
export type ColorMapping = {
    color: { type: "guid"; value: string };
    // TODO: RAIL-3984 unify this with IColorMapping type from sdk-model
    id: string | null; // id: null means the setting is relevant to (empty value) of the attribute
};

function fixColorMapping(colorMapping: ColorMapping): ColorMapping {
    const [uri, labelValue] = colorMapping.id?.match(FAKE_ELEMENT_URI_REGEX) ?? [];
    if (uri) {
        return {
            ...colorMapping,
            id: labelValue,
        };
    }

    return colorMapping;
}

function fixVisualizationPropertiesColorMapping(properties: VisualizationProperties = {}) {
    const colorMapping: ColorMapping[] | undefined = properties.controls?.colorMapping;
    if (colorMapping) {
        return {
            ...properties,
            controls: {
                ...properties.controls,
                colorMapping: colorMapping.map(fixColorMapping),
            },
        };
    }

    return properties;
}

// Fix sorts

/**
 * We need to clone sortItems to visualizationProperties as we are not storing them on the backend,
 * but AD depends on them (and it's hard refactor).
 */
function addVisualizationPropertiesSortItems(
    properties: VisualizationProperties = {},
    sortItems: ISortItem[] = [],
) {
    return {
        ...properties,
        sortItems,
    };
}

function fixSortItems(sortItems: ISortItem[] = []) {
    return sortItems.map((s): ISortItem => {
        if (isMeasureSort(s)) {
            return {
                measureSortItem: {
                    ...s.measureSortItem,
                    locators: s.measureSortItem.locators.map(fixLocatorItem),
                },
            };
        }

        return s;
    });
}

function fixLocatorItem(locator: ILocatorItem): ILocatorItem {
    if (isAttributeLocator(locator)) {
        // element can be null even though the OpenAPI spec says it cannot (that will be fixed in CAL-515)
        const [uri, labelValue] = locator.attributeLocatorItem.element?.match(FAKE_ELEMENT_URI_REGEX) ?? [];

        if (uri) {
            return {
                ...locator,
                attributeLocatorItem: {
                    ...locator.attributeLocatorItem,
                    element: labelValue,
                },
            };
        }
    }

    return locator;
}

// Fix column widths

/**
 * @internal
 */
interface IMeasureColumnWidthItem {
    measureColumnWidthItem: {
        locators: unknown[];
    };
}

/**
 *
 * @internal
 */
interface IAttributeColumnLocator {
    attributeLocatorItem: {
        element?: string;
    };
}

/**
 * @internal
 */
function isAttributeColumnLocator(obj: unknown): obj is IAttributeColumnLocator {
    return !isEmpty(obj) && (obj as IAttributeColumnLocator).attributeLocatorItem !== undefined;
}

/**
 * @internal
 */
function isMeasureColumnWidthItem(obj: unknown): obj is IMeasureColumnWidthItem {
    return (
        !isEmpty(obj) &&
        (obj as IMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (obj as IMeasureColumnWidthItem).measureColumnWidthItem.locators !== undefined
    );
}

function fixColumnLocator(locator: unknown): unknown {
    if (isAttributeColumnLocator(locator)) {
        const [uri, labelValue] = locator.attributeLocatorItem.element?.match(FAKE_ELEMENT_URI_REGEX) ?? [];
        if (uri) {
            return {
                ...locator,
                attributeLocatorItem: {
                    ...locator.attributeLocatorItem,
                    element: labelValue,
                },
            };
        }
    }

    return locator;
}

function fixVisualizationPropertiesColumnWidths(properties: VisualizationProperties = {}) {
    const columnWidths: unknown[] | undefined = properties.controls?.columnWidths;
    if (columnWidths) {
        return {
            ...properties,
            controls: {
                ...properties.controls,
                columnWidths: columnWidths.map((c) => {
                    if (isMeasureColumnWidthItem(c)) {
                        return {
                            measureColumnWidthItem: {
                                ...c.measureColumnWidthItem,
                                locators: c.measureColumnWidthItem.locators.map(fixColumnLocator),
                            },
                        };
                    }

                    return c;
                }),
            },
        };
    }

    return properties;
}

export function fixInsightLegacyElementUris(insight: IInsightDefinition): IInsightDefinition {
    const fixedSortItems = fixSortItems(insight.insight.sorts);

    const fixedProperties = flow(
        fixVisualizationPropertiesColorMapping,
        fixVisualizationPropertiesColumnWidths,
        (properties) => addVisualizationPropertiesSortItems(properties, fixedSortItems),
    )(insight.insight.properties);

    return {
        ...insight,
        insight: {
            ...insight.insight,
            sorts: fixedSortItems,
            properties: fixedProperties,
        },
    };
}

export function fixWidgetLegacyElementUris(widget: IWidgetDefinition): IWidgetDefinition {
    if (isInsightWidget(widget)) {
        const fixedProperties = fixVisualizationPropertiesColumnWidths(widget.properties);

        return {
            ...widget,
            properties: fixedProperties,
        };
    }

    return widget;
}
