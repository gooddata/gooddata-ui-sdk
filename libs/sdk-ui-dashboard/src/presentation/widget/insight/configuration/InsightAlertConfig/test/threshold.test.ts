// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { convertThresholdValue } from "../utils/threshold";

const trend = `[<0][green]▲ #,##0.0%;
[=0][black]#,##0.0%;
[>0][red]▼ #,##0.0%`;

const currency = `[>=1000000000000]$#,,,,.0 T;
[>=1000000000]$#,,,.0 B;
[>=1000000]$#,,.0 M;
[>=1000]$#,.0 K;
[>=0]$#,##0;
[<=-1000000000000]-$#,,,,.0 T;
[<=-1000000000]-$#,,,.0 B;
[<=-1000000]-$#,,.0 M;
[<=-1000]-$#,.0 K;
[<0]-$#,##0`;

describe("threshold round", () => {
    it.each([
        ["", "#,##0.00", undefined],
        ["---", "#,##0.00", undefined],
        ["123.456", "#,##0", 123],
        ["123.456", "#,##0.00", 123.46],
        ["123.4", "#,##0.00", 123.4],
        ["123.4", "#,##0.00", 123.4],
        ["123", "#,##0.00", 123],
        ["123.123456", "#,##0.0", 123.1],
        ["123.199999", "#,##0.0", 123.2],
        ["123.199999", trend, 123.2],
        ["123.999999", trend, 124],
        ["123.8125", trend, 123.8],
        ["12.999", currency, 13],
        ["123.999", currency, 124],
        ["1234.999", currency, 1235],
        ["999999999999999999999", "#,##0.00", 1e21],
    ])("should round number %s with format %s to %d", (value: string, format: string, expected: number) => {
        const x = convertThresholdValue(value, format);
        expect(x).toBe(expected);
    });
});
