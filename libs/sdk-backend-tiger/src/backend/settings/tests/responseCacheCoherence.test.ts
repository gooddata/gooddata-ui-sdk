// (C) 2026 GoodData Corporation

import axios, { type AxiosAdapter } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUserProfile, newAxios } from "@gooddata/api-client-tiger";
import * as actions from "@gooddata/api-client-tiger/endpoints/actions";
import * as entities from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import * as profile from "@gooddata/api-client-tiger/endpoints/profile";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { OrganizationSettingsService } from "../../organization/settings.js";
import { TigerUserSettingsService } from "../../user/settings.js";
import { TigerWorkspaceSettings } from "../../workspace/settings/index.js";
import { invalidateSettingsResponses, trackSettingsResponse } from "../responseCacheCoherence.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_WorkspaceResolveAllSettings: vi.fn(),
    ActionsApi_ResolveAllSettingsWithoutWorkspace: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityWorkspaceSettings: vi.fn(),
    EntitiesApi_DeleteEntityWorkspaceSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesWorkspaceSettings: vi.fn(),
    EntitiesApi_GetEntityWorkspaces: vi.fn(),
    EntitiesApi_UpdateEntityWorkspaceSettings: vi.fn(),
    EntitiesApi_CreateEntityOrganizationSettings: vi.fn(),
    EntitiesApi_DeleteEntityOrganizationSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesOrganizationSettings: vi.fn(),
    EntitiesApi_UpdateEntityOrganizationSettings: vi.fn(),
    EntitiesApi_CreateEntityUserSettings: vi.fn(),
    EntitiesApi_DeleteEntityUserSettings: vi.fn(),
    EntitiesApi_GetAllEntitiesUserSettings: vi.fn(),
    EntitiesApi_UpdateEntityUserSettings: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/profile", () => ({
    ProfileApi_GetCurrent: vi.fn(),
}));

const WORKSPACE = "ws-1";

/**
 * A real cache-enabled axios instance backed by a fake adapter that simulates the Tiger backend:
 * the settings-resolution GET is served with `max-age` (so the interceptor caches it, like the
 * real backend's `max-age=10, private` does in the browser), everything else is `no-store`.
 *
 * Node caveat baked in on purpose: the interceptor treats `private` as don't-cache outside the
 * browser, so the fake resolution response must NOT include `private` for the cache to engage.
 */
function createBackendStub() {
    let delimiter = "|";
    let resolveHits = 0;
    let resolveGate: Promise<void> | undefined;
    let settingsRecordCount = 1;

    const adapter: AxiosAdapter = async (config) => {
        if (config.method === "get" && config.url?.startsWith("/resolveSettings")) {
            resolveHits += 1;
            // capture before the gate: a gated response carries the value from dispatch time,
            // simulating a server that computed the resolution before a concurrent write landed
            const value = delimiter;
            if (resolveGate) {
                await resolveGate;
            }
            return {
                data: [
                    {
                        type: "EXPORT_CSV_CUSTOM_DELIMITER",
                        id: "exportCsvCustomDelimiter",
                        content: { value },
                    },
                ],
                status: 200,
                statusText: "OK",
                headers: { "cache-control": "max-age=60" },
                config,
            };
        }
        if (config.method === "get") {
            // entity listing used by setSetting/deleteSettingByType to find the existing records
            return {
                data: {
                    data: Array.from({ length: settingsRecordCount }, (_, i) => ({
                        id: `setting-${i + 1}`,
                        attributes: { type: "EXPORT_CSV_CUSTOM_DELIMITER" },
                    })),
                },
                status: 200,
                statusText: "OK",
                headers: { "cache-control": "no-store" },
                config,
            };
        }
        return {
            data: {},
            status: 200,
            statusText: "OK",
            headers: { "cache-control": "no-store" },
            config,
        };
    };

    const instance = newAxios();
    instance.defaults.adapter = adapter;

    return {
        instance,
        resolveHits: () => resolveHits,
        setDelimiter: (value: string) => {
            delimiter = value;
        },
        setResolveGate: (gate: Promise<void>) => {
            resolveGate = gate;
        },
        setSettingsRecordCount: (count: number) => {
            settingsRecordCount = count;
        },
    };
}

type BackendStub = ReturnType<typeof createBackendStub>;

function authCallFor(stub: BackendStub): TigerAuthenticatedCallGuard {
    const mockAuthCall = vi.fn((callback) => callback({ axios: stub.instance, basePath: "" }));
    return mockAuthCall as TigerAuthenticatedCallGuard;
}

function delimiterFromWritePayload(content: object | null | undefined): string | undefined {
    return content && "value" in content && typeof content.value === "string" ? content.value : undefined;
}

function wireEndpointMocks(stub: BackendStub) {
    vi.mocked(actions.ActionsApi_WorkspaceResolveAllSettings).mockImplementation(
        (axiosInstance, _basePath, params, options) =>
            axiosInstance.get("/resolveSettings/workspace", { ...options, params }),
    );
    vi.mocked(actions.ActionsApi_ResolveAllSettingsWithoutWorkspace).mockImplementation(
        (axiosInstance, _basePath, params, options) =>
            axiosInstance.get("/resolveSettings/organization", { ...options, params }),
    );
    vi.mocked(entities.EntitiesApi_GetAllEntitiesWorkspaceSettings).mockImplementation(
        (axiosInstance, _basePath, params) => axiosInstance.get("/entities/workspaceSettings", { params }),
    );
    vi.mocked(entities.EntitiesApi_GetAllEntitiesOrganizationSettings).mockImplementation(
        (axiosInstance, _basePath, params) => axiosInstance.get("/entities/organizationSettings", { params }),
    );
    vi.mocked(entities.EntitiesApi_GetAllEntitiesUserSettings).mockImplementation(
        (axiosInstance, _basePath, params) => axiosInstance.get("/entities/userSettings", { params }),
    );
    vi.mocked(entities.EntitiesApi_UpdateEntityWorkspaceSettings).mockImplementation(
        (axiosInstance, _basePath, params) => {
            const value = delimiterFromWritePayload(
                params.jsonApiWorkspaceSettingInDocument.data.attributes?.content,
            );
            if (value) {
                stub.setDelimiter(value);
            }
            return axiosInstance.put("/entities/workspaceSettings/setting-1", {});
        },
    );
    vi.mocked(entities.EntitiesApi_UpdateEntityOrganizationSettings).mockImplementation(
        (axiosInstance, _basePath, params) => {
            const value = delimiterFromWritePayload(
                params.jsonApiOrganizationSettingInDocument.data.attributes?.content,
            );
            if (value) {
                stub.setDelimiter(value);
            }
            return axiosInstance.put("/entities/organizationSettings/setting-1", {});
        },
    );
    vi.mocked(entities.EntitiesApi_UpdateEntityUserSettings).mockImplementation(
        (axiosInstance, _basePath, _params) => axiosInstance.put("/entities/userSettings/setting-1", {}),
    );
    vi.mocked(profile.ProfileApi_GetCurrent).mockResolvedValue(userProfile());
}

function userProfile(): IUserProfile {
    return {
        name: "Test User",
        userId: "user-1",
        organizationName: "org",
        organizationId: "org-1",
        links: { user: "", organization: "" },
        entitlements: [],
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("settings response cache coherence", () => {
    describe("generation-scoped reads + invalidation", () => {
        const readSettings = (stub: BackendStub, scope = "test") =>
            trackSettingsResponse(stub.instance, scope, (requestOptions) =>
                stub.instance.get("/resolveSettings/workspace", requestOptions),
            );

        it("repeat reads within one generation are served from the cache", async () => {
            const stub = createBackendStub();

            await readSettings(stub);
            await readSettings(stub);

            expect(stub.resolveHits()).toBe(1);
        });

        it("invalidation makes the next read fetch fresh data", async () => {
            const stub = createBackendStub();

            await readSettings(stub);
            expect(stub.resolveHits()).toBe(1);

            await invalidateSettingsResponses(authCallFor(stub));

            await readSettings(stub);
            expect(stub.resolveHits()).toBe(2);
        });

        it("leaves unrelated cached responses warm", async () => {
            const stub = createBackendStub();

            // one tracked read, so the invalidation below has something real to evict
            await readSettings(stub);
            await stub.instance.get("/resolveSettings/untracked");
            expect(stub.resolveHits()).toBe(2);

            await invalidateSettingsResponses(authCallFor(stub));

            await stub.instance.get("/resolveSettings/untracked");
            expect(stub.resolveHits()).toBe(2); // untracked read still served from cache
            await readSettings(stub);
            expect(stub.resolveHits()).toBe(3); // while the tracked one was evicted
        });

        it("different settings variants never share a cache entry", async () => {
            const stub = createBackendStub();

            // same URL on purpose: the scope, not the request shape, must drive the key
            await readSettings(stub, "ws:ws-1:excludeUser");
            await readSettings(stub, "ws:ws-1:withUser");

            expect(stub.resolveHits()).toBe(2);
        });

        it("isolates generations and tracking per axios instance", async () => {
            const stubA = createBackendStub();
            const stubB = createBackendStub();

            await readSettings(stubA);
            await readSettings(stubB);

            await invalidateSettingsResponses(authCallFor(stubA));

            await readSettings(stubB);
            expect(stubB.resolveHits()).toBe(1); // B untouched by A's invalidation
            await readSettings(stubA);
            expect(stubA.resolveHits()).toBe(2); // A really invalidated
        });

        it("is a no-op when nothing was tracked", async () => {
            const stub = createBackendStub();
            await expect(invalidateSettingsResponses(authCallFor(stub))).resolves.toBeUndefined();
        });

        it("is safe on a plain (non-cache) axios instance", async () => {
            const plain = axios.create();
            plain.defaults.adapter = async (config) => ({
                data: [],
                status: 200,
                statusText: "OK",
                headers: {},
                config,
            });
            const authCall = vi.fn((callback) => callback({ axios: plain, basePath: "" }));

            await trackSettingsResponse(plain, "test", (requestOptions) =>
                plain.get("/resolveSettings/plain", requestOptions),
            );

            await expect(
                invalidateSettingsResponses(authCall as TigerAuthenticatedCallGuard),
            ).resolves.toBeUndefined();
        });
    });

    describe("workspace settings service", () => {
        it("serves fresh settings immediately after a write", async () => {
            const stub = createBackendStub();
            wireEndpointMocks(stub);
            const service = new TigerWorkspaceSettings(authCallFor(stub), WORKSPACE);

            const first = await service.getSettings();
            expect(first.exportCsvCustomDelimiter).toBe("|");
            expect(stub.resolveHits()).toBe(1);

            // a repeat read inside the freshness window is served from the axios cache
            const second = await service.getSettings();
            expect(second.exportCsvCustomDelimiter).toBe("|");
            expect(stub.resolveHits()).toBe(1);

            await service.setExportCsvCustomDelimiter(";");

            // without eviction this read would be served the stale cached "|" for up to max-age
            const third = await service.getSettings();
            expect(stub.resolveHits()).toBe(2);
            expect(third.exportCsvCustomDelimiter).toBe(";");
        });

        it("invalidates even when a batch deletion fails partway", async () => {
            const stub = createBackendStub();
            wireEndpointMocks(stub);
            stub.setSettingsRecordCount(2);
            const service = new TigerWorkspaceSettings(authCallFor(stub), WORKSPACE);

            await service.getSettings();
            expect(stub.resolveHits()).toBe(1);

            // first deletion persists, second fails — the persisted change must still invalidate
            vi.mocked(entities.EntitiesApi_DeleteEntityWorkspaceSettings)
                .mockImplementationOnce((axiosInstance) =>
                    axiosInstance.delete("/entities/workspaceSettings/setting-1"),
                )
                .mockImplementationOnce(() => Promise.reject(new Error("delete failed")));

            await expect(service.deleteExportCsvCustomDelimiter()).rejects.toThrow("delete failed");

            const after = await service.getSettings();
            expect(stub.resolveHits()).toBe(2);
            expect(after.exportCsvCustomDelimiter).toBe("|");
        });
    });

    describe("organization settings service", () => {
        it("serves fresh settings immediately after a write", async () => {
            const stub = createBackendStub();
            wireEndpointMocks(stub);
            const service = new OrganizationSettingsService(authCallFor(stub));

            const first = await service.getSettings();
            expect(first.exportCsvCustomDelimiter).toBe("|");
            expect(stub.resolveHits()).toBe(1);

            await service.setExportCsvCustomDelimiter(";");

            const second = await service.getSettings();
            expect(stub.resolveHits()).toBe(2);
            expect(second.exportCsvCustomDelimiter).toBe(";");
        });
    });

    describe("user settings service", () => {
        it("evicts other services' cached settings resolutions on a user-level write", async () => {
            const stub = createBackendStub();
            wireEndpointMocks(stub);
            const workspaceService = new TigerWorkspaceSettings(authCallFor(stub), WORKSPACE);
            const userService = new TigerUserSettingsService(authCallFor(stub));

            await workspaceService.getSettings();
            expect(stub.resolveHits()).toBe(1);

            // user-level write; user settings resolve with the workspace/org ones, so the
            // coarse policy must drop every tracked settings resolution on the instance
            await userService.setLocale("cs-CZ");

            await workspaceService.getSettings();
            expect(stub.resolveHits()).toBe(2);
        });
    });

    describe("late pre-write responses (read racing a write)", () => {
        // The invalidation-at-write happens before the read's response lands, so the registry is
        // empty at that point; the generation embedded in the cache id is what keeps the late
        // response unreachable. Without it, the pre-write body would be served for up to max-age.
        it("does not serve a settings response that was in flight when a write completed", async () => {
            const stub = createBackendStub();
            let releaseRead: () => void = () => {};
            stub.setResolveGate(
                new Promise<void>((resolve) => {
                    releaseRead = resolve;
                }),
            );

            const pendingRead = trackSettingsResponse(stub.instance, "test", (requestOptions) =>
                stub.instance.get("/resolveSettings/workspace", requestOptions),
            );

            // a write completes while the read is in flight — nothing is tracked yet
            await invalidateSettingsResponses(authCallFor(stub));

            releaseRead();
            await pendingRead;

            // the late (pre-write) response must not be served to the next read
            await trackSettingsResponse(stub.instance, "test", (requestOptions) =>
                stub.instance.get("/resolveSettings/workspace", requestOptions),
            );
            expect(stub.resolveHits()).toBe(2);
        });

        it("a post-write read does not deduplicate onto a pre-write in-flight request", async () => {
            const stub = createBackendStub();
            wireEndpointMocks(stub);
            const service = new TigerWorkspaceSettings(authCallFor(stub), WORKSPACE);
            let releaseRead: () => void = () => {};
            stub.setResolveGate(
                new Promise<void>((resolve) => {
                    releaseRead = resolve;
                }),
            );

            const preWriteRead = service.getSettings(); // resolution GET in flight, gated
            await service.setExportCsvCustomDelimiter(";"); // write fully resolves

            // dispatched AFTER the write resolved but while the pre-write GET is still pending;
            // it must fire its own request under the new generation, not join the old one
            const postWriteRead = service.getSettings();
            releaseRead();

            const [, postWrite] = await Promise.all([preWriteRead, postWriteRead]);
            expect(postWrite.exportCsvCustomDelimiter).toBe(";");
            expect(stub.resolveHits()).toBe(2);
        });

        it("end to end: a write during the initial read does not poison later reads", async () => {
            const stub = createBackendStub();
            wireEndpointMocks(stub);
            const service = new TigerWorkspaceSettings(authCallFor(stub), WORKSPACE);
            let releaseRead: () => void = () => {};
            stub.setResolveGate(
                new Promise<void>((resolve) => {
                    releaseRead = resolve;
                }),
            );

            const pendingRead = service.getSettings(); // resolution GET in flight, gated
            await service.setExportCsvCustomDelimiter(";"); // write lands during the read
            releaseRead();

            // the raced read itself may carry the pre-write value — server-side ordering that
            // no client cache can fix — but it must not stick in the cache
            await pendingRead;

            const after = await service.getSettings();
            expect(after.exportCsvCustomDelimiter).toBe(";");
            expect(stub.resolveHits()).toBe(2);
        });
    });
});
