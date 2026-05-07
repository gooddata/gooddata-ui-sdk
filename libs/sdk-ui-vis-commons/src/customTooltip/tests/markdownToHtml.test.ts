// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { markdownToHtml } from "../markdownToHtml.js";

describe("markdownToHtml", () => {
    it("should return empty string for empty input", () => {
        expect(markdownToHtml("")).toBe("");
        expect(markdownToHtml(undefined as any)).toBe("");
    });

    it("should render plain text as a paragraph", () => {
        expect(markdownToHtml("Hello world")).toBe("<p>Hello world</p>");
    });

    it("should render bold text", () => {
        expect(markdownToHtml("**bold**")).toBe("<p><strong>bold</strong></p>");
        expect(markdownToHtml("__bold__")).toBe("<p><strong>bold</strong></p>");
    });

    it("should render italic text", () => {
        expect(markdownToHtml("*italic*")).toBe("<p><em>italic</em></p>");
    });

    it("should render mixed inline formatting", () => {
        const result = markdownToHtml("**Profit:** *23.5%*");
        expect(result).toContain("<strong>Profit:</strong>");
        expect(result).toContain("<em>23.5%</em>");
    });

    it("should render headings", () => {
        expect(markdownToHtml("# Title")).toContain("<h1");
        expect(markdownToHtml("## Subtitle")).toContain("<h2");
        expect(markdownToHtml("### H3")).toContain("<h3");
    });

    it("should render unordered lists", () => {
        const result = markdownToHtml("- item 1\n- item 2");
        expect(result).toContain("<ul");
        expect(result).toContain("<li>item 1</li>");
        expect(result).toContain("<li>item 2</li>");
        expect(result).toContain("</ul>");
    });

    it("should render ordered lists", () => {
        const result = markdownToHtml("1. first\n2. second");
        expect(result).toContain("<ol");
        expect(result).toContain("<li>first</li>");
        expect(result).toContain("<li>second</li>");
        expect(result).toContain("</ol>");
    });

    it("should render horizontal rules", () => {
        expect(markdownToHtml("---")).toBe("<hr/>");
        expect(markdownToHtml("***")).toBe("<hr/>");
    });

    it("should render images", () => {
        const result = markdownToHtml("![logo](https://example.com/img.png)");
        expect(result).toContain("<img");
        expect(result).toContain('src="https://example.com/img.png"');
        expect(result).toContain('alt="logo"');
    });

    it("should render links as plain styled text", () => {
        const result = markdownToHtml("[click here](https://example.com)");
        expect(result).toContain("click here");
        expect(result).toContain("gd-viz-tooltip-custom-link");
        expect(result).not.toContain("<a ");
    });

    it("should escape HTML in content", () => {
        const result = markdownToHtml("<script>alert('xss')</script>");
        expect(result).not.toContain("<script>");
        expect(result).toContain("&lt;script&gt;");
    });

    it("should reject javascript: protocol in image URLs", () => {
        const result = markdownToHtml("![xss](javascript:alert(1))");
        expect(result).not.toContain("<img");
        expect(result).not.toContain("javascript:");
    });

    it("should allow https URLs in images", () => {
        const result = markdownToHtml("![ok](https://example.com/img.png)");
        expect(result).toContain("<img");
        expect(result).toContain("https://example.com/img.png");
    });

    it("should allow data:image URLs in images", () => {
        const result = markdownToHtml("![ok](data:image/png;base64,abc)");
        expect(result).toContain("<img");
    });

    it("should handle multi-line content with mixed elements", () => {
        const input = `# Revenue Summary
**Profit Margin:** 23.5%
Region: East

- Revenue: $1.2M
- Cost: $900K

---
*Updated daily*`;

        const result = markdownToHtml(input);
        expect(result).toContain("<h1");
        expect(result).toContain("<strong>Profit Margin:</strong>");
        expect(result).toContain("<ul");
        expect(result).toContain("<hr/>");
        expect(result).toContain("<em>Updated daily</em>");
    });

    it("should preserve {metric/id} references as plain text for later substitution", () => {
        const result = markdownToHtml("**Profit:** {metric/profit_margin}");
        expect(result).toContain("{metric/profit_margin}");
        expect(result).toContain("<strong>Profit:</strong>");
    });

    describe("italic asterisk boundaries", () => {
        it("should not treat asterisks separated by spaces as italic", () => {
            const result = markdownToHtml("Multiplier: 5 * 3 * 2");
            expect(result).not.toContain("<em>");
            expect(result).toContain("Multiplier: 5 * 3 * 2");
        });

        it("should still render legitimate single-word italic", () => {
            expect(markdownToHtml("*italic*")).toBe("<p><em>italic</em></p>");
        });

        it("should render multi-word italic as long as boundaries are non-space", () => {
            expect(markdownToHtml("*hello world*")).toBe("<p><em>hello world</em></p>");
        });

        it("should not treat underscores separated by spaces as italic", () => {
            const result = markdownToHtml("Range: 5 _ 3 _ 2");
            expect(result).not.toContain("<em>");
        });
    });

    describe("URL with balanced parentheses", () => {
        it("should match image URLs containing balanced parens", () => {
            const result = markdownToHtml(
                "![chart](https://en.wikipedia.org/wiki/Pie_chart_(disambiguation))",
            );
            expect(result).toContain('src="https://en.wikipedia.org/wiki/Pie_chart_(disambiguation)"');
            // Should NOT have a stray `)` left as literal text after the img
            expect(result).not.toMatch(/\/\s*"[^>]*\/>\s*\)/);
        });

        it("should match link URLs containing balanced parens", () => {
            const result = markdownToHtml("[wiki](https://en.wikipedia.org/wiki/Pie_chart_(disambiguation))");
            expect(result).toContain("wiki");
            expect(result).toContain("gd-viz-tooltip-custom-link");
        });
    });

    describe("backslash escapes", () => {
        it("renders \\* as a literal asterisk, not italic", () => {
            const result = markdownToHtml("\\*not italic\\*");
            expect(result).not.toContain("<em>");
            expect(result).toBe("<p>*not italic*</p>");
        });

        it("renders \\_ as a literal underscore", () => {
            const result = markdownToHtml("\\_not italic\\_");
            expect(result).not.toContain("<em>");
            expect(result).toBe("<p>_not italic_</p>");
        });

        it("renders \\[ and \\] so they cannot form a link", () => {
            const result = markdownToHtml("\\[fake\\](https://example.com)");
            expect(result).not.toContain("gd-viz-tooltip-custom-link");
            expect(result).toContain("[fake](https://example.com)");
        });

        it("renders \\! so it cannot start an image", () => {
            const result = markdownToHtml("\\![alt](https://example.com/x.png)");
            expect(result).not.toContain("<img");
            expect(result).toContain("!");
        });

        it("renders \\\\ as a single literal backslash", () => {
            expect(markdownToHtml("a\\\\b")).toBe("<p>a\\b</p>");
        });

        it("renders \\# at line start without producing a heading", () => {
            const result = markdownToHtml("\\# not a heading");
            expect(result).not.toMatch(/<h\d/);
            expect(result).toContain("# not a heading");
        });

        it("does not strip backslashes that are not escaping a metachar", () => {
            // `\n` is a literal `\` followed by `n` — not an escape sequence.
            expect(markdownToHtml("a\\nb")).toContain("a\\nb");
        });

        it("does not restore user-supplied sentinel-like text into HTML", () => {
            const cases = [
                "\u0001E3c;img src=x onerror=alert(1)\u0001E3e;",
                "\u0001E0:3c;img src=x onerror=alert(1)\u0001E0:3e;",
            ];

            for (const markdown of cases) {
                const result = markdownToHtml(markdown);

                expect(result).not.toContain("<img");
                expect(result).toContain(markdown);
            }
        });
    });

    describe("triple-asterisk bold-italic", () => {
        it("should render ***text*** as bold + italic", () => {
            expect(markdownToHtml("***foo***")).toBe("<p><strong><em>foo</em></strong></p>");
        });

        it("should not leave a trailing asterisk", () => {
            const result = markdownToHtml("***foo***");
            expect(result).not.toContain("</strong>*");
        });

        it("should render ***text*** alongside other bold and italic", () => {
            const result = markdownToHtml("***bold-italic*** **bold** *italic*");
            expect(result).toContain("<strong><em>bold-italic</em></strong>");
            expect(result).toContain("<strong>bold</strong>");
            expect(result).toContain("<em>italic</em>");
        });
    });
});
