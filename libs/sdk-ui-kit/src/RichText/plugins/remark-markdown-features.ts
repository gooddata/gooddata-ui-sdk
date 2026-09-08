// (C) 2026 GoodData Corporation

// remark-parse declares `micromarkExtensions` on the processor data.
import type {} from "remark-parse";
import { type Processor } from "unified";

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
    | "backslashBreaks";

// `links` and `images` cannot be split: a bracket opens both but `labelEnd` is what closes either,
// so they share it, and a label start without its end renders as the brackets that were typed.
// Switching constructs on one by one is what this mapping exists to prevent. The rest are grouped
// by taxonomy and could be split — the three `code` spellings are independent of each other, as are
// the two heading ones.
const FEATURE_CONSTRUCTS: Record<RichTextFeature, readonly NamedConstruct[]> = {
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
 * @internal
 */
// The mapping is keyed by the union itself, so its keys are every feature and nothing else.
export const ALL_RICH_TEXT_FEATURES: readonly RichTextFeature[] = Object.keys(
    FEATURE_CONSTRUCTS,
) as RichTextFeature[];

// Not features, and never switched off: `lineEnding` is what makes text into paragraphs at all, and
// `characterEscape` is the only way to write a marker literally once code spans may be gone.
const ALWAYS_ON: readonly NamedConstruct[] = ["characterEscape", "lineEnding"];

function disabledConstructs(features: readonly RichTextFeature[]): NamedConstruct[] {
    const enabled = new Set<NamedConstruct>([
        ...ALWAYS_ON,
        ...features.flatMap((feature) => FEATURE_CONSTRUCTS[feature]),
    ]);
    return NAMED_CONSTRUCTS.filter((construct) => !enabled.has(construct));
}

export function remarkMarkdownFeatures(features: readonly RichTextFeature[]) {
    return function (this: Processor): undefined {
        const data = this.data();
        const extensions = (data.micromarkExtensions ??= []);
        extensions.push({ disable: { null: disabledConstructs(features) } });
    };
}
