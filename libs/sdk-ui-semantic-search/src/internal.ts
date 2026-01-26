// (C) 2024-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

/**
 * This package provides React hooks and components for semantic search integration with GoodData apps,
 * like AD, KD, data modeler, home ui etc.
 * @packageDocumentation
 * @internal
 */

export { type FooterButtonAiAssistantProps, FooterButtonAiAssistant } from "./FooterButtonAiAssistant.js";
export { type SearchOnSelect, type SearchOverlayProps, SearchOverlay } from "./internal/SearchOverlay.js";
export {
    type ISearchMetrics,
    type UseSearchMetricsCallback,
    type UseSearchMetricsReturn,
    useSearchMetrics,
} from "./hooks/useSearchMetrics.js";
export { LeveledSearchTreeView, type LeveledSearchTreeViewProps } from "./internal/LeveledSearchTreeView.js";
export { buildSemanticSearchTreeViewItems } from "./internal/itemsBuilder.js";
export { IntlWrapper as SemanticSearchIntlProvider } from "./localization/IntlWrapper.js";
