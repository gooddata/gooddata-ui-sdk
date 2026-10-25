// (C) 2020-2026 GoodData Corporation

import { backend } from "../backend.js";

export const isCsvExportSupported = () => !!backend.capabilities.canExportCsv;
export const isXlsxExportSupported = () => !!backend.capabilities.canExportXlsx;
export const isCreateReportSupported = () => !!backend.capabilities["supportsLegacyReports"];
export const canManageMetadata = () => false;
export const isRankingFilterSupported = () => !!backend.capabilities.supportsRankingFilter;
export const isElementUrisSupported = () => !!backend.capabilities.supportsElementUris;
export const areGenericDateAttributeElementsSupported = () =>
    !!backend.capabilities.supportsGenericDateAttributeElements;
export const isExplainSupported = () => !!backend.capabilities.supportsExplain;
export const isOwnershipSupported = () => !!backend.capabilities.supportsOwners;
export const supportsTimeGranularities = () => !!backend.capabilities.supportsTimeGranularities;
export const supportsExportToCsv = () => !!backend.capabilities.canExportCsv;
export const supportsExportToXlsx = () => !!backend.capabilities.canExportXlsx;
export const supportsAllAttributeValues = () => !!backend.capabilities.supportsShowAllAttributeValues;
export const supportsObjectUris = () => !!backend.capabilities.supportsObjectUris;
export const supportsNonProductionDatasets = () => !!backend.capabilities.supportsNonProductionDatasets;
export const supportsAttributeHierarchies = () => !!backend.capabilities.supportsAttributeHierarchies;
export const selectSupportsMultipleDateFilters = () => !!backend.capabilities.supportsMultipleDateFilters;
