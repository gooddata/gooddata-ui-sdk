// (C) 2019-2020 GoodData Corporation

import { createNumberJsFormatter } from "../dataAccessConfig.js";
import { describe, expect, it } from "vitest";

const typicalFormat = "$#,#.##";

const fancyFormat =
    "[>=9000000][color=2190c0]██████████;\n" +
    "[>=8000000][color=2190c0]█████████░;\n" +
    "[>=7000000][color=2190c0]████████░░;\n" +
    "[>=6000000][color=2190c0]███████░░░;\n" +
    "[>=5000000][color=2190c0]██████░░░░;\n" +
    "[>=4000000][color=2190c0]█████░░░░░;\n" +
    "[>=3000000][color=2190c0]████░░░░░░;\n" +
    "[>=2000000][color=2190c0]███░░░░░░░;\n" +
    "[>=1000000][color=2190c0]██░░░░░░░░;";

const formatWithColoring = "[<0][red]$#,#.##;\n" + "[<100000][blue]$#,#.##;\n" + "[>=100000][green]$#,#.##";

const formatWithXss = `<img src="#" onerror=alert('Owned')/>`;

describe("default data point formatter", () => {
    it("should return formatted number", () => {
        const formatter = createNumberJsFormatter();

        expect(formatter("123456", typicalFormat)).toEqual("$123,456");
    });

    it("should return just the formatted number, without color codes", () => {
        const formatter = createNumberJsFormatter();

        expect(formatter("123", formatWithColoring)).toEqual("$123");
    });

    it("should return fancy formatted number, without color codes", () => {
        const formatter = createNumberJsFormatter();

        expect(formatter("1000000", fancyFormat)).toEqual("██░░░░░░░░");
    });

    it("should escape to prevent xss", () => {
        const formatter = createNumberJsFormatter();

        expect(formatter("123", formatWithXss)).toEqual(
            "&lt;img src=&quot;123&quot; onerror=alert(&#39;Owned&#39;)/&gt;",
        );
    });
});
