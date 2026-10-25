// (C) 2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { afterEach, describe, it } from "vitest";

import { rootReducer } from "../../reducers/root_reducer.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { dismissRecommendations, storeDismissRecommendations } from "./recommendations_actions.js";
import { handleDismissRecommendations } from "./recommendations_sagas.js";

describe("handleDismissRecommendations", () => {
    // The saga really writes the key, and localStorage is shared by every test file in the worker
    // (the suite runs non-isolated). The dismissed list is seeded FROM localStorage when
    // recommendations_state.ts is first evaluated, so a key left behind here silently changes the
    // initial state of every file that runs after this one.
    afterEach(() => {
        localStorage.removeItem("dismissedRecommendations");
    });

    it("should store the dismissed vis class and persist the POST-reduction list to localStorage", async () => {
        // the persistence side effect lives in the saga — running
        // against the real root reducer proves the store put is reduced BEFORE the saga selects
        // the list it writes to localStorage
        await expectSaga(handleDismissRecommendations, dismissRecommendations("pie"))
            .withReducer(rootReducer, getInitializedState())
            .put(storeDismissRecommendations("pie"))
            .call([localStorage, "setItem"], "dismissedRecommendations", JSON.stringify(["pie"]))
            .silentRun();
    });
});
