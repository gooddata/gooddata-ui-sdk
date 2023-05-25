// (C) 2007-2023 GoodData Corporation
import { layoutWidgets, UnexpectedError, NotSupported } from "@gooddata/sdk-backend-spi";
import {
    GdcDashboardLayout,
    GdcDashboard,
    GdcVisualizationWidget,
    GdcKpi,
    GdcExtendedDateFilters,
    GdcMetadata,
    GdcFilterContext,
    GdcScheduledMail,
    GdcDashboardPlugin,
} from "@gooddata/api-model-bear";
import {
    ObjRef,
    isUriRef,
    isAttributeElementsByValue,
    isIdentifierRef,
    ObjRefInScope,
    isLocalIdRef,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    FilterContextItem,
    IDashboardFilterReference,
    IFilterContext,
    IFilterContextDefinition,
    ITempFilterContext,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    isFilterContext,
    isTempFilterContext,
    IWidgetAlert,
    IWidgetAlertDefinition,
    DrillDefinition,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    IWidget,
    IWidgetDefinition,
    isWidget,
    isWidgetDefinition,
    isDashboardAttachment,
    isWidgetAttachment,
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
    ScreenSize,
    isDashboardLayout,
    IDashboard,
    IDashboardDefinition,
    IDashboardDateFilterConfig,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    isKpiWithComparison,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { convertUrisToReferences } from "../fromBackend/ReferenceConverter.js";
import isEmpty from "lodash/isEmpty.js";
import omitBy from "lodash/omitBy.js";
import { serializeProperties } from "../fromBackend/PropertiesConverter.js";
import { assertNoNulls } from "./utils.js";

const refToUri = (ref: ObjRef) => {
    invariant(isUriRef(ref));

    return ref.uri;
};

const refToIdentifier = (ref: ObjRef) => {
    invariant(isIdentifierRef(ref));

    return ref.identifier;
};

const refToLocalId = (ref: ObjRefInScope) => {
    invariant(isLocalIdRef(ref));

    return ref.localIdentifier;
};

export const convertLayoutSize = (size: IDashboardLayoutSize): GdcDashboardLayout.IFluidLayoutSize => {
    const converted: GdcDashboardLayout.IFluidLayoutSize = {
        width: size.gridWidth,
    };

    if (size.gridHeight) {
        converted.height = size.gridHeight;
    }

    if (size.heightAsRatio) {
        converted.heightAsRatio = size.heightAsRatio;
    }

    return converted;
};

export const convertLayoutItemSize = (
    column: IDashboardLayoutSizeByScreenSize,
): GdcDashboardLayout.IFluidLayoutColSize => {
    const allScreens: ScreenSize[] = ["xl", "md", "lg", "sm", "xs"];
    return allScreens.reduce((acc: GdcDashboardLayout.IFluidLayoutColSize, el) => {
        const size = column[el];
        if (size) {
            acc[el] = convertLayoutSize(size);
        }

        return acc;
    }, {} as GdcDashboardLayout.IFluidLayoutColSize);
};

const convertLayoutItem = (column: IDashboardLayoutItem): GdcDashboardLayout.IFluidLayoutColumn => {
    const { size, widget } = column;
    if (isWidget(widget)) {
        return {
            size: convertLayoutItemSize(size),
            content: {
                widget: { qualifier: { uri: refToUri(widget.ref) } },
            },
        };
    } else if (isDashboardLayout(widget)) {
        return {
            size: convertLayoutItemSize(size),
            content: convertLayout(widget),
        };
    } else if (isWidgetDefinition(widget)) {
        // This should never happen -> widgets in the layout should be already saved
        throw new UnexpectedError("Cannot convert layout widget definition to bear model!");
    }

    return {
        size: convertLayoutItemSize(size),
    };
};

const convertLayoutSection = (section: IDashboardLayoutSection): GdcDashboardLayout.IFluidLayoutRow => {
    const convertedRow: GdcDashboardLayout.IFluidLayoutRow = {
        columns: section.items.map((column) => convertLayoutItem(column)),
    };
    if (section.header) {
        // Ignore empty strings in header
        const headerWithoutEmptyStrings = omitBy(section.header, (x) => !x);
        const isEmptyHeader = isEmpty(headerWithoutEmptyStrings);
        if (!isEmptyHeader) {
            const header = {} as GdcDashboardLayout.ISectionHeader;
            if (section.header?.title) {
                header.title = section.header.title;
            }
            if (section.header?.description) {
                header.description = section.header.description;
            }
            convertedRow.header = header;
        }
    }

    return convertedRow;
};

const convertLayout = (layout: IDashboardLayout): GdcDashboardLayout.Layout => {
    const { sections } = layout;
    const convertedLayout: GdcDashboardLayout.Layout = {
        fluidLayout: {
            rows: sections.map(convertLayoutSection),
        },
    };
    if (layout.size) {
        convertedLayout.fluidLayout.size = convertLayoutSize(layout.size);
    }

    return convertedLayout;
};

export const convertFilterContextItem = (
    filterContextItem: FilterContextItem,
): GdcFilterContext.IDateFilter | GdcFilterContext.IAttributeFilter => {
    if (isDashboardDateFilter(filterContextItem)) {
        const {
            dateFilter: { granularity, type, attribute, dataSet, from, to },
        } = filterContextItem;
        const convertedDateFilter: GdcFilterContext.IDateFilter = {
            dateFilter: {
                granularity,
                type,
                from: from?.toString(),
                to: to?.toString(),
            },
        };

        if (attribute) {
            convertedDateFilter.dateFilter.attribute = refToUri(attribute);
        }
        if (dataSet) {
            convertedDateFilter.dateFilter.dataSet = refToUri(dataSet);
        }
        return convertedDateFilter;
    }

    const {
        attributeFilter: {
            attributeElements,
            displayForm,
            negativeSelection,
            localIdentifier,
            title,
            filterElementsBy = [],
            selectionMode,
        },
    } = filterContextItem;
    const displayFormUri = refToUri(displayForm);

    const convertedAttributeFilterParents = filterElementsBy.map((filterElementsByItem) => {
        return {
            filterLocalIdentifier: filterElementsByItem.filterLocalIdentifier,
            over: {
                attributes: filterElementsByItem.over.attributes.map(refToUri),
            },
        };
    });

    if (isAttributeElementsByValue(attributeElements)) {
        throw new NotSupported(
            "Bear backend does not support value attribute filters in analytical dashboards",
        );
    }

    assertNoNulls(attributeElements);

    return {
        attributeFilter: {
            negativeSelection,
            attributeElements: attributeElements.uris as string[], // checked above so the cast is ok
            displayForm: displayFormUri,
            localIdentifier,
            filterElementsBy: convertedAttributeFilterParents,
            title,
            ...(selectionMode !== undefined ? { selectionMode } : {}),
        },
    };
};

export function convertFilterContext(
    filterContext: ITempFilterContext,
): GdcFilterContext.IWrappedTempFilterContext;
export function convertFilterContext(
    filterContext: IFilterContext | IFilterContextDefinition,
): GdcFilterContext.IWrappedFilterContext;
export function convertFilterContext(
    filterContext: ITempFilterContext | IFilterContext | IFilterContextDefinition,
): GdcFilterContext.IWrappedTempFilterContext | GdcFilterContext.IWrappedFilterContext {
    if (isTempFilterContext(filterContext)) {
        const { created, filters } = filterContext;

        return {
            tempFilterContext: {
                created,
                filters: filters.map(convertFilterContextItem),
                ...(filterContext
                    ? {
                          uri: refToUri(filterContext.ref),
                      }
                    : {}),
            } as GdcFilterContext.ITempFilterContext,
        };
    }

    const { description, filters, title } = filterContext;

    return {
        filterContext: {
            content: {
                filters: filters.map(convertFilterContextItem),
            },
            meta: {
                summary: description,
                title,
                ...(isFilterContext(filterContext)
                    ? {
                          uri: refToUri(filterContext),
                          identifier: filterContext.identifier,
                      }
                    : {}),
            },
        },
    };
}

const convertFilterReference = (
    filterReference: IDashboardFilterReference,
): GdcExtendedDateFilters.IDateFilterReference | GdcExtendedDateFilters.IAttributeFilterReference => {
    if (isDashboardDateFilterReference(filterReference)) {
        return {
            dateFilterReference: {
                dataSet: refToUri(filterReference.dataSet),
            },
        };
    }

    return {
        attributeFilterReference: {
            displayForm: refToUri(filterReference.displayForm),
        },
    };
};

export function convertDrill(drill: IDrillToLegacyDashboard): GdcKpi.IKpiProjectDashboardLink;
export function convertDrill(
    drill: IDrillToInsight | IDrillToDashboard | IDrillToCustomUrl | IDrillToAttributeUrl,
): GdcVisualizationWidget.IDrillDefinition;
export function convertDrill(
    drill: DrillDefinition,
): GdcKpi.IKpiProjectDashboardLink | GdcVisualizationWidget.IDrillDefinition {
    if (isDrillToLegacyDashboard(drill)) {
        const { tab } = drill;
        return {
            projectDashboard: refToUri(drill.target),
            projectDashboardTab: tab,
        };
    }

    const { origin } = drill;
    let drillFrom: GdcVisualizationWidget.DrillFromType;
    if (isDrillFromMeasure(origin)) {
        const { measure } = origin;
        drillFrom = {
            drillFromMeasure: {
                localIdentifier: refToLocalId(measure),
            },
        };
    } else if (isDrillFromAttribute(origin)) {
        const { attribute } = origin;
        drillFrom = {
            drillFromAttribute: {
                localIdentifier: refToLocalId(attribute),
            },
        };
    } else {
        throw new UnexpectedError("Unable to convert unknown drill origin!");
    }

    if (isDrillToDashboard(drill)) {
        return {
            drillToDashboard: {
                from: drillFrom,
                target: "in-place",
                toDashboard: drill.target !== undefined ? refToIdentifier(drill.target) : undefined,
            },
        };
    } else if (isDrillToInsight(drill)) {
        return {
            drillToVisualization: {
                from: drillFrom,
                target: "pop-up",
                toVisualization: {
                    uri: refToUri(drill.target),
                },
            },
        };
    } else if (isDrillToCustomUrl(drill)) {
        return {
            drillToCustomUrl: {
                from: drillFrom,
                target: "new-window",
                customUrl: drill.target.url,
            },
        };
    } else if (isDrillToAttributeUrl(drill)) {
        return {
            drillToAttributeUrl: {
                from: drillFrom,
                target: "new-window",
                drillToAttributeDisplayForm: { uri: refToUri(drill.target.hyperlinkDisplayForm) },
                insightAttributeDisplayForm: { uri: refToUri(drill.target.displayForm) },
            },
        };
    }

    throw new UnexpectedError("Unable to convert unknown drill!");
}

export const convertWidget = (
    widget: IWidget | IWidgetDefinition,
): GdcVisualizationWidget.IWrappedVisualizationWidget | GdcKpi.IWrappedKPI => {
    const { ignoreDashboardFilters, dateDataSet, title, description, drills } = widget;
    const meta = {
        ...(isWidget(widget)
            ? {
                  identifier: widget.identifier,
                  uri: refToUri(widget.ref),
              }
            : {}),
        title,
        summary: description,
    };
    const convertedDateDataSet = dateDataSet && refToUri(dateDataSet);
    const convertedIgnoredDashboardFilters = ignoreDashboardFilters.map(convertFilterReference);

    if (widget.type === "kpi") {
        invariant(widget.kpi, "Widget type is kpi, but kpi props are not defined!");
        const { kpi, configuration } = widget;

        return {
            kpi: {
                content: {
                    ...(isKpiWithComparison(kpi)
                        ? {
                              comparisonDirection: kpi.comparisonDirection,
                              comparisonType: kpi.comparisonType,
                          }
                        : {
                              comparisonType: kpi.comparisonType,
                          }),
                    metric: refToUri(kpi.metric),
                    ignoreDashboardFilters: convertedIgnoredDashboardFilters,
                    dateDataSet: convertedDateDataSet,
                    drillTo:
                        drills.length > 0 ? convertDrill(drills[0] as IDrillToLegacyDashboard) : undefined,
                    ...(configuration ? { configuration } : {}),
                },
                meta,
            },
        };
    }

    const { insight, properties: widgetProperties = {}, configuration } = widget;

    const { properties, references } = convertUrisToReferences({
        properties: widgetProperties,
        references: {},
    });

    const nonEmptyProperties = omitBy(properties, (value, key) => key !== "controls" && isEmpty(value));

    return {
        visualizationWidget: {
            content: {
                visualization: refToUri(insight),
                ignoreDashboardFilters: convertedIgnoredDashboardFilters,
                dateDataSet: convertedDateDataSet,
                drills: drills
                    ? (drills as Array<IDrillToDashboard | IDrillToInsight>).map(convertDrill)
                    : [],
                ...(!isEmpty(nonEmptyProperties) && {
                    properties: serializeProperties(nonEmptyProperties),
                }),
                ...(!isEmpty(references) && { references }),
                ...(configuration ? { configuration } : {}),
            },
            meta,
        },
    };
};

const convertAbsoluteDateFilterPreset = (
    preset: IAbsoluteDateFilterPreset,
): GdcExtendedDateFilters.IDateFilterAbsolutePreset => {
    const { type: _, ...rest } = preset;
    return rest;
};

const convertRelativeDateFilterPreset = (
    preset: IRelativeDateFilterPreset,
): GdcExtendedDateFilters.IDateFilterRelativePreset => {
    const { type: _, ...rest } = preset;
    return rest;
};

const convertDateFilterConfig = (
    config: IDashboardDateFilterConfig,
): GdcDashboard.IDashboardDateFilterConfig => {
    const absolutePresets = config.addPresets?.absolutePresets?.map(convertAbsoluteDateFilterPreset);
    const relativePresets = config.addPresets?.relativePresets?.map(convertRelativeDateFilterPreset);

    const addPresets =
        absolutePresets || relativePresets
            ? {
                  ...(absolutePresets && { absolutePresets }),
                  ...(relativePresets && { relativePresets }),
              }
            : undefined;

    return {
        ...config,
        ...(addPresets && { addPresets }),
    };
};

export const convertPluginLink = (pluginLink: IDashboardPluginLink): GdcDashboard.IDashboardPluginLink => {
    const { plugin, parameters } = pluginLink;

    return {
        type: refToUri(plugin),
        parameters: parameters,
    };
};

export const convertDashboard = (
    dashboard: IDashboard | IDashboardDefinition,
): GdcDashboard.IWrappedAnalyticalDashboard => {
    const {
        filterContext,
        layout,
        ref,
        identifier,
        title,
        description,
        dateFilterConfig,
        isLocked,
        tags,
        plugins,
        shareStatus,
        isUnderStrictControl,
    } = dashboard;
    const convertedLayout = layout && convertLayout(layout);
    const widgets = layout && layoutWidgets(layout);
    const dashboardUri = ref && refToUri(ref);
    const filterContextUri = filterContext?.ref && refToUri(filterContext.ref);
    const convertedDateFilterConfig = dateFilterConfig && convertDateFilterConfig(dateFilterConfig);
    const convertedPlugins = plugins?.map(convertPluginLink);

    const sharedWithSomeoneProp: Partial<GdcMetadata.IObjectMeta> =
        shareStatus === "shared"
            ? {
                  sharedWithSomeone: 1,
              }
            : {};

    let flagsProp = {};
    if (isUnderStrictControl !== undefined) {
        flagsProp = isUnderStrictControl
            ? {
                  flags: ["strictAccessControl"],
              }
            : {
                  flags: [],
              };
    }

    return {
        analyticalDashboard: {
            content: {
                ...(convertedDateFilterConfig && { dateFilterConfig: convertedDateFilterConfig }),
                ...(convertedPlugins && !isEmpty(convertedPlugins) && { plugins: convertedPlugins }),
                filterContext: filterContextUri,
                widgets: widgets ? widgets.filter(isWidget).map((widget) => refToUri(widget.ref)) : [],
                layout: convertedLayout,
            },
            meta: {
                ...(dashboardUri
                    ? {
                          uri: dashboardUri,
                          identifier,
                      }
                    : {}),
                title,
                summary: description,
                locked: isLocked,
                tags: tags?.join(" "),
                unlisted: shareStatus === "public" ? 0 : 1,
                ...sharedWithSomeoneProp,
                ...flagsProp,
            },
        },
    };
};

export const convertWidgetAlert = (
    alert: IWidgetAlert | IWidgetAlertDefinition,
): GdcMetadata.IWrappedKpiAlert => {
    const {
        dashboard,
        widget,
        description,
        isTriggered,
        threshold,
        title,
        whenTriggered,
        ref,
        identifier,
        filterContext,
    } = alert;

    const alertUri = ref && refToUri(ref);

    return {
        kpiAlert: {
            content: {
                filterContext: filterContext?.ref && refToUri(filterContext.ref),
                dashboard: refToUri(dashboard),
                kpi: refToUri(widget),
                isTriggered,
                threshold,
                whenTriggered,
            },
            meta: {
                ...(alertUri
                    ? {
                          uri: alertUri,
                          identifier,
                      }
                    : {}),
                title,
                summary: description,
            },
        },
    };
};

export const convertScheduledMailAttachment = (
    scheduledMailAttachment: ScheduledMailAttachment,
): GdcScheduledMail.ScheduledMailAttachment => {
    if (isDashboardAttachment(scheduledMailAttachment)) {
        const { dashboard, format, filterContext } = scheduledMailAttachment;

        return {
            kpiDashboardAttachment: {
                uri: refToUri(dashboard),
                format,
                filterContext: filterContext && refToUri(filterContext),
            },
        };
    } else if (isWidgetAttachment(scheduledMailAttachment)) {
        const { widgetDashboard, widget, filterContext, formats, exportOptions } = scheduledMailAttachment;

        return {
            visualizationWidgetAttachment: {
                uri: refToUri(widget),
                dashboardUri: refToUri(widgetDashboard),
                formats,
                filterContext: filterContext && refToUri(filterContext),
                exportOptions: exportOptions && {
                    includeFilterContext: exportOptions.includeFilters ? "yes" : "no",
                    mergeHeaders: exportOptions.mergeHeaders ? "yes" : "no",
                },
            },
        };
    }
    throw new UnexpectedError(
        "Cannot convert scheduled email attachment - only dashboard and widget attachments are supported!",
    );
};

export const convertScheduledMail = (
    scheduledMail: IScheduledMail | IScheduledMailDefinition,
): GdcScheduledMail.IWrappedScheduledMail => {
    const {
        title,
        description,
        uri,
        identifier,
        body,
        subject,
        to,
        when,
        bcc,
        lastSuccessful,
        unsubscribed,
        attachments,
        unlisted,
    } = scheduledMail;

    return {
        scheduledMail: {
            content: {
                attachments: attachments.map(convertScheduledMailAttachment),
                body,
                subject,
                to,
                when: {
                    startDate: when.startDate,
                    endDate: when.endDate,
                    timeZone: when.timeZone,
                    recurrency: when.recurrence,
                },
                bcc,
                lastSuccessfull: lastSuccessful,
                unsubscribed,
            },
            meta: {
                unlisted: unlisted ? 1 : 0,
                ...(uri
                    ? {
                          uri,
                          identifier,
                      }
                    : {}),
                title,
                summary: description,
            },
        },
    };
};

export const convertDashboardPlugin = (
    plugin: IDashboardPlugin | IDashboardPluginDefinition,
): GdcDashboardPlugin.IWrappedDashboardPlugin => {
    const { uri, identifier, name, tags, description, url } = plugin;

    return {
        dashboardPlugin: {
            content: {
                url,
            },
            meta: {
                ...(uri ? { uri, identifier } : {}),
                title: name,
                summary: description,
                tags: tags?.join(" "),
            },
        },
    };
};
