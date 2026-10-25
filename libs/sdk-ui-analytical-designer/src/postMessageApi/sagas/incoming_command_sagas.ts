// (C) 2020-2026 GoodData Corporation

import { all } from "redux-saga/effects";

import { watchAttributeHierarchyModified } from "./attribute_hierarchy_modified_saga.js";
import { watchCatalogLoaded } from "./catalog_loaded_saga.js";
import { watchClearInsightContent } from "./clear_insight_content_saga.js";
import { watchClear } from "./clear_insight_saga.js";
import { watchInsecureCommand } from "./command_error_saga.js";
import { watchCommandReceived } from "./command_received_saga.js";
import { watchControlFiltering } from "./control_filtering_saga.js";
import { watchExportInsight } from "./export_insight_saga.js";
import { watchInsightChanged } from "./insight_changed_saga.js";
import { watchEmbeddedReady } from "./listening_drillable_items_saga.js";
import { watchOpenInsight } from "./open_insight_saga.js";
import { watchRedo } from "./redo_saga.js";
import { watchInsightRendered } from "./render_insight_saga.js";
import { watchSaveInsight } from "./save_insight_saga.js";
import { watchUndo } from "./undo_saga.js";

export function* watchIncomingCommands() {
    yield all([
        watchCommandReceived(),
        watchInsecureCommand(),
        watchEmbeddedReady(),
        watchClear(),
        watchClearInsightContent(),
        watchOpenInsight(),
        watchSaveInsight(),
        watchExportInsight(),
        watchUndo(),
        watchRedo(),
        watchControlFiltering(),
        watchInsightRendered(),
        watchCatalogLoaded(),
        watchInsightChanged(),
        watchAttributeHierarchyModified(),
    ]);
}
