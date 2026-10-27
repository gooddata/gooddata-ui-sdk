// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    EDITOR_WORKER_TRUSTED_TYPES_POLICY,
    createEditorWorkerFactory,
    getBundledEditorWorkerUrl,
    resolveEditorWorkerUrl,
    setupMonacoWorkers,
} from "./monacoWorkers.js";

const { WORKER_SOURCE } = vi.hoisted(() => ({ WORKER_SOURCE: "self.onmessage = () => {};" }));

vi.mock("../../../worker/monaco-editor-worker.source.js", () => ({ default: WORKER_SOURCE }));

const BLOB_URL = "blob:test";

function sameOriginAssetUrl(): string {
    return `${location.origin}/static/monaco-editor-worker.js`;
}

describe("monacoWorkers", () => {
    let blobs: Blob[];
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        blobs = [];
        vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
            blobs.push(blob as Blob);
            return BLOB_URL;
        });
        fetchMock = vi
            .fn()
            .mockResolvedValue({ ok: true, headers: new Headers({ "content-type": "text/javascript" }) });
        vi.stubGlobal("fetch", fetchMock);
    });

    describe("getBundledEditorWorkerUrl", () => {
        it("resolves the bundled worker in the package worker folder", () => {
            // three levels above src/MaqlEditor/monaco/ is the package root
            expect(getBundledEditorWorkerUrl()).toMatch(/\/worker\/monaco-editor-worker\.js$/);
            expect(getBundledEditorWorkerUrl()).not.toMatch(/\/(src|esm|MaqlEditor|monaco)\/worker\//);
        });
    });

    describe("resolveEditorWorkerUrl", () => {
        it("uses the bundled worker file when it is a same-origin file the server has", async () => {
            const assetUrl = sameOriginAssetUrl();

            await expect(resolveEditorWorkerUrl(assetUrl)).resolves.toBe(assetUrl);

            expect(fetchMock).toHaveBeenCalledWith(assetUrl, {
                method: "HEAD",
                signal: expect.any(AbortSignal),
            });
            expect(blobs).toHaveLength(0);
        });

        it("starts the inline worker when the bundled file redirects to another origin", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                url: "https://cdn.example.com/worker/monaco-editor-worker.js",
                headers: new Headers({ "content-type": "text/javascript" }),
            });

            await expect(resolveEditorWorkerUrl(sameOriginAssetUrl())).resolves.toBe(BLOB_URL);
        });

        it("starts the inline worker when the server does not have the bundled file", async () => {
            fetchMock.mockResolvedValue({ ok: false });

            await expect(resolveEditorWorkerUrl(sameOriginAssetUrl())).resolves.toBe(BLOB_URL);

            expect(blobs).toHaveLength(1);
            expect(blobs[0]!.type).toBe("text/javascript");
            await expect(blobs[0]!.text()).resolves.toBe(WORKER_SOURCE);
        });

        it("starts the inline worker when the server answers with HTML", async () => {
            fetchMock.mockResolvedValue({ ok: true, headers: new Headers({ "content-type": "text/html" }) });

            await expect(resolveEditorWorkerUrl(sameOriginAssetUrl())).resolves.toBe(BLOB_URL);
        });

        it("starts the inline worker when the probe fails", async () => {
            fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

            await expect(resolveEditorWorkerUrl(sameOriginAssetUrl())).resolves.toBe(BLOB_URL);
        });

        it.each([
            ["a file URL inlined by a bundler", "file:///app/node_modules/@gooddata/x/worker/w.js"],
            ["a data URL", "data:text/javascript;base64,AA=="],
            ["a cross-origin URL of a Module Federation remote", "https://cdn.example.com/worker/w.js"],
            ["an invalid URL", "not a url"],
        ])("starts the inline worker without a probe for %s", async (_name, assetUrl) => {
            await expect(resolveEditorWorkerUrl(assetUrl)).resolves.toBe(BLOB_URL);

            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe("createEditorWorkerFactory", () => {
        let workers: Array<{ url: unknown; options: WorkerOptions }>;
        let originalEnvironment: typeof globalThis.MonacoEnvironment;

        beforeEach(() => {
            workers = [];
            originalEnvironment = globalThis.MonacoEnvironment;
            vi.stubGlobal(
                "Worker",
                class {
                    constructor(url: unknown, options: WorkerOptions) {
                        workers.push({ url, options });
                    }
                },
            );
        });

        it("starts a module worker named by the label", async () => {
            const getWorker = createEditorWorkerFactory(vi.fn().mockResolvedValue(BLOB_URL));

            await getWorker("workerId", "editorWorkerService");

            expect(workers).toEqual([
                { url: BLOB_URL, options: { type: "module", name: "editorWorkerService" } },
            ]);
        });

        it("resolves the worker URL once and shares it between workers", async () => {
            const resolveWorkerUrl = vi.fn().mockResolvedValue(BLOB_URL);
            const getWorker = createEditorWorkerFactory(resolveWorkerUrl);

            await Promise.all([getWorker("1", "editorWorkerService"), getWorker("2", "editorWorkerService")]);

            expect(resolveWorkerUrl).toHaveBeenCalledTimes(1);
            expect(workers.map((worker) => worker.url)).toEqual([BLOB_URL, BLOB_URL]);
        });

        it("retries the resolution after a failure", async () => {
            const resolveWorkerUrl = vi
                .fn()
                .mockRejectedValueOnce(new Error("chunk not loaded"))
                .mockResolvedValue(BLOB_URL);
            const getWorker = createEditorWorkerFactory(resolveWorkerUrl);

            await expect(getWorker("1", "editorWorkerService")).rejects.toThrow("chunk not loaded");
            await getWorker("2", "editorWorkerService");

            expect(workers.map((worker) => worker.url)).toEqual([BLOB_URL]);
        });

        describe("Trusted Types", () => {
            const trustedUrl = { trusted: BLOB_URL };

            afterEach(() => {
                globalThis.MonacoEnvironment = originalEnvironment;
            });

            it("starts the worker from the URL of the host policy", async () => {
                const createTrustedTypesPolicy = vi.fn(() => ({
                    name: EDITOR_WORKER_TRUSTED_TYPES_POLICY,
                    createScriptURL: () => trustedUrl,
                }));
                globalThis.MonacoEnvironment = { createTrustedTypesPolicy };
                const getWorker = createEditorWorkerFactory(vi.fn().mockResolvedValue(BLOB_URL));

                await getWorker("1", "editorWorkerService");
                await getWorker("2", "editorWorkerService");

                expect(createTrustedTypesPolicy).toHaveBeenCalledTimes(1);
                expect(createTrustedTypesPolicy).toHaveBeenCalledWith(EDITOR_WORKER_TRUSTED_TYPES_POLICY, {
                    createScriptURL: expect.any(Function),
                });
                expect(workers.map((worker) => worker.url)).toEqual([trustedUrl, trustedUrl]);
            });

            it("starts the worker from the URL of a browser policy without a host policy", async () => {
                globalThis.MonacoEnvironment = {};
                const createPolicy = vi.fn(() => ({ createScriptURL: () => trustedUrl }));
                vi.stubGlobal("trustedTypes", { createPolicy });
                const getWorker = createEditorWorkerFactory(vi.fn().mockResolvedValue(BLOB_URL));

                await getWorker("1", "editorWorkerService");

                expect(createPolicy).toHaveBeenCalledWith(EDITOR_WORKER_TRUSTED_TYPES_POLICY, {
                    createScriptURL: expect.any(Function),
                });
                expect(workers.map((worker) => worker.url)).toEqual([trustedUrl]);
            });

            it("starts the worker from the plain URL when the policy cannot be created", async () => {
                vi.spyOn(console, "error").mockImplementation(() => {});
                globalThis.MonacoEnvironment = {
                    createTrustedTypesPolicy: () => {
                        throw new TypeError("Policy with name gdMetricEditorWorker disallowed.");
                    },
                };
                const getWorker = createEditorWorkerFactory(vi.fn().mockResolvedValue(BLOB_URL));

                await getWorker("1", "editorWorkerService");

                expect(workers.map((worker) => worker.url)).toEqual([BLOB_URL]);
            });
        });
    });

    describe("setupMonacoWorkers", () => {
        let originalEnvironment: typeof globalThis.MonacoEnvironment;

        beforeEach(() => {
            originalEnvironment = globalThis.MonacoEnvironment;
        });

        afterEach(() => {
            globalThis.MonacoEnvironment = originalEnvironment;
        });

        it("installs getWorker and keeps the other environment settings", () => {
            globalThis.MonacoEnvironment = { globalAPI: true };

            setupMonacoWorkers();

            expect(globalThis.MonacoEnvironment.globalAPI).toBe(true);
            expect(globalThis.MonacoEnvironment.getWorker).toBeTypeOf("function");
            expect(globalThis.MonacoEnvironment.getWorkerUrl).toBeUndefined();
        });

        it.each([
            ["getWorker", { getWorker: () => ({}) as Worker }],
            ["getWorkerUrl", { getWorkerUrl: () => "https://example.com/worker.js" }],
        ])("keeps a host %s", (_name, hostEnvironment) => {
            globalThis.MonacoEnvironment = hostEnvironment;

            setupMonacoWorkers();

            expect(globalThis.MonacoEnvironment).toBe(hostEnvironment);
        });
    });
});
