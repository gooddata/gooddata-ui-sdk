// (C) 2007-2026 GoodData Corporation

import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalWorkspace } from "@gooddata/sdk-backend-spi";

import { adoptHostBackend, reinitializeBackend } from "../backend.js";

import { checkMetricOverrides, getMetricsEditorUrl, setupSessionId } from "./api.js";

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

describe("getMetricsEditorUrl", () => {
    const projectId = "projectId";
    it("should return URL to metric editor with the given metric", () => {
        expect(getMetricsEditorUrl(projectId, "metric/uri/")).toEqual(
            `/#s=/gdc/projects/${projectId}|objectPage|metric/uri/`,
        );
    });

    it("should return URL to metric editor for creating the new metric when no metric URI is provided", () => {
        expect(getMetricsEditorUrl(projectId)).toEqual(
            `/#s=/gdc/projects/${projectId}|objectPage|none|metric`,
        );
    });
});

describe("checkMetricOverrides", () => {
    afterEach(() => {
        reinitializeBackend();
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
