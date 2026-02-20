// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { convertCertificationFromBackend } from "../CertificationConverter.js";

describe("convertCertificationFromBackend", () => {
    it("should parse certification enum value", () => {
        expect(convertCertificationFromBackend({ certification: "CERTIFIED" })).toEqual({
            status: "CERTIFIED",
        });
    });

    it("should enrich certification string with sibling metadata fields", () => {
        expect(
            convertCertificationFromBackend({
                certification: "CERTIFIED",
                certificationMessage: "Trusted object",
                certifiedAt: "2026-02-19T10:00:00.000Z",
            }),
        ).toEqual({
            status: "CERTIFIED",
            message: "Trusted object",
            certifiedAt: "2026-02-19T10:00:00.000Z",
        });
    });

    it("should ignore unsupported object certification payload", () => {
        expect(
            convertCertificationFromBackend({
                certification: {
                    status: "CERTIFIED",
                    message: "Trusted object",
                    certifiedAt: "2026-02-19T10:00:00.000Z",
                },
            }),
        ).toBeUndefined();
    });

    it("should return undefined for unsupported values", () => {
        expect(convertCertificationFromBackend({ certification: "NOT_CERTIFIED" })).toBeUndefined();
    });

    it("should return undefined for missing attributes", () => {
        expect(convertCertificationFromBackend()).toBeUndefined();
    });
});
