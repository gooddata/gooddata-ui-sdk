// (C) 2026 GoodData Corporation

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { copyTemplate } from "../copyTemplate.js";

describe("copyTemplate", () => {
    let src: string;
    let dest: string;

    beforeEach(() => {
        src = mkdtempSync(join(tmpdir(), "scaff-copy-src-"));
        dest = mkdtempSync(join(tmpdir(), "scaff-copy-dest-"));
    });

    afterEach(() => {
        rmSync(src, { recursive: true, force: true });
        rmSync(dest, { recursive: true, force: true });
    });

    it("copies files + applies token substitutions in deterministic order", () => {
        writeFileSync(join(src, "a.txt"), "name=PLACEHOLDER value=PLACEHOLDER2");
        const { written } = copyTemplate(src, dest, [
            ["PLACEHOLDER2", "second"],
            ["PLACEHOLDER", "first"],
        ]);
        expect(written).toHaveLength(1);
        expect(readFileSync(join(dest, "a.txt"), "utf-8")).toBe("name=first value=second");
    });

    it("recurses into subdirectories", () => {
        mkdirSync(join(src, "sub"));
        writeFileSync(join(src, "sub", "nested.txt"), "hi TOKEN");
        copyTemplate(src, dest, [["TOKEN", "world"]]);
        expect(readFileSync(join(dest, "sub", "nested.txt"), "utf-8")).toBe("hi world");
    });

    it("skips directories named in SKIP_DIRS (e.g. node_modules)", () => {
        mkdirSync(join(src, "node_modules"));
        writeFileSync(join(src, "node_modules", "junk.txt"), "should not be copied");
        writeFileSync(join(src, "real.txt"), "real");
        copyTemplate(src, dest, []);
        // node_modules subdir should not be created in dest
        expect(() => readFileSync(join(dest, "node_modules", "junk.txt"))).toThrow();
        expect(readFileSync(join(dest, "real.txt"), "utf-8")).toBe("real");
    });

    it("substitutes only in text files — binaries copied bytewise", () => {
        // .png is in BINARY_EXTENSIONS; the bytes shouldn't be touched even if they happen
        // to contain a token-looking string.
        const binaryContent = Buffer.from("PNGHEADER\x00TOKENISH\xff");
        writeFileSync(join(src, "image.png"), binaryContent);
        copyTemplate(src, dest, [["TOKENISH", "REPLACED"]]);
        const copied = readFileSync(join(dest, "image.png"));
        expect(copied.equals(binaryContent)).toBe(true);
    });

    it("copies TLS cert fixtures (.crt/.key) verbatim — never token-substituted", () => {
        // Self-signed e2e certs are cryptographic artifacts. Even though PEM is ASCII, a
        // token match inside the body must not rewrite the cert, so they go through the
        // verbatim (BINARY_EXTENSIONS) path.
        const pem = "-----BEGIN CERTIFICATE-----\nTOKENISH-base64-payload\n-----END CERTIFICATE-----\n";
        writeFileSync(join(src, "server.crt"), pem);
        writeFileSync(join(src, "server.key"), pem);
        copyTemplate(src, dest, [["TOKENISH", "REPLACED"]]);
        expect(readFileSync(join(dest, "server.crt"), "utf-8")).toBe(pem);
        expect(readFileSync(join(dest, "server.key"), "utf-8")).toBe(pem);
    });

    it("token substitution ORDER matters — longer-first prevents partial overlap", () => {
        writeFileSync(join(src, "a.txt"), "foo-bar foo");
        const { written: _w } = copyTemplate(src, dest, [
            ["foo-bar", "LONG"],
            ["foo", "SHORT"],
        ]);
        expect(readFileSync(join(dest, "a.txt"), "utf-8")).toBe("LONG SHORT");
    });
});
