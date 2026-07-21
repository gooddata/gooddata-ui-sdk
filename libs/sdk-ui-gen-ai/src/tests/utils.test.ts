// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    convertGenAiTypeToReferenceType,
    convertReferenceTypeToGenAiType,
    generateTitleFromQuestion,
} from "../utils.js";

describe("generateTitleFromQuestion", () => {
    it("should return trimmed original text when text length is up to 50 characters", () => {
        expect(generateTitleFromQuestion("   short question   ")).toBe("short question");
    });

    it("should normalize whitespace and remove invisible characters", () => {
        expect(generateTitleFromQuestion("  first\n\t\u200Bsecond   third  ")).toBe("first second third");
    });

    it("should truncate to 50 characters and append ellipsis when text is longer", () => {
        const input = `${"a".repeat(50)}extra`;

        expect(generateTitleFromQuestion(input)).toBe(`${"a".repeat(50)}...`);
    });

    it("should extend truncation to the end of reference when cutoff falls inside a reference", () => {
        const prefix = "x".repeat(48);
        const input = `${prefix}{metric/revenue} trailing text`;

        expect(generateTitleFromQuestion(input)).toBe(`${prefix}{metric/revenue}...`);
    });

    it("should extend truncation to nearest closing brace when unmatched reference-like token is cut", () => {
        const prefix = "x".repeat(48);
        const input = `${prefix}{metric/} trailing text`;

        expect(generateTitleFromQuestion(input)).toBe(`${prefix}{metric/}...`);
    });

    it("should sanitize text before truncation and still append ellipsis when truncated", () => {
        const input = `  ${"a".repeat(30)}\n\t${"b".repeat(30)}  `;

        expect(generateTitleFromQuestion(input)).toBe(`${"a".repeat(30)} ${"b".repeat(19)}...`);
    });
});

describe("convertReferenceTypeToGenAiType", () => {
    it("should convert METRIC to metric", () => {
        expect(convertReferenceTypeToGenAiType("METRIC")).toBe("metric");
    });

    it("should convert WIDGET to widget", () => {
        expect(convertReferenceTypeToGenAiType("WIDGET")).toBe("widget");
    });

    it("should convert ATTRIBUTE to attribute", () => {
        expect(convertReferenceTypeToGenAiType("ATTRIBUTE")).toBe("attribute");
    });

    it("should convert DASHBOARD to dashboard", () => {
        expect(convertReferenceTypeToGenAiType("DASHBOARD")).toBe("dashboard");
    });

    it("should return dashboard for unknown types", () => {
        expect(convertReferenceTypeToGenAiType("UNKNOWN" as any)).toBe("dashboard");
    });
});

describe("convertGenAiTypeToReferenceType", () => {
    it("should convert metric to METRIC", () => {
        expect(convertGenAiTypeToReferenceType("metric")).toBe("METRIC");
    });

    it("should convert widget to WIDGET", () => {
        expect(convertGenAiTypeToReferenceType("widget")).toBe("WIDGET");
    });

    it("should convert attribute to ATTRIBUTE", () => {
        expect(convertGenAiTypeToReferenceType("attribute")).toBe("ATTRIBUTE");
    });

    it("should convert dashboard to DASHBOARD", () => {
        expect(convertGenAiTypeToReferenceType("dashboard")).toBe("DASHBOARD");
    });

    it("should return DASHBOARD for unknown types", () => {
        expect(convertGenAiTypeToReferenceType("unknown" as any)).toBe("DASHBOARD");
    });
});
