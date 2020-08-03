// (C) 2007-2020 GoodData Corporation
import {
    Layout,
    IFluidLayoutRow,
    IFluidLayoutColumn,
    isLayoutWidget,
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
    LayoutDefinition,
    IFluidLayoutRowDefinition,
    IFluidLayoutColumnDefinition,
    isLayoutWidgetDefinition,
    isFluidLayoutDefinition,
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
import { ObjRef, isUriRef, objRefToString } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

const refToUri = (ref: ObjRef) => {
    if (isUriRef(ref)) {
        return ref.uri;
    }

    throw new UnexpectedError(
        "Identifiers are not supported in the bear dashboard model, first sanitize your object refs!",
    );
};

const convertLayoutColumn = (
    column: IFluidLayoutColumn | IFluidLayoutColumnDefinition,
): GdcDashboardLayout.IFluidLayoutColumn => {
    const { content, size, style } = column;
    if (isLayoutWidget(content)) {
        return {
            ...column,
            content: {
                widget: { qualifier: { uri: refToUri(content.widget.ref) } },
            },
        };
    } else if (isFluidLayout(content) || isFluidLayoutDefinition(content)) {
        return {
            ...column,
            content: convertLayout(content),
        };
    } else if (isLayoutWidgetDefinition(content)) {
        // This should never happen -> widgets in the layout should be already saved
        throw new Error("Cannot convert layout widget definition to bear model!");
    }

    return {
        size,
        content,
        style,
    };
};

const convertLayoutRow = (
    row: IFluidLayoutRow | IFluidLayoutRowDefinition,
): GdcDashboardLayout.IFluidLayoutRow => {
    return {
        ...row,
        columns: (row.columns as Array<IFluidLayoutColumn | IFluidLayoutColumnDefinition>).map((column) =>
            convertLayoutColumn(column),
        ),
    };
};

const convertLayout = (layout: Layout | LayoutDefinition): GdcDashboardLayout.Layout => {
    const {
        fluidLayout: { rows },
        fluidLayout,
    } = layout;
    const convertedLayout: GdcDashboardLayout.Layout = {
        fluidLayout: {
            ...fluidLayout,
            rows: (rows as Array<IFluidLayoutRow | IFluidLayoutRowDefinition>).map(convertLayoutRow),
        },
    };
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
        attributeFilter: { attributeElements, displayForm, negativeSelection },
    } = filterContextItem;
    const attributeElementsUris = attributeElements.map(refToUri);
    const displayFormUri = refToUri(displayForm);
    const convertedAttributeFilter: GdcFilterContext.IAttributeFilter = {
        attributeFilter: {
            negativeSelection,
            attributeElements: attributeElementsUris,
            displayForm: displayFormUri,
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
            // tslint:disable-next-line: no-object-literal-type-assertion
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
            // tslint:disable-next-line: no-object-literal-type-assertion
            meta: {
                summary: description,
                title,
                ...(isFilterContext(filterContext)
                    ? {
                          uri: refToUri(filterContext),
                          identifier: filterContext.identifier,
                      }
                    : {}),
            } as GdcMetadata.IObjectMeta,
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
    const {
        origin: { measure },
    } = drill;
    const drillFromMeasure = {
        drillFromMeasure: {
            localIdentifier: objRefToString(measure),
        },
    };

    if (isDrillToDashboard(drill)) {
        const drillToDashboard: GdcVisualizationWidget.IDrillToDashboard = {
            drillToDashboard: {
                from: drillFromMeasure,
                target: "in-place",
                toDashboard: objRefToString(drill.target),
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
    } else if (isDrillToLegacyDashboard(drill)) {
        const { tab } = drill;
        const kpiDrill: GdcKpi.IKpiProjectDashboardLink = {
            projectDashboard: refToUri(drill.target),
            projectDashboardTab: tab,
        };
        return kpiDrill;
    }

    throw new UnexpectedError("Unable to convert unknown drill!");
}

export const convertWidget = (
    widget: IWidget | IWidgetDefinition,
): GdcVisualizationWidget.IWrappedVisualizationWidget | GdcKpi.IWrappedKPI => {
    const { type, insight, kpi, ignoreDashboardFilters, dateDataSet, title, description, drills } = widget;
    // tslint:disable-next-line: no-object-literal-type-assertion
    const meta = {
        ...(isWidget(widget)
            ? {
                  identifier: widget.identifier,
                  uri: refToUri(widget.ref),
              }
            : {}),
        title,
        summary: description,
    } as GdcMetadata.IObjectMeta;
    const convertedDateDataSet = dateDataSet && refToUri(dateDataSet);
    const convertedIgnoredDashboardFilters = ignoreDashboardFilters.map(convertFilterReference);

    if (type === "kpi") {
        invariant(widget.kpi, "Widget type is kpi, but kpi props are not defined!");

        const kpiWidget: GdcKpi.IWrappedKPI = {
            kpi: {
                content: {
                    ...(isLegacyKpiWithComparison(kpi)
                        ? {
                              comparisonDirection: kpi.comparisonDirection,
                              comparisonType: kpi.comparisonType,
                          }
                        : {
                              comparisonType: kpi!.comparisonType,
                          }),
                    metric: refToUri(kpi!.metric),
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

    const visualizationWidget: GdcVisualizationWidget.IWrappedVisualizationWidget = {
        visualizationWidget: {
            content: {
                visualization: refToUri(insight!),
                ignoreDashboardFilters: convertedIgnoredDashboardFilters,
                dateDataSet: convertedDateDataSet,
                drills: drills
                    ? (drills as Array<IDrillToDashboard | IDrillToInsight>).map(convertDrill)
                    : [],
            },
            meta,
        },
    };

    return visualizationWidget;
};

const convertAbsoluteDateFilterPreset = (
    preset: IAbsoluteDateFilterPreset,
): GdcExtendedDateFilters.IDateFilterAbsolutePreset => {
    const { type, ...rest } = preset;
    return rest;
};

const convertRelativeDateFilterPreset = (
    preset: IRelativeDateFilterPreset,
): GdcExtendedDateFilters.IDateFilterRelativePreset => {
    const { type, ...rest } = preset;
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
    const { filterContext, layout, ref, identifier, title, description, dateFilterConfig } = dashboard;
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
            // tslint:disable-next-line: no-object-literal-type-assertion
            meta: {
                ...(dashboardUri
                    ? {
                          uri: dashboardUri,
                          identifier,
                      }
                    : {}),
                title,
                summary: description,
            } as GdcMetadata.IObjectMeta,
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
            // tslint:disable-next-line: no-object-literal-type-assertion
            meta: {
                ...(alertUri
                    ? {
                          uri: alertUri,
                          identifier,
                      }
                    : {}),
                title,
                summary: description,
            } as GdcMetadata.IObjectMeta,
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
        lastSuccessfull,
        unsubscribed,
        attachments,
    } = scheduledMail;

    const convertedScheduledMail: GdcScheduledMail.IWrappedScheduledMail = {
        scheduledMail: {
            content: {
                attachments: attachments.map(convertScheduledMailAttachment),
                body,
                subject,
                to,
                when,
                bcc,
                lastSuccessfull,
                unsubscribed,
            },
            // tslint:disable-next-line: no-object-literal-type-assertion
            meta: {
                ...(uri
                    ? {
                          uri,
                          identifier,
                      }
                    : {}),
                title,
                summary: description,
            } as GdcMetadata.IObjectMeta,
        },
    };

    return convertedScheduledMail;
};
