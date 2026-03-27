// (C) 2026 GoodData Corporation

/**
 * Hand-curated public types from the AAC schema provided by @gooddata/sdk-code-schemas.
 * This file isolates api-extractor from the generated metadata.ts internals
 * (which contain anonymous union members like Visualisation1-22, Id4-16, etc.).
 */

import type {
    AttributeHierarchy,
    Dashboard,
    DashboardFilters,
    Dataset,
    DateDataset,
    Metadata,
    Metric,
    Plugin,
    Query,
    Section,
    Visualisation,
} from "@gooddata/sdk-code-schemas/v1";

/** @public */
export type AacAttributeHierarchy = AttributeHierarchy;
/** @public */
export type AacDashboard = Dashboard;
/** @public */
export type AacDashboardFilters = DashboardFilters;
/** @public */
export type AacDataset = Dataset;
/** @public */
export type AacDateDataset = DateDataset;
/** @public */
export type AacMetadata = Metadata;
/** @public */
export type AacMetric = Metric;
/** @public */
export type AacPlugin = Plugin;
/** @public */
export type AacQuery = Query;
/** @public */
export type AacSection = Section;
/** @public */
export type AacVisualisation = Visualisation;
