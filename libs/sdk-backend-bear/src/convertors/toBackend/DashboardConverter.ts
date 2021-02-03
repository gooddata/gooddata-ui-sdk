// (C) 2007-2021 GoodData Corporation
import {
    isFluidLayout,
    IDashboard,
    layoutWidgets,
    IWidget,
    IDashboardFilterReference,
    isDashboardDateFilterReference,
    isLegacyKpiWithComparison,
    IWidgetDefinition,
    isWidget,
    ITempFilterContext,
    IFilterContext,
    isTempFilterContext,
    isDashboardDateFilter,
    FilterContextItem,
    IFilterContextDefinition,
    isFilterContext,
    IDashboardDefinition,
    UnexpectedError,
    DrillDefinition,
    IDrillToLegacyDashboard,
    IDrillToInsight,
    IDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    isDrillToDashboard,
    IWidgetAlert,
    IWidgetAlertDefinition,
    ScheduledMailAttachment,
    IScheduledMail,
    IScheduledMailDefinition,
    IDashboardDateFilterConfig,
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IDrillToCustomUrl,
    IDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToAttributeUrl,
    IDashboardLayoutColumn,
    IFluidLayoutSizeByScreen,
    IFluidLayoutSize,
    isWidgetDefinition,
    IDashboardLayoutRow,
    ResponsiveScreenType,
    IDashboardLayout,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    GdcDashboardLayout,
    GdcDashboard,
    GdcVisualizationWidget,
    GdcKpi,
    GdcExtendedDateFilters,
    GdcMetadata,
    GdcFilterContext,
    GdcScheduledMail,
} from "@gooddata/api-model-bear";
import {
    ObjRef,
    isUriRef,
    isAttributeElementsByValue,
    isIdentifierRef,
    ObjRefInScope,
    isLocalIdRef,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { convertUrisToReferences } from "../fromBackend/ReferenceConverter";
import isEmpty from "lodash/isEmpty";
import omitBy from "lodash/omitBy";
import { serializeProperties } from "../fromBackend/PropertiesConverter";

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

export const convertResponsiveSize = (size: IFluidLayoutSize): GdcDashboardLayout.IFluidLayoutSize => {
    const converted: GdcDashboardLayout.IFluidLayoutSize = {
        width: size.widthAsGridColumnsCount,
    };
    if (size.heightAsRatio) {
        converted.heightAsRatio = size.heightAsRatio;
    }

    return converted;
};

export const convertLayoutColumnSize = (
    column: IFluidLayoutSizeByScreen,
): GdcDashboardLayout.IFluidLayoutColSize => {
    const allScreens: ResponsiveScreenType[] = ["xl", "md", "lg", "sm", "xs"];
    return allScreens.reduce((acc: GdcDashboardLayout.IFluidLayoutColSize, el) => {
        const size = column[el];
        if (size) {
            return {
                ...acc,
                [el]: convertResponsiveSize(size),
            };
        }

        return acc;
    }, {} as GdcDashboardLayout.IFluidLayoutColSize);
};

const convertLayoutColumn = (column: IDashboardLayoutColumn): GdcDashboardLayout.IFluidLayoutColumn => {
    const { content, size, style } = column;
    if (isWidget(content)) {
        const converted: GdcDashboardLayout.IFluidLayoutColumn = {
            size: convertLayoutColumnSize(size),
            content: {
                widget: { qualifier: { uri: refToUri(content!.ref!) } },
            },
        };
        if (style) {
            converted.style = style;
        }

        return converted;
    } else if (isFluidLayout(content)) {
        return {
            ...column,
            size: convertLayoutColumnSize(size),
            content: convertLayout(content),
        };
    } else if (isWidgetDefinition(content)) {
        // This should never happen -> widgets in the layout should be already saved
        throw new Error("Cannot convert layout widget definition to bear model!");
    }

    return {
        size: convertLayoutColumnSize(size),
        style,
    };
};

const convertLayoutRow = (row: IDashboardLayoutRow): GdcDashboardLayout.IFluidLayoutRow => {
    const convertedRow: GdcDashboardLayout.IFluidLayoutRow = {
        columns: row.columns.map((column) => convertLayoutColumn(column)),
    };
    if (row.header) {
        // Ignore empty strings in header
        const headerWithoutEmptyStrings = omitBy(row.header, (x) => !x);
        const isEmptyHeader = isEmpty(headerWithoutEmptyStrings);
        if (!isEmptyHeader) {
            const header = {} as GdcDashboardLayout.ISectionHeader;
            if (row.header?.title) {
                header.title = row.header.title;
            }
            if (row.header?.description) {
                header.description = row.header.description;
            }
            convertedRow.header = header;
        }
    }

    if (row.style) {
        convertedRow.style = row.style;
    }

    return convertedRow;
};

const convertLayout = (layout: IDashboardLayout): GdcDashboardLayout.Layout => {
    const { rows } = layout;
    const convertedLayout: GdcDashboardLayout.Layout = {
        fluidLayout: {
            rows: rows.map(convertLayoutRow),
        },
    };
    if (layout.size) {
        convertedLayout.fluidLayout.size = convertResponsiveSize(layout.size);
    }

    if (layout.style) {
        convertedLayout.fluidLayout.style = layout.style;
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
                from,
                to,
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
            filterElementsBy = [],
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

    const convertedAttributeFilter: GdcFilterContext.IAttributeFilter = {
        attributeFilter: {
            negativeSelection,
            attributeElements: attributeElements.uris,
            displayForm: displayFormUri,
            localIdentifier,
            filterElementsBy: convertedAttributeFilterParents,
        },
    };

    return convertedAttributeFilter;
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

        const convertedTempFilterContext: GdcFilterContext.IWrappedTempFilterContext = {
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

        return convertedTempFilterContext;
    }

    const { description, filters, title } = filterContext;

    const convertedFilterContext: GdcFilterContext.IWrappedFilterContext = {
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

    return convertedFilterContext;
}

const convertFilterReference = (
    filterReference: IDashboardFilterReference,
): GdcExtendedDateFilters.IDateFilterReference | GdcExtendedDateFilters.IAttributeFilterReference => {
    if (isDashboardDateFilterReference(filterReference)) {
        const convertedDateFilterReference: GdcExtendedDateFilters.IDateFilterReference = {
            dateFilterReference: {
                dataSet: refToUri(filterReference.dataSet),
            },
        };
        return convertedDateFilterReference;
    }

    const convertedAttributeFilterReference: GdcExtendedDateFilters.IAttributeFilterReference = {
        attributeFilterReference: {
            displayForm: refToUri(filterReference.displayForm),
        },
    };

    return convertedAttributeFilterReference;
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
        const kpiDrill: GdcKpi.IKpiProjectDashboardLink = {
            projectDashboard: refToUri(drill.target),
            projectDashboardTab: tab,
        };
        return kpiDrill;
    }

    const {
        origin: { measure },
    } = drill;
    const drillFromMeasure = {
        drillFromMeasure: {
            localIdentifier: refToLocalId(measure),
        },
    };

    if (isDrillToDashboard(drill)) {
        const drillToDashboard: GdcVisualizationWidget.IDrillToDashboard = {
            drillToDashboard: {
                from: drillFromMeasure,
                target: "in-place",
                toDashboard: drill.target !== undefined ? refToIdentifier(drill.target) : undefined,
            },
        };

        return drillToDashboard;
    } else if (isDrillToInsight(drill)) {
        const drillToInsight: GdcVisualizationWidget.IDrillToVisualization = {
            drillToVisualization: {
                from: drillFromMeasure,
                target: "pop-up",
                toVisualization: {
                    uri: refToUri(drill.target),
                },
            },
        };

        return drillToInsight;
    } else if (isDrillToCustomUrl(drill)) {
        const drillToCustomUrl: GdcVisualizationWidget.IDrillToCustomUrl = {
            drillToCustomUrl: {
                from: drillFromMeasure,
                target: "new-window",
                customUrl: drill.target.url,
            },
        };
        return drillToCustomUrl;
    } else if (isDrillToAttributeUrl(drill)) {
        const drillToAttributeUrl: GdcVisualizationWidget.IDrillToAttributeUrl = {
            drillToAttributeUrl: {
                from: drillFromMeasure,
                target: "new-window",
                drillToAttributeDisplayForm: { uri: refToUri(drill.target.hyperlinkDisplayForm) },
                insightAttributeDisplayForm: { uri: refToUri(drill.target.displayForm) },
            },
        };

        return drillToAttributeUrl;
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
        const { kpi } = widget;

        const kpiWidget: GdcKpi.IWrappedKPI = {
            kpi: {
                content: {
                    ...(isLegacyKpiWithComparison(kpi)
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
                },
                meta,
            },
        };

        return kpiWidget;
    }

    const { insight, properties: widgetProperties = {} } = widget;

    const { properties, references } = convertUrisToReferences({
        properties: widgetProperties,
        references: {},
    });

    const nonEmptyProperties = omitBy(properties, (value, key) => key !== "controls" && isEmpty(value));

    const visualizationWidget: GdcVisualizationWidget.IWrappedVisualizationWidget = {
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
            },
            meta,
        },
    };

    return visualizationWidget;
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
    } = dashboard;
    const convertedLayout = layout && convertLayout(layout);
    const widgets = layout && layoutWidgets(layout);
    const dashboardUri = ref && refToUri(ref);
    const filterContextUri = filterContext?.ref && refToUri(filterContext.ref);
    const convertedDateFilterConfig = dateFilterConfig && convertDateFilterConfig(dateFilterConfig);

    const legacyDashboard: GdcDashboard.IWrappedAnalyticalDashboard = {
        analyticalDashboard: {
            content: {
                ...(convertedDateFilterConfig && { dateFilterConfig: convertedDateFilterConfig }),
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
            },
        },
    };

    return legacyDashboard;
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

    const convertedKpiAlert: GdcMetadata.IWrappedKpiAlert = {
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

    return convertedKpiAlert;
};

export const convertScheduledMailAttachment = (
    scheduledMailAttachment: ScheduledMailAttachment,
): GdcScheduledMail.ScheduledMailAttachment => {
    const { dashboard, format, filterContext } = scheduledMailAttachment;

    const convertedAttachment: GdcScheduledMail.IKpiDashboardAttachment = {
        kpiDashboardAttachment: {
            uri: refToUri(dashboard),
            format,
            filterContext: filterContext && refToUri(filterContext),
        },
    };

    return convertedAttachment;
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

    const convertedScheduledMail: GdcScheduledMail.IWrappedScheduledMail = {
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

    return convertedScheduledMail;
};
