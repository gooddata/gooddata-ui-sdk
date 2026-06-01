// (C) 2026 GoodData Corporation

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { detectRepo, findUp } from "../repoDetection.js";

describe("findUp", () => {
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "scaff-findup-"));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    it("returns the directory containing the marker when present at cwd", () => {
        writeFileSync(join(root, "marker.txt"), "");
        expect(findUp(root, "marker.txt")).toBe(root);
    });

    it("walks upward and finds the marker in an ancestor", () => {
        writeFileSync(join(root, "marker.txt"), "");
        mkdirSync(join(root, "a", "b"), { recursive: true });
        expect(findUp(join(root, "a", "b"), "marker.txt")).toBe(root);
    });

    it("returns undefined when no ancestor has the marker", () => {
        // unlikely but possible: tmpdir's parents won't have our marker
        expect(findUp(root, "definitely-not-here-marker.json")).toBeUndefined();
    });
});

describe("detectRepo", () => {
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "scaff-detect-"));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    it("reports rush when rush.json is present", () => {
        writeFileSync(join(root, "rush.json"), "{}");
        const repo = detectRepo(root);
        expect(repo.packageManager).toBe("rush");
        expect(repo.repoRoot).toBe(root);
    });

    it("detects pnpm via pnpm-lock.yaml", () => {
        writeFileSync(join(root, "pnpm-lock.yaml"), "");
        const repo = detectRepo(root);
        expect(repo.packageManager).toBe("pnpm");
    });

    it("detects yarn via yarn.lock", () => {
        writeFileSync(join(root, "yarn.lock"), "");
        const repo = detectRepo(root);
        expect(repo.packageManager).toBe("yarn");
    });

    it("falls back to npm when no lockfile is present", () => {
        const repo = detectRepo(root);
        expect(repo.packageManager).toBe("npm");
    });

    it("prefers rush over other lockfiles", () => {
        writeFileSync(join(root, "rush.json"), "{}");
        writeFileSync(join(root, "pnpm-lock.yaml"), "");
        const repo = detectRepo(root);
        expect(repo.packageManager).toBe("rush");
    });
});
