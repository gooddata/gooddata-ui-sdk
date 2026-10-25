// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { getIsEmbedded } from "../../selectors/meta_selector.js";
import { catalogLoaded } from "../outgoing/catalog_loaded_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { notifyCatalogLoaded } from "./catalog_loaded_saga.js";

describe("Catalog loaded saga", () => {
    it("should notify outer app when the catalog has been loaded in embedded mode", async () => {
        const availableCommands = ["drillableItems", "openInsight", "setFilterContext"];
        await expectSaga(notifyCatalogLoaded)
            .provide([
                [select(getIsEmbedded), true],
                [select(availableCommandsSelector), availableCommands],
            ])
            .call(catalogLoaded, availableCommands)
            .silentRun();
    });

    it("should not notify outer app when the catalog has been loaded (not in embedded mode)", async () => {
        await expectSaga(notifyCatalogLoaded)
            .provide([[select(getIsEmbedded), false]])
            .not.call(catalogLoaded)
            .silentRun();
    });
});
