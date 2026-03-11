// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";
import { v4 as uuid } from "uuid";

import {
    type AutomationAutomationImageExport,
    type AutomationAutomationSlidesExport,
    type AutomationAutomationTabularExport,
    type AutomationAutomationVisualExport,
    type AutomationDashboardExportSettings,
    type ITigerFilter,
    type ITigerFilterContextItem,
    type JsonApiAutomationOutAttributesDashboardTabularExportsInner,
    type JsonApiAutomationOutAttributesRawExportsInner,
    type JsonApiExportDefinitionOutIncludes,
    type JsonApiExportDefinitionOutWithLinks,
    type TabularExportRequest,
    type VisualExportRequest,
    isTigerFilters,
} from "@gooddata/api-client-tiger";
import {
    type FilterContextItem,
    type IExportDefinitionDashboardRequestPayload,
    type IExportDefinitionDashboardSettings,
    type IExportDefinitionMetadataObject,
    type IExportDefinitionRequestPayload,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IExportDefinitionVisualizationObjectSettings,
    idRef,
} from "@gooddata/sdk-model";

import { convertFilter } from "./afm/FilterConverter.js";
import { type IIncludedWithUserIdentifier, convertUserIdentifier } from "./UsersConverter.js";
import { convertTigerToSdkFilters } from "../shared/storedFilterConverter.js";

type AutomationDashboardExportPageOrientation = NonNullable<
    AutomationDashboardExportSettings["pageOrientation"]
>;

const mapPageOrientationToLegacyOrientation = (
    value?: AutomationDashboardExportPageOrientation,
): "portrait" | "landscape" | undefined => {
    if (value === "PORTRAIT") {
        return "portrait";
    }
    if (value === "LANDSCAPE") {
        return "landscape";
    }
    return undefined;
};

const normalizeExportDefinitionSettings = (
    settings?: AutomationDashboardExportSettings,
): IExportDefinitionVisualizationObjectSettings | IExportDefinitionDashboardSettings | undefined => {
    if (!settings) {
        return undefined;
    }
    const { pageOrientation, ...rest } = settings;
    const orientation = mapPageOrientationToLegacyOrientation(pageOrientation);

    return {
        ...rest,
        ...(orientation ? { orientation } : {}),
    };
};

type MetadataObjectDefinition<T extends ITigerFilter | ITigerFilterContextItem = ITigerFilterContextItem> = {
    widget?: string;
    visualizationObject?: string;
    dashboard?: string;
    title?: string;
    filters?: T[];
    filtersByTab?: Record<string, ITigerFilterContextItem[]>;
};

const convertTigerToDashboardFilters = (
    filters: ITigerFilterContextItem[] | undefined,
): FilterContextItem[] | undefined => convertTigerToSdkFilters(filters);

export const wrapExportDefinition = (
    requestPayload: IExportDefinitionRequestPayload,
    metadata?: MetadataObjectDefinition,
): IExportDefinitionMetadataObject => {
    const id = uuid();
    return {
        type: "exportDefinition",
        id,
        uri: id,
        ref: idRef(id, "exportDefinition"),
        title: metadata?.title ?? requestPayload.fileName,
        description: "",
        tags: [],
        requestPayload,
        production: true,
        deprecated: false,
        unlisted: false,
    };
};

export const convertDashboardTabularExportRequest = (
    exportRequest: JsonApiAutomationOutAttributesDashboardTabularExportsInner,
): IExportDefinitionDashboardRequestPayload | IExportDefinitionVisualizationObjectRequestPayload => {
    const {
        requestPayload: {
            fileName,
            format,
            dashboardId,
            settings,
            dashboardFiltersOverride,
            dashboardTabsFiltersOverrides,
            widgetIds,
        },
    } = exportRequest;

    const normalizedSettings = normalizeExportDefinitionSettings(settings);

    if (widgetIds && widgetIds.length > 0) {
        const widgetId = widgetIds[0];

        return {
            type: "visualizationObject",
            fileName,
            format: format === "PDF" ? "PDF_TABULAR" : format,
            settings: normalizedSettings,
            content: {
                dashboard: dashboardId,
                visualizationObject: widgetId ?? "",
                widget: widgetId,
                filters: convertTigerToDashboardFilters(dashboardFiltersOverride),
            },
        };
    }

    // Convert dashboardTabsFiltersOverrides to filtersByTab
    const filtersByTab = dashboardTabsFiltersOverrides
        ? Object.entries(dashboardTabsFiltersOverrides).reduce<Record<string, FilterContextItem[]>>(
              (acc, [tabId, tabFilters]) => {
                  acc[tabId] = convertTigerToDashboardFilters(tabFilters) ?? [];
                  return acc;
              },
              {},
          )
        : undefined;

    return {
        type: "dashboard",
        fileName,
        format,
        settings: normalizedSettings,
        content: {
            dashboard: dashboardId,
            filters: convertTigerToDashboardFilters(dashboardFiltersOverride),
            filtersByTab,
        },
    };
};

export const convertVisualExportRequest = (
    exportRequest: AutomationAutomationVisualExport,
    enableAutomationFilterContext: boolean,
): IExportDefinitionDashboardRequestPayload => {
    const {
        requestPayload: { fileName, dashboardId, metadata: metadataObj },
    } = exportRequest;

    const metadata = metadataObj as MetadataObjectDefinition | undefined;
    const filters = convertTigerToSdkFilters(metadata?.filters);
    const filtersObj = metadata?.filters ? { filters } : {};

    // Convert filtersByTab from metadata
    const filtersByTab =
        enableAutomationFilterContext && metadata?.filtersByTab
            ? Object.entries(metadata.filtersByTab).reduce<Record<string, FilterContextItem[]>>(
                  (acc, [tabId, tabFilters]) => {
                      acc[tabId] = convertTigerToSdkFilters(tabFilters) ?? [];
                      return acc;
                  },
                  {},
              )
            : undefined;
    const filtersByTabObj = filtersByTab ? { filtersByTab } : {};

    return {
        type: "dashboard",
        fileName,
        format: "PDF",
        content: {
            dashboard: dashboardId,
            ...filtersObj,
            ...filtersByTabObj,
        },
    };
};

export const convertToRawExportRequest = (
    exportRequest: JsonApiAutomationOutAttributesRawExportsInner,
): IExportDefinitionVisualizationObjectRequestPayload => {
    const {
        requestPayload: { fileName, execution, metadata },
    } = exportRequest;
    const metadataObj = (metadata ?? {}) as MetadataObjectDefinition<ITigerFilter>;
    const filters = execution?.filters?.map(convertFilter);
    const metadataFilters = convertTigerToSdkFilters(metadataObj?.filters);
    const resolvedFilters = metadataFilters && metadataFilters.length > 0 ? metadataFilters : filters;
    const filtersObj = resolvedFilters && resolvedFilters.length > 0 ? { filters: resolvedFilters } : {};
    return {
        type: "visualizationObject",
        fileName,
        format: "CSV_RAW",
        content: {
            visualizationObject: metadataObj.visualizationObject ?? "",
            widget: metadataObj.widget ?? "",
            ...(metadataObj.dashboard ? { dashboard: metadataObj.dashboard } : {}),
            ...filtersObj,
        },
    };
};

export const convertImageExportRequest = (
    exportRequest: AutomationAutomationImageExport,
): IExportDefinitionVisualizationObjectRequestPayload => {
    const {
        requestPayload: { fileName, dashboardId, metadata, format, widgetIds },
    } = exportRequest;

    const tigerMetadata = metadata as MetadataObjectDefinition<ITigerFilter> | undefined;

    return {
        type: "visualizationObject",
        fileName,
        format,
        content: {
            visualizationObject: widgetIds?.[0] ?? "",
            widget: widgetIds?.[0] ?? "",
            dashboard: dashboardId,
            filters: convertTigerToSdkFilters(tigerMetadata?.filters),
        },
    };
};

export const convertSlidesExportRequest = (
    exportRequest: AutomationAutomationSlidesExport,
): IExportDefinitionVisualizationObjectRequestPayload | IExportDefinitionDashboardRequestPayload => {
    const {
        requestPayload: { fileName, format, dashboardId, widgetIds, metadata },
    } = exportRequest;

    if (Array.isArray(widgetIds) && widgetIds.length > 0) {
        const tigerMetadata = metadata as MetadataObjectDefinition<ITigerFilter> | undefined;

        return {
            type: "visualizationObject",
            fileName,
            format,
            content: {
                visualizationObject: widgetIds?.[0] ?? "",
                dashboard: dashboardId,
                widget: tigerMetadata?.widget,
                filters: convertTigerToSdkFilters(tigerMetadata?.filters),
            },
        };
    }

    const metadataObj = metadata as MetadataObjectDefinition | undefined;
    const filters = convertTigerToSdkFilters(metadataObj?.filters);

    // Convert filtersByTab from metadata
    const filtersByTab = metadataObj?.filtersByTab
        ? Object.entries(metadataObj.filtersByTab).reduce<Record<string, FilterContextItem[]>>(
              (acc, [tabId, tabFilters]) => {
                  acc[tabId] = convertTigerToSdkFilters(tabFilters) ?? [];
                  return acc;
              },
              {},
          )
        : undefined;

    return {
        type: "dashboard",
        fileName,
        format: format === "PDF" ? "PDF_SLIDES" : format,
        content: {
            dashboard: dashboardId,
            filters,
            filtersByTab,
        },
    } as IExportDefinitionDashboardRequestPayload;
};

export const convertTabularExportRequest = (
    exportRequest: AutomationAutomationTabularExport,
): IExportDefinitionVisualizationObjectRequestPayload => {
    const {
        requestPayload: {
            fileName,
            metadata: metadataObj,
            format,
            visualizationObject,
            relatedDashboardId,
            visualizationObjectCustomFilters,
            settings,
        },
    } = exportRequest;
    const metadata = metadataObj as MetadataObjectDefinition<ITigerFilter> | undefined;

    if (visualizationObjectCustomFilters && !isTigerFilters(visualizationObjectCustomFilters)) {
        throw new Error("Invalid visualizationObjectCustomFilters format");
    }

    return {
        type: "visualizationObject",
        fileName,
        format,
        settings,
        content: {
            visualizationObject: visualizationObject ?? "",
            filters: convertTigerToSdkFilters(visualizationObjectCustomFilters),
            dashboard: relatedDashboardId,
            widget: metadata?.widget,
        },
    };
};

export const convertExportDefinitionMdObject = (
    exportDefinitionOut: JsonApiExportDefinitionOutWithLinks,
    included: JsonApiExportDefinitionOutIncludes[] = [],
    enableAutomationFilterContext: boolean,
): IExportDefinitionMetadataObject => {
    const { id, attributes, links, relationships = {} } = exportDefinitionOut;
    const { createdBy, modifiedBy } = relationships;
    const {
        title = "",
        description = "",
        tags = [],
        requestPayload,
        createdAt,
        modifiedAt,
    } = attributes ?? {};
    const request = convertExportDefinitionRequestPayload(
        requestPayload as VisualExportRequest | TabularExportRequest,
        enableAutomationFilterContext,
    );

    return {
        type: "exportDefinition",
        id,
        uri: links?.self ?? id,
        ref: idRef(id, "exportDefinition"),
        title,
        description,
        tags,
        requestPayload: request,
        created: createdAt ?? undefined,
        updated: modifiedAt ?? undefined,
        createdBy: convertUserIdentifier(createdBy, included as IIncludedWithUserIdentifier[]),
        updatedBy: convertUserIdentifier(modifiedBy, included as IIncludedWithUserIdentifier[]),
        production: true,
        deprecated: false,
        unlisted: false,
    };
};

export const convertInlineExportDefinitionMdObject = (
    exportDefinitionOut: AutomationAutomationTabularExport | AutomationAutomationVisualExport,
    enableAutomationFilterContext: boolean,
): IExportDefinitionMetadataObject => {
    const id = uuid();
    const request = convertExportDefinitionRequestPayload(
        exportDefinitionOut.requestPayload,
        enableAutomationFilterContext,
    );
    const metadata = exportDefinitionOut.requestPayload.metadata as MetadataObjectDefinition | undefined;

    return {
        type: "exportDefinition",
        id,
        uri: id,
        ref: idRef(id, "exportDefinition"),
        title: metadata?.title ?? "",
        description: "",
        tags: [],
        requestPayload: request,
        production: true,
        deprecated: false,
        unlisted: false,
    };
};

const convertExportDefinitionRequestPayload = (
    exportRequest: VisualExportRequest | TabularExportRequest,
    enableAutomationFilterContext: boolean,
): IExportDefinitionRequestPayload => {
    if (isTabularRequest(exportRequest)) {
        const { widget } = (exportRequest.metadata as MetadataObjectDefinition) ?? {};

        const filters = exportRequest.visualizationObjectCustomFilters as ITigerFilter[] | undefined;
        const filtersObj = filters ? { filters: convertTigerToSdkFilters(filters) } : {};

        const { mergeHeaders, pdfPageSize, pageOrientation } = exportRequest.settings ?? {};
        const orientation =
            pdfPageSize === "portrait" || pdfPageSize === "landscape"
                ? pdfPageSize
                : (mapPageOrientationToLegacyOrientation(pageOrientation) ?? "portrait");
        const settings: IExportDefinitionVisualizationObjectSettings = {
            ...(exportRequest.format === "PDF" ? { orientation } : {}),
            ...(mergeHeaders ? { mergeHeaders } : {}),
        };
        const settingsObj = isEmpty(settings) ? {} : { settings };

        return {
            type: "visualizationObject",
            fileName: exportRequest.fileName,
            format: exportRequest.format,
            content: {
                visualizationObject: exportRequest.visualizationObject ?? "",
                dashboard: exportRequest.relatedDashboardId ?? "",
                widget,
                ...filtersObj,
            },
            ...settingsObj,
        };
    } else {
        const metadata = exportRequest.metadata as MetadataObjectDefinition | undefined;
        const filters = convertTigerToSdkFilters(metadata?.filters);
        const filtersObj = filters ? { filters } : {};

        // Convert filtersByTab from metadata
        const filtersByTab =
            enableAutomationFilterContext && metadata?.filtersByTab
                ? Object.entries(metadata.filtersByTab).reduce<Record<string, FilterContextItem[]>>(
                      (acc, [tabId, tabFilters]) => {
                          acc[tabId] = convertTigerToSdkFilters(tabFilters) ?? [];
                          return acc;
                      },
                      {},
                  )
                : undefined;
        const filtersByTabObj = filtersByTab ? { filtersByTab } : {};

        return {
            type: "dashboard",
            fileName: exportRequest.fileName,
            format: "PDF",
            content: {
                dashboard: exportRequest.dashboardId,
                ...filtersObj,
                ...filtersByTabObj,
            },
        };
    }
};

const isTabularRequest = (
    request: VisualExportRequest | TabularExportRequest,
): request is TabularExportRequest => {
    return !isEmpty(request) && typeof (request as TabularExportRequest).visualizationObject === "string";
};
