// (C) 2026 GoodData Corporation

import { type IDashboardAttributeFilterConfig } from "../../dashboard/dashboard.js";
import {
    type IDashboardArbitraryAttributeFilter,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterReference,
    type IDashboardDateFilter,
    type IDashboardDateFilterReference,
    type IDashboardMatchAttributeFilter,
    type IDashboardMeasureValueFilter,
    type IDashboardMeasureValueFilterReference,
} from "../../dashboard/filterContext.js";
import { isDateFilterGranularity } from "../../dateFilterConfig/index.js";

import {
    type Check,
    type Issues,
    type KeyTable,
    arrayOf,
    describeValue,
    finiteNumber,
    id,
    isFiniteNumber,
    isLength,
    isNonEmptyString,
    isPlainObject,
    joinPath,
    nonEmptyString,
    numberIn,
    objRef,
    objectOf,
    oneOf,
    opacity,
    optional,
    positive,
    px,
    required,
    satisfying,
    trueOrFalse,
} from "./checks.js";
import {
    type IPublisherAbsolutePeriodV2,
    type IPublisherDocumentContentBaseV2,
    type IPublisherDocumentDefaultsV2,
    type IPublisherDocumentStyleV2,
    type IPublisherRelativePeriodV2,
    type IPublisherSectionV2,
} from "./content.js";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherEntityMetadataV2,
    type IPublisherPageTemplateDefinitionV2,
    type IPublisherPageTemplateV2,
} from "./document.js";
import { type IPublisherContainerV2 } from "./layout.js";
import { type IPublisherDocumentPageV2, type IPublisherPageBodyV2, PublisherPageSizesV2 } from "./page.js";
import {
    type IPublisherBackgroundStyleV2,
    type IPublisherBorderStyleV2,
    type IPublisherBoxStyleV2,
    type IPublisherChartStyleV2,
    type IPublisherContainerStyleV2,
    type IPublisherCornerStyleV2,
    type IPublisherHeadlineStyleV2,
    type IPublisherImageWidgetStyleV2,
    type IPublisherInheritedTextStyleV2,
    type IPublisherPaddingStyleV2,
    type IPublisherPageStyleV2,
    type IPublisherShadowStyleV2,
    type IPublisherTableStyleV2,
    type IPublisherTextStyleV2,
    type IPublisherTextWidgetStyleV2,
    type IPublisherVisualizationStyleV2,
    PublisherTextStyleNamesV2,
} from "./style.js";
import {
    type IPublisherAxisDisplayV2,
    type IPublisherDataSetRefV2,
    type IPublisherHeadingWidgetV2,
    type IPublisherImageWidgetV2,
    type IPublisherTakeawayGenerationV2,
    type IPublisherTakeawayWidgetV2,
    type IPublisherTextWidgetV2,
    type IPublisherTitleWidgetV2,
    type IPublisherVisualizationDisplayV2,
    type IPublisherVisualizationRefV2,
    type IPublisherVisualizationWidgetV2,
    type IPublisherWidgetPlaceholderV2,
    type IPublisherWidgetTitleV2,
    type PublisherWidgetTypeV2,
} from "./widget.js";

const themeName = "[A-Za-z0-9_-]+";
const hexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const rgbColor = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?\)$/;
const themeColor = new RegExp(
    `^\\{theme\\.(?:colors\\.(?:backgrounds|texts|lines)\\.${themeName}|palette\\.(?:primary|success|error|warning))\\}$`,
);

function isColor(value: unknown): boolean {
    if (!isNonEmptyString(value)) {
        return false;
    }
    if (hexColor.test(value) || themeColor.test(value)) {
        return true;
    }
    const rgb = rgbColor.exec(value);
    if (rgb === null) {
        return false;
    }
    const [, red, green, blue, alpha] = rgb;
    return (
        [red, green, blue].every((channel) => Number(channel) <= 255) &&
        (alpha === undefined || Number(alpha) <= 1)
    );
}

const color = satisfying(
    isColor,
    "a theme color reference, #rgb, #rrggbb, #rrggbbaa, or rgb() with 3 or 4 arguments",
);

const themeImage = new RegExp(`^\\{theme\\.(?:logo|coverImage|assets\\.(?:logos|images)\\.${themeName})\\}$`);
const themeShadow = new RegExp(`^\\{theme\\.shadows\\.${themeName}\\}$`);
const httpsUrl = /^https:\/\/\S+$/;

const imageSource = satisfying(
    (value) => isNonEmptyString(value) && (themeImage.test(value) || httpsUrl.test(value)),
    "a theme image reference or an https URL",
);

const shadowValue = satisfying(
    (value) => value === "none" || (isNonEmptyString(value) && themeShadow.test(value)),
    `"none" or a {theme.shadows.<name>} reference`,
);

function themeStep(group: string, steps: readonly string[]): Check {
    const refs = steps.map((step) => `{theme.${group}.${step}}`);
    return satisfying(
        (value) => isLength(value) || refs.some((ref) => ref === value),
        `a length of 0 or more, or one of ${refs.join(", ")}`,
    );
}

const gap = themeStep("spacing.gap", ["compact", "normal", "spacious"]);
const padding = themeStep("spacing.padding", ["compact", "normal", "spacious"]);
const radius = themeStep("corners", ["small", "medium", "large", "full"]);

const horizontalAlign = oneOf(["left", "center", "right"]);
const verticalAlign = oneOf(["top", "center", "bottom"]);
const borderLineStyle = oneOf(["solid", "dashed", "dotted", "none"]);

const backgroundKeys = {
    backgroundColor: optional(color),
    backgroundOpacity: optional(opacity),
    backgroundImage: optional(imageSource),
    backgroundImageOpacity: optional(opacity),
    backgroundFit: optional(oneOf(["cover", "contain", "fill", "tile"])),
    backgroundHorizontalAlign: optional(horizontalAlign),
    backgroundVerticalAlign: optional(verticalAlign),
    backgroundOffset: optional(px),
    backgroundOffsetTop: optional(px),
    backgroundOffsetRight: optional(px),
    backgroundOffsetBottom: optional(px),
    backgroundOffsetLeft: optional(px),
} satisfies KeyTable<IPublisherBackgroundStyleV2>;

const paddingKeys = {
    padding: optional(padding),
    paddingTop: optional(padding),
    paddingRight: optional(padding),
    paddingBottom: optional(padding),
    paddingLeft: optional(padding),
} satisfies KeyTable<IPublisherPaddingStyleV2>;

const borderKeys = {
    borderWidth: optional(px),
    borderStyle: optional(borderLineStyle),
    borderColor: optional(color),
    borderTopWidth: optional(px),
    borderTopStyle: optional(borderLineStyle),
    borderTopColor: optional(color),
    borderRightWidth: optional(px),
    borderRightStyle: optional(borderLineStyle),
    borderRightColor: optional(color),
    borderBottomWidth: optional(px),
    borderBottomStyle: optional(borderLineStyle),
    borderBottomColor: optional(color),
    borderLeftWidth: optional(px),
    borderLeftStyle: optional(borderLineStyle),
    borderLeftColor: optional(color),
} satisfies KeyTable<IPublisherBorderStyleV2>;

const cornerKeys = {
    borderRadius: optional(radius),
    borderTopLeftRadius: optional(radius),
    borderTopRightRadius: optional(radius),
    borderBottomRightRadius: optional(radius),
    borderBottomLeftRadius: optional(radius),
} satisfies KeyTable<IPublisherCornerStyleV2>;

const shadowKeys = {
    shadow: optional(shadowValue),
    shadowX: optional(finiteNumber),
    shadowY: optional(finiteNumber),
    shadowBlur: optional(px),
    shadowSpread: optional(finiteNumber),
    shadowColor: optional(color),
    shadowOpacity: optional(opacity),
} satisfies KeyTable<IPublisherShadowStyleV2>;

const boxKeys = {
    ...backgroundKeys,
    ...paddingKeys,
    ...borderKeys,
    ...cornerKeys,
    ...shadowKeys,
    opacity: optional(opacity),
} satisfies KeyTable<IPublisherBoxStyleV2>;

const inheritedTextKeys = {
    textStyle: optional(oneOf(PublisherTextStyleNamesV2)),
    textColor: optional(color),
    horizontalAlign: optional(oneOf(["left", "center", "right", "justify"])),
    verticalAlign: optional(verticalAlign),
} satisfies KeyTable<IPublisherInheritedTextStyleV2>;

const textKeys = {
    ...inheritedTextKeys,
    fontSize: optional(px),
    fontWeight: optional(numberIn(1, 1000)),
    fontStyle: optional(oneOf(["normal", "italic"])),
    lineHeight: optional(finiteNumber),
    letterSpacing: optional(finiteNumber),
    textTransform: optional(oneOf(["none", "uppercase", "lowercase", "capitalize"])),
    textOverflow: optional(oneOf(["shrink", "clip", "ellipsis"])),
} satisfies KeyTable<IPublisherTextStyleV2>;

const pageStyle = objectOf<IPublisherPageStyleV2>()({
    ...backgroundKeys,
    ...paddingKeys,
    ...inheritedTextKeys,
    gap: optional(gap),
});

const containerStyle = objectOf<IPublisherContainerStyleV2>()({
    ...boxKeys,
    ...inheritedTextKeys,
    gap: optional(gap),
});

const textStyle = objectOf<IPublisherTextStyleV2>()(textKeys);

const textWidgetStyle = objectOf<IPublisherTextWidgetStyleV2>()({ ...boxKeys, ...textKeys });

const imageWidgetStyle = objectOf<IPublisherImageWidgetStyleV2>()({
    ...boxKeys,
    fit: optional(oneOf(["contain", "cover", "fill"])),
    horizontalAlign: optional(horizontalAlign),
    verticalAlign: optional(verticalAlign),
});

const chartStyle = objectOf<IPublisherChartStyleV2>()({
    fontSize: optional(px),
    textColor: optional(color),
    axisLineColor: optional(color),
    axisNameColor: optional(color),
    axisNameSize: optional(px),
    axisValueColor: optional(color),
    axisValueSize: optional(px),
    gridColor: optional(color),
    plotLineColor: optional(color),
    legendColor: optional(color),
    legendSize: optional(px),
    dataLabelColor: optional(color),
    dataLabelSize: optional(px),
});

const tableStyle = objectOf<IPublisherTableStyleV2>()({
    fontSize: optional(px),
    rowHeight: optional(px),
    gridColor: optional(color),
    valueColor: optional(color),
    nullValueColor: optional(color),
    headerLabelColor: optional(color),
    headerBackgroundColor: optional(color),
    totalValueColor: optional(color),
    totalBackgroundColor: optional(color),
    subtotalBackgroundColor: optional(color),
});

const headlineStyle = objectOf<IPublisherHeadlineStyleV2>()({
    primaryValueColor: optional(color),
    primaryValueSize: optional(px),
    secondaryValueColor: optional(color),
    secondaryValueSize: optional(px),
    positiveColor: optional(color),
    negativeColor: optional(color),
});

const visualizationStyle = objectOf<IPublisherVisualizationStyleV2>()({
    ...boxKeys,
    chart: optional(chartStyle),
    table: optional(tableStyle),
    headline: optional(headlineStyle),
});

const plainObject = satisfying(isPlainObject, "an object");
const objRefs = arrayOf(objRef);
const plainObjects = arrayOf(plainObject);

const attributeFilterSourceKeys = {
    displayForm: required(objRef),
    localIdentifier: optional(id),
    title: optional(nonEmptyString),
    filterElementsBy: optional(plainObjects),
    filterElementsByDate: optional(plainObjects),
    validateElementsBy: optional(objRefs),
};

const filterVariants = {
    attributeFilter: objectOf<IDashboardAttributeFilter>()({
        attributeFilter: required(
            objectOf<IDashboardAttributeFilter["attributeFilter"]>()({
                ...attributeFilterSourceKeys,
                negativeSelection: required(trueOrFalse),
                attributeElements: required(plainObject),
                selectionMode: optional(oneOf(["single", "multi"])),
            }),
        ),
    }),
    arbitraryAttributeFilter: objectOf<IDashboardArbitraryAttributeFilter>()({
        arbitraryAttributeFilter: required(
            objectOf<IDashboardArbitraryAttributeFilter["arbitraryAttributeFilter"]>()({
                ...attributeFilterSourceKeys,
                values: required(
                    arrayOf(satisfying((value) => value === null || typeof value === "string", "a value")),
                ),
                negativeSelection: required(trueOrFalse),
            }),
        ),
    }),
    matchAttributeFilter: objectOf<IDashboardMatchAttributeFilter>()({
        matchAttributeFilter: required(
            objectOf<IDashboardMatchAttributeFilter["matchAttributeFilter"]>()({
                displayForm: required(objRef),
                operator: required(oneOf(["contains", "startsWith", "endsWith"])),
                literal: required(nonEmptyString),
                caseSensitive: optional(trueOrFalse),
                negativeSelection: optional(trueOrFalse),
                localIdentifier: optional(id),
                title: optional(nonEmptyString),
            }),
        ),
    }),
    dateFilter: objectOf<IDashboardDateFilter>()({
        dateFilter: required(
            objectOf<IDashboardDateFilter["dateFilter"]>()({
                type: required(oneOf(["relative", "absolute"])),
                granularity: required(satisfying(isDateFilterGranularity, "a date filter granularity")),
                from: optional(
                    satisfying(
                        (value) => isNonEmptyString(value) || isFiniteNumber(value),
                        "a date or an offset",
                    ),
                ),
                to: optional(
                    satisfying(
                        (value) => isNonEmptyString(value) || isFiniteNumber(value),
                        "a date or an offset",
                    ),
                ),
                dataSet: optional(objRef),
                attribute: optional(objRef),
                localIdentifier: optional(id),
                boundedFilter: optional(plainObject),
                emptyValueHandling: optional(oneOf(["include", "exclude", "only"])),
            }),
        ),
    }),
    dashboardMeasureValueFilter: objectOf<IDashboardMeasureValueFilter>()({
        dashboardMeasureValueFilter: required(
            objectOf<IDashboardMeasureValueFilter["dashboardMeasureValueFilter"]>()({
                measure: required(objRef),
                localIdentifier: required(id),
                conditions: optional(plainObjects),
                dimensionality: optional(objRefs),
                title: optional(nonEmptyString),
            }),
        ),
    }),
};

function filterItem(value: unknown, path: string, issues: Issues): void {
    const variant = isPlainObject(value)
        ? Object.keys(filterVariants).find((key) => Object.hasOwn(value, key))
        : undefined;
    if (variant === undefined) {
        issues.push({ path, message: `Expected a dashboard filter, got ${describeValue(value)}.` });
        return;
    }
    filterVariants[variant as keyof typeof filterVariants](value, path, issues);
}

const filters = arrayOf(filterItem);

const filterReferenceVariants = {
    attributeFilterReference: objectOf<IDashboardAttributeFilterReference>()({
        type: required(oneOf(["attributeFilterReference"])),
        displayForm: required(objRef),
    }),
    dateFilterReference: objectOf<IDashboardDateFilterReference>()({
        type: required(oneOf(["dateFilterReference"])),
        dataSet: required(objRef),
    }),
    measureValueFilterReference: objectOf<IDashboardMeasureValueFilterReference>()({
        type: required(oneOf(["measureValueFilterReference"])),
        measure: required(objRef),
    }),
};

function filterReference(value: unknown, path: string, issues: Issues): void {
    const type = isPlainObject(value) ? value["type"] : undefined;
    if (typeof type === "string" && Object.hasOwn(filterReferenceVariants, type)) {
        filterReferenceVariants[type as keyof typeof filterReferenceVariants](value, path, issues);
    } else {
        issues.push({ path, message: `Expected a dashboard filter reference, got ${describeValue(value)}.` });
    }
}

const attributeFilterConfig = objectOf<IDashboardAttributeFilterConfig>()({
    localIdentifier: required(id),
    mode: optional(oneOf(["readonly", "hidden", "active"])),
    displayAsLabel: optional(objRef),
    selectionType: optional(oneOf(["list", "text", "listOrText"])),
});

const placeholder = objectOf<IPublisherWidgetPlaceholderV2>()({
    hint: optional(nonEmptyString),
    required: optional(trueOrFalse),
});

const widgetKeys = {
    id: required(id),
    proportion: optional(positive),
    placeholder: optional(placeholder),
    locked: optional(trueOrFalse),
};

const widgetTitle = objectOf<IPublisherWidgetTitleV2>()({
    visible: optional(trueOrFalse),
    text: optional(nonEmptyString),
    style: optional(textStyle),
});

const visibility = objectOf<{ visible?: boolean }>()({ visible: optional(trueOrFalse) });
const autoVisibility = objectOf<{ visible?: boolean | "auto" }>()({
    visible: optional(oneOf([true, false, "auto"])),
});

const axisDisplay = objectOf<IPublisherAxisDisplayV2>()({
    visible: optional(trueOrFalse),
    name: optional(
        objectOf<NonNullable<IPublisherAxisDisplayV2["name"]>>()({
            visible: optional(trueOrFalse),
            position: optional(oneOf(["low", "middle", "high"])),
        }),
    ),
    values: optional(
        objectOf<NonNullable<IPublisherAxisDisplayV2["values"]>>()({
            visible: optional(trueOrFalse),
            rotation: optional(numberIn(-90, 90)),
        }),
    ),
    min: optional(finiteNumber),
    max: optional(finiteNumber),
});

const visualizationDisplay = objectOf<IPublisherVisualizationDisplayV2>()({
    legend: optional(
        objectOf<NonNullable<IPublisherVisualizationDisplayV2["legend"]>>()({
            visible: optional(trueOrFalse),
            position: optional(oneOf(["auto", "top", "bottom", "left", "right"])),
        }),
    ),
    xAxis: optional(axisDisplay),
    yAxis: optional(axisDisplay),
    secondaryYAxis: optional(axisDisplay),
    gridlines: optional(visibility),
    dataLabels: optional(autoVisibility),
    dataPoints: optional(autoVisibility),
});

const takeawayGeneration = objectOf<IPublisherTakeawayGenerationV2>()({
    instructions: optional(nonEmptyString),
    context: optional(
        objectOf<NonNullable<IPublisherTakeawayGenerationV2["context"]>>()({
            widgets: optional(arrayOf(id)),
            pageTitle: optional(trueOrFalse),
            filters: optional(trueOrFalse),
            otherPages: optional(trueOrFalse),
        }),
    ),
});

const widgets: Record<PublisherWidgetTypeV2, Check> = {
    title: objectOf<IPublisherTitleWidgetV2>()({
        ...widgetKeys,
        type: required(oneOf(["title"])),
        markdown: optional(nonEmptyString),
        style: optional(textWidgetStyle),
    }),
    heading: objectOf<IPublisherHeadingWidgetV2>()({
        ...widgetKeys,
        type: required(oneOf(["heading"])),
        markdown: optional(nonEmptyString),
        level: optional(oneOf([1, 2, 3, 4, 5, 6])),
        style: optional(textWidgetStyle),
    }),
    text: objectOf<IPublisherTextWidgetV2>()({
        ...widgetKeys,
        type: required(oneOf(["text"])),
        markdown: optional(nonEmptyString),
        decorative: optional(trueOrFalse),
        style: optional(textWidgetStyle),
    }),
    image: objectOf<IPublisherImageWidgetV2>()({
        ...widgetKeys,
        type: required(oneOf(["image"])),
        source: optional(imageSource),
        altText: optional(nonEmptyString),
        decorative: optional(trueOrFalse),
        style: optional(imageWidgetStyle),
    }),
    visualization: objectOf<IPublisherVisualizationWidgetV2>()({
        ...widgetKeys,
        type: required(oneOf(["visualization"])),
        visualization: optional(
            objectOf<IPublisherVisualizationRefV2>()({
                identifier: required(nonEmptyString),
                type: required(oneOf(["insight"])),
            }),
        ),
        title: optional(widgetTitle),
        altText: optional(nonEmptyString),
        dateDataSet: optional(
            objectOf<IPublisherDataSetRefV2>()({
                identifier: required(nonEmptyString),
                type: required(oneOf(["dataSet"])),
            }),
        ),
        ignoreDocumentPeriod: optional(trueOrFalse),
        filters: optional(filters),
        ignoreDocumentFilters: optional(arrayOf(filterReference)),
        display: optional(visualizationDisplay),
        style: optional(visualizationStyle),
    }),
    takeaway: objectOf<IPublisherTakeawayWidgetV2>()({
        ...widgetKeys,
        type: required(oneOf(["takeaway"])),
        title: optional(widgetTitle),
        markdown: optional(nonEmptyString),
        generation: optional(takeawayGeneration),
        style: optional(textWidgetStyle),
    }),
};

const container = objectOf<IPublisherContainerV2>()({
    type: required(oneOf(["row", "column"])),
    id: optional(id),
    children: required(arrayOf(layoutNode)),
    proportion: optional(positive),
    locked: optional(trueOrFalse),
    style: optional(containerStyle),
});

function layoutNode(value: unknown, path: string, issues: Issues): void {
    const type = isPlainObject(value) ? value["type"] : undefined;
    if (type === "row" || type === "column") {
        container(value, path, issues);
    } else if (typeof type === "string" && Object.hasOwn(widgets, type)) {
        widgets[type as PublisherWidgetTypeV2](value, path, issues);
    } else if (isPlainObject(value)) {
        issues.push({ path: joinPath(path, "type"), message: `Unknown node type ${describeValue(type)}.` });
    } else {
        issues.push({ path, message: `Expected a layout node, got ${describeValue(value)}.` });
    }
}

const pageBodyKeys = {
    kind: optional(oneOf(["cover", "section", "content"])),
    pageSize: optional(oneOf(PublisherPageSizesV2)),
    notes: optional(nonEmptyString),
    style: optional(pageStyle),
    layout: required(layoutNode),
    filters: optional(filters),
};

export const checkPageBody = objectOf<IPublisherPageBodyV2>()(pageBodyKeys);

const documentPage = objectOf<IPublisherDocumentPageV2>()({
    ...pageBodyKeys,
    id: required(id),
    visible: optional(trueOrFalse),
});

function isCalendarDate(value: unknown): boolean {
    const parts = isNonEmptyString(value) ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
    if (parts === null) {
        return false;
    }
    const [year, month, day] = parts.slice(1).map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const date = satisfying(isCalendarDate, "a date as YYYY-MM-DD");

const periodVariants = {
    absolute: objectOf<IPublisherAbsolutePeriodV2>()({
        type: required(oneOf(["absolute"])),
        granularity: required(oneOf(["GDC.time.date"])),
        from: required(date),
        to: required(date),
    }),
    relative: objectOf<IPublisherRelativePeriodV2>()({
        type: required(oneOf(["relative"])),
        granularity: required(satisfying(isDateFilterGranularity, "a date filter granularity")),
        from: required(satisfying(Number.isInteger, "an integer")),
        to: required(satisfying(Number.isInteger, "an integer")),
    }),
};

function period(value: unknown, path: string, issues: Issues): void {
    if (!isPlainObject(value)) {
        issues.push({ path, message: `Expected a period, got ${describeValue(value)}.` });
        return;
    }
    const { type } = value;
    if (type === "absolute" || type === "relative") {
        periodVariants[type](value, path, issues);
    } else {
        issues.push({
            path: joinPath(path, "type"),
            message: `Expected "absolute" or "relative", got ${describeValue(type)}.`,
        });
    }
}

const defaults = objectOf<IPublisherDocumentDefaultsV2>()({
    pageSize: optional(oneOf(PublisherPageSizesV2)),
    takeaway: optional(
        objectOf<NonNullable<IPublisherDocumentDefaultsV2["takeaway"]>>()({
            generation: optional(takeawayGeneration),
        }),
    ),
    period: optional(period),
});

const section = objectOf<IPublisherSectionV2>()({
    id: required(id),
    title: optional(nonEmptyString),
    description: optional(nonEmptyString),
    pages: required(arrayOf(documentPage)),
});

export const checkDocumentContent = objectOf<
    IPublisherDocumentContentBaseV2 & { pages?: IPublisherDocumentPageV2[]; sections?: IPublisherSectionV2[] }
>()({
    defaults: optional(defaults),
    filters: optional(filters),
    attributeFilterConfigs: optional(arrayOf(attributeFilterConfig)),
    style: optional(objectOf<IPublisherDocumentStyleV2>()({ ...backgroundKeys, gap: optional(gap) })),
    locale: optional(nonEmptyString),
    formatLocale: optional(nonEmptyString),
    pages: optional(arrayOf(documentPage)),
    sections: optional(arrayOf(section)),
});

const entityKeys = {
    ref: optional(objRef),
    title: required(nonEmptyString),
    description: optional(nonEmptyString),
    tags: optional(arrayOf(nonEmptyString)),
    version: required(oneOf(["2"])),
    created: optional(nonEmptyString),
    updated: optional(nonEmptyString),
    createdBy: optional(satisfying(isPlainObject, "a user")),
    updatedBy: optional(satisfying(isPlainObject, "a user")),
    isLocked: optional(trueOrFalse),
};

const entities = {
    document: objectOf<IPublisherDocumentDefinitionV2 & Partial<IPublisherEntityMetadataV2>>()({
        ...entityKeys,
        type: required(oneOf(["document"])),
        period: required(period),
        content: required(checkDocumentContent),
    }),
    documentTemplate: objectOf<
        IPublisherDocumentTemplateDefinitionV2 & Partial<IPublisherEntityMetadataV2>
    >()({
        ...entityKeys,
        type: required(oneOf(["documentTemplate"])),
        content: required(checkDocumentContent),
    }),
    pageTemplate: objectOf<
        IPublisherPageTemplateDefinitionV2 &
            Partial<IPublisherEntityMetadataV2> &
            Pick<IPublisherPageTemplateV2, "isDefault">
    >()({
        ...entityKeys,
        type: required(oneOf(["pageTemplate"])),
        content: required(checkPageBody),
        isDefault: optional(trueOrFalse),
    }),
};

export function checkEntity(value: unknown, path: string, issues: Issues): void {
    const type = isPlainObject(value) ? value["type"] : undefined;
    if (type === "document" || type === "documentTemplate" || type === "pageTemplate") {
        entities[type](value, path, issues);
    } else {
        issues.push({
            path: joinPath(path, "type"),
            message: `Expected "document", "documentTemplate" or "pageTemplate", got ${describeValue(type)}.`,
        });
    }
}
