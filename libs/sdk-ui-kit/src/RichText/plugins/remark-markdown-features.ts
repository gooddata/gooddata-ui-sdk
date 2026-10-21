// (C) 2026 GoodData Corporation

// remark-parse declares `micromarkExtensions` and `fromMarkdownExtensions` on the processor data.
import type {} from "remark-parse";
import { type Processor } from "unified";

import { highlight, strikethrough } from "./micromark-paired-marks.js";

// `blankLine` and `content` are missing because they carry no name, which is what `disable` matches
// on, and paragraphs need them anyway.
const NAMED_CONSTRUCTS = [
    "attention",
    "autolink",
    "blockQuote",
    "characterEscape",
    "characterReference",
    "codeFenced",
    "codeIndented",
    "codeText",
    "definition",
    "hardBreakEscape",
    "headingAtx",
    "htmlFlow",
    "htmlText",
    "labelEnd",
    "labelStartImage",
    "labelStartLink",
    "lineEnding",
    "list",
    "setextUnderline",
    "thematicBreak",
] as const;

type NamedConstruct = (typeof NAMED_CONSTRUCTS)[number];

/**
 * @internal
 */
export type RichTextFeature =
    | "emphasis"
    | "headings"
    | "lists"
    | "links"
    | "images"
    | "code"
    | "blockquotes"
    | "thematicBreaks"
    | "html"
    | "entities"
    | "backslashBreaks"
    | "strikethrough"
    | "highlight";

// Syntax CommonMark does not have, added on top of it only when asked for: `~~strike~~` and
// `==highlight==`.
type ExtensionFeature = Extract<RichTextFeature, "strikethrough" | "highlight">;

type CommonMarkFeature = Exclude<RichTextFeature, ExtensionFeature>;

// `links` and `images` cannot be split: a bracket opens both but `labelEnd` is what closes either,
// so they share it, and a label start without its end renders as the brackets that were typed.
// Switching constructs on one by one is what this mapping exists to prevent. The rest are grouped
// by taxonomy and could be split — the three `code` spellings are independent of each other, as are
// the two heading ones.
const FEATURE_CONSTRUCTS: Record<CommonMarkFeature, readonly NamedConstruct[]> = {
    emphasis: ["attention"],
    headings: ["headingAtx", "setextUnderline"],
    lists: ["list"],
    links: ["labelStartLink", "labelEnd", "definition", "autolink"],
    images: ["labelStartImage", "labelEnd"],
    code: ["codeText", "codeFenced", "codeIndented"],
    blockquotes: ["blockQuote"],
    thematicBreaks: ["thematicBreak"],
    html: ["htmlFlow", "htmlText"],
    entities: ["characterReference"],
    backslashBreaks: ["hardBreakEscape"],
};

/**
 * Every CommonMark feature, which is what omitting the list recognises too. The extensions are not
 * among them: they are recognised only where they are asked for by name.
 *
 * @internal
 */
// The mapping is keyed by the CommonMark part of the union, so its keys are exactly those features.
export const ALL_RICH_TEXT_FEATURES: readonly RichTextFeature[] = Object.keys(
    FEATURE_CONSTRUCTS,
) as RichTextFeature[];

// Not features, and never switched off: `lineEnding` is what makes text into paragraphs at all, and
// `characterEscape` is the only way to write a marker literally once code spans may be gone.
const ALWAYS_ON: readonly NamedConstruct[] = ["characterEscape", "lineEnding"];

function isCommonMarkFeature(feature: RichTextFeature): feature is CommonMarkFeature {
    return Object.prototype.hasOwnProperty.call(FEATURE_CONSTRUCTS, feature);
}

function disabledConstructs(features: readonly RichTextFeature[]): NamedConstruct[] {
    const enabled = new Set<NamedConstruct>([
        ...ALWAYS_ON,
        ...features.filter(isCommonMarkFeature).flatMap((feature) => FEATURE_CONSTRUCTS[feature]),
    ]);
    return NAMED_CONSTRUCTS.filter((construct) => !enabled.has(construct));
}

export function remarkMarkdownFeatures(features: readonly RichTextFeature[]) {
    return function (this: Processor): undefined {
        const data = this.data();
        const extensions = (data.micromarkExtensions ??= []);
        const fromMarkdown = (data.fromMarkdownExtensions ??= []);
        extensions.push({ disable: { null: disabledConstructs(features) } });
        // Double tildes only, so a lone `~` (an approximate figure, say) stays as typed.
        const marks = [
            ...(features.includes("strikethrough") ? [strikethrough()] : []),
            ...(features.includes("highlight") ? [highlight()] : []),
        ];
        for (const mark of marks) {
            extensions.push(mark.syntax);
            fromMarkdown.push(mark.fromMarkdown);
        }
    };
}
