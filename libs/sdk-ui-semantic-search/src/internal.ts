// (C) 2024-2025 GoodData Corporation

/**
 * This package provides React hooks and components for semantic search integration with GoodData apps,
 * like AD, KD, data modeler, home ui etc.
 * @packageDocumentation
 * @internal
 */

export * from "./FooterButtonAiAssistant.js";
export * from "./internal/SearchOverlay.js";
export * from "./hooks/useSearchMetrics.js";
export { LeveledSearchTreeView, type LeveledSearchTreeViewProps } from "./internal/LeveledSearchTreeView.js";
export { buildSemanticSearchTreeViewItems } from "./internal/itemsBuilder.js";
export { IntlWrapper as SemanticSearchIntlProvider } from "./localization/IntlWrapper.js";
