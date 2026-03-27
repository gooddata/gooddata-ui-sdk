// (C) 2026 GoodData Corporation

/**
 * Hand-curated public types from the auto-generated AAC schema.
 * This file isolates api-extractor from the generated metadata.ts internals
 * (which contain anonymous union members like Visualisation1-22, Id4-16, etc.).
 *
 * When code-schemas is migrated to this repo, metadata.ts will be replaced
 * with properly structured types and this file can be removed.
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
} from "./v1/metadata.js";

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
