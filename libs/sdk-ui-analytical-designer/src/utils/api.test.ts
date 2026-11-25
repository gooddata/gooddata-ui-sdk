// (C) 2007-2026 GoodData Corporation

import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalWorkspace } from "@gooddata/sdk-backend-spi";
import { type ObjRef, idRef, newPositiveAttributeFilter, objRefToString } from "@gooddata/sdk-model";

import { adoptHostBackend, resetBackend } from "../backend.js";
import { buildInitialState } from "../reducers/initial_state.js";
import { newInsight } from "../tests/insightMocking.test.helpers.js";

import { checkMetricOverrides, loadFilterElements, setupSessionId } from "./api.js";

describe("setup XHR", () => {
    let xhr: { setRequestHeader: Mock };

    beforeEach(() => {
        xhr = {
            setRequestHeader: vi.fn(),
        };
    });

    const getFirstArg = (stub: Mock) => stub.mock.calls[0][0];

    it("should setup xhr with session id", () => {
        setupSessionId(xhr, "id");
        expect(getFirstArg(xhr.setRequestHeader)).toEqual("X-GDC-REQUEST");
    });
});

describe("checkMetricOverrides", () => {
    afterEach(() => {
        resetBackend();
        vi.restoreAllMocks();
    });

    it("should check the metric identifiers through the measures service of the workspace", async () => {
        const checkEntityOverrides = vi.fn().mockResolvedValue([{ identifier: "m1", origins: ["parent"] }]);
        const instance = dummyBackend();
        const workspaceSpy = vi.spyOn(instance, "workspace").mockReturnValue({
            measures: () => ({ checkEntityOverrides }),
        } as unknown as IAnalyticalWorkspace);
        adoptHostBackend({ instance });

        const result = await checkMetricOverrides("ws", ["m1", "m2"]);

        expect(workspaceSpy).toHaveBeenCalledWith("ws");
        expect(checkEntityOverrides).toHaveBeenCalledWith(["m1", "m2"]);
        expect(result).toEqual([{ identifier: "m1", origins: ["parent"] }]);
    });
});

describe("loadFilterElements", () => {
    afterEach(() => {
        resetBackend();
        vi.restoreAllMocks();
    });

    const workingLabel = idRef("label.region", "displayForm");
    const failingLabel = idRef("label.computed", "displayForm");
    const insight = newInsight("local:table", "insight", "/insight", (m) =>
        m.filters([
            newPositiveAttributeFilter(workingLabel, { values: ["East"] }),
            newPositiveAttributeFilter(failingLabel, { values: ["High"] }),
        ]),
    );
    const eastElement = { uri: "East", title: "East" };

    function adoptElementsBackend() {
        const elementsLoader = (ref: ObjRef) => {
            const query = () =>
                objRefToString(ref) === objRefToString(failingLabel)
                    ? Promise.reject(new Error("Invalid filter for dimensionality"))
                    : Promise.resolve({ items: [eastElement], totalCount: 3 });
            const loader = { withLimit: () => loader, withOptions: () => loader, query };
            return loader;
        };
        const instance = dummyBackend();
        vi.spyOn(instance, "workspace").mockReturnValue({
            attributes: () => ({ elements: () => ({ forDisplayForm: elementsLoader }) }),
        } as unknown as IAnalyticalWorkspace);
        adoptHostBackend({ instance });
    }

    it("should keep the values of the filters that loaded when loading another filter's values fails", async () => {
        adoptElementsBackend();

        const result = await loadFilterElements(insight, buildInitialState());

        expect(result).toEqual({
            [objRefToString(workingLabel)]: { items: [eastElement], total: 3 },
        });
    });
});
