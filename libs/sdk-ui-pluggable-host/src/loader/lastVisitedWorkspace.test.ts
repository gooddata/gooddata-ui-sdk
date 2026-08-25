// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { withFailingStorage } from "./failingStorage.js";
import {
    clearLastVisitedWorkspace,
    getLastVisitedWorkspace,
    setLastVisitedWorkspace,
} from "./lastVisitedWorkspace.js";

const STORAGE_KEY = "gdc-host-lastVisitedWorkspace";
const OWNER = { organizationId: "org-1", userId: "user-a@example.com" };
const OTHER_USER = { organizationId: "org-1", userId: "user-b@example.com" };
const OTHER_ORG = { organizationId: "org-2", userId: "user-a@example.com" };
const NO_ORG = { organizationId: undefined, userId: "user-a@example.com" };
const KEY = "org-1|user-a@example.com";
const OTHER_USER_KEY = "org-1|user-b@example.com";

describe("lastVisitedWorkspace", () => {
    afterEach(() => {
        localStorage.removeItem(STORAGE_KEY);
    });

    describe("getLastVisitedWorkspace", () => {
        it("returns undefined when nothing is stored", () => {
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it("returns the workspace stored for the given user", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ [KEY]: "ws-123" }));
            expect(getLastVisitedWorkspace(OWNER)).toBe("ws-123");
        });

        it("does not return another user's workspace", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ [OTHER_USER_KEY]: "ws-123" }));
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it("returns undefined when the stored value is empty", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ [KEY]: "" }));
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it("returns undefined when stored JSON is corrupt", () => {
            localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it("returns undefined when the stored JSON is not a record", () => {
            // e.g. the plain string this key held before it became per-user
            localStorage.setItem(STORAGE_KEY, JSON.stringify(["ws-123"]));
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it("returns undefined when the entry is not a string", () => {
            // Shared, hand-editable storage: a non-string must not reach backend.workspace()
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ [KEY]: { id: "ws-123" } }));
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it.each(["constructor", "toString", "__proto__"])(
            "returns undefined for the inherited key %s",
            (userId) => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
                expect(getLastVisitedWorkspace({ organizationId: "org-1", userId })).toBeUndefined();
            },
        );

        it("returns undefined when localStorage.getItem throws", () => {
            let result: string | undefined = "not-read";

            const failedCalls = withFailingStorage("getItem", () => {
                result = getLastVisitedWorkspace(OWNER);
            });

            expect(result).toBeUndefined();
            // Proves the failure path ran rather than the test passing for lack of a stored value
            expect(failedCalls).toBe(1);
        });
    });

    describe("setLastVisitedWorkspace", () => {
        it("stores the workspace for the given user", () => {
            setLastVisitedWorkspace(OWNER, "ws-123");
            expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ [KEY]: "ws-123" });
        });

        it("keeps other users' workspaces", () => {
            setLastVisitedWorkspace(OTHER_USER, "ws-other");
            setLastVisitedWorkspace(OWNER, "ws-123");

            expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
                [OTHER_USER_KEY]: "ws-other",
                [KEY]: "ws-123",
            });
        });

        it("overwrites a previously stored workspace for the same user", () => {
            setLastVisitedWorkspace(OWNER, "ws-123");
            setLastVisitedWorkspace(OWNER, "ws-456");
            expect(getLastVisitedWorkspace(OWNER)).toBe("ws-456");
        });

        it("overwrites corrupt JSON with a fresh record", () => {
            localStorage.setItem(STORAGE_KEY, "corrupt");
            setLastVisitedWorkspace(OWNER, "ws-123");
            expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ [KEY]: "ws-123" });
        });

        it("drops entries whose value is not a usable workspace id", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ [OTHER_USER_KEY]: 42 }));

            setLastVisitedWorkspace(OWNER, "ws-123");

            expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ [KEY]: "ws-123" });
        });

        it.each(["__proto__", "constructor", "toString"])(
            "stores and reads back an own entry for the user id %s",
            (userId) => {
                // On a plain object these assignments hit prototype members instead of creating
                // own keys, and JSON.stringify would drop the entry
                const owner = { organizationId: undefined, userId };

                setLastVisitedWorkspace(owner, "ws-123");

                expect(getLastVisitedWorkspace(owner)).toBe("ws-123");
                expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[`-|${userId}`]).toBe("ws-123");
            },
        );

        it("keeps the same login apart across organizations", () => {
            // One origin pointed at two backends (a dev server switched between environments):
            // the same login exists in both, but its workspaces do not
            setLastVisitedWorkspace(OWNER, "ws-in-org-1");
            setLastVisitedWorkspace(OTHER_ORG, "ws-in-org-2");

            expect(getLastVisitedWorkspace(OWNER)).toBe("ws-in-org-1");
            expect(getLastVisitedWorkspace(OTHER_ORG)).toBe("ws-in-org-2");
        });

        it("keeps an owner with no known organization apart from one with an organization", () => {
            setLastVisitedWorkspace(OWNER, "ws-in-org-1");
            setLastVisitedWorkspace(NO_ORG, "ws-no-org");

            expect(getLastVisitedWorkspace(OWNER)).toBe("ws-in-org-1");
            expect(getLastVisitedWorkspace(NO_ORG)).toBe("ws-no-org");
        });

        it("silently ignores errors when localStorage.setItem throws", () => {
            const failedCalls = withFailingStorage("setItem", () => {
                expect(() => setLastVisitedWorkspace(OWNER, "ws-123")).not.toThrow();
            });

            expect(failedCalls).toBe(1);
        });
    });

    describe("clearLastVisitedWorkspace", () => {
        it("removes the stored workspace when it is still the expected one", () => {
            setLastVisitedWorkspace(OWNER, "ws-123");
            clearLastVisitedWorkspace(OWNER, "ws-123");
            expect(getLastVisitedWorkspace(OWNER)).toBeUndefined();
        });

        it("keeps a workspace stored meanwhile by a newer navigation", () => {
            setLastVisitedWorkspace(OWNER, "ws-newer");

            // "ws-older" is what the caller decided to forget, before the await it waited on
            clearLastVisitedWorkspace(OWNER, "ws-older");

            expect(getLastVisitedWorkspace(OWNER)).toBe("ws-newer");
        });

        it("does not touch another user's workspace", () => {
            setLastVisitedWorkspace(OTHER_USER, "ws-123");

            clearLastVisitedWorkspace(OWNER, "ws-123");

            expect(getLastVisitedWorkspace(OTHER_USER)).toBe("ws-123");
        });

        it("does not touch the same login's workspace in another organization", () => {
            setLastVisitedWorkspace(OTHER_ORG, "ws-123");

            clearLastVisitedWorkspace(OWNER, "ws-123");

            expect(getLastVisitedWorkspace(OTHER_ORG)).toBe("ws-123");
        });

        it("silently ignores errors when localStorage.setItem throws", () => {
            const failedCalls = withFailingStorage(
                "setItem",
                () => {
                    expect(() => clearLastVisitedWorkspace(OWNER, "ws-123")).not.toThrow();
                },
                // Seeded so the compare matches and the write is actually attempted
                { [STORAGE_KEY]: JSON.stringify({ [KEY]: "ws-123" }) },
            );

            expect(failedCalls).toBe(1);
        });

        it("does not write at all when the stored workspace is not the expected one", () => {
            const failedCalls = withFailingStorage(
                "setItem",
                () => {
                    expect(() => clearLastVisitedWorkspace(OWNER, "ws-older")).not.toThrow();
                },
                { [STORAGE_KEY]: JSON.stringify({ [KEY]: "ws-newer" }) },
            );

            // The compare short-circuits, so nothing is written
            expect(failedCalls).toBe(0);
        });

        it("silently ignores errors when the stored value cannot be read", () => {
            const failedCalls = withFailingStorage("getItem", () => {
                expect(() => clearLastVisitedWorkspace(OWNER, "ws-123")).not.toThrow();
            });

            expect(failedCalls).toBe(1);
        });
    });
});
