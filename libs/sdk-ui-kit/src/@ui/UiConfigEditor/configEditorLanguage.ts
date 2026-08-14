// (C) 2026 GoodData Corporation

import { isScalar, parseDocument, stringify, visit } from "yaml";

/**
 * A language the config editor can display and emit. Every editor instance has a primary language —
 * the one its value is written in — and may offer the other as an on-the-fly projection of it.
 *
 * @internal
 */
export type ConfigEditorLanguage = "json" | "yaml";

/**
 * Indentation of the JSON the editor emits.
 *
 * Deliberately 4, matching the `JSON.stringify(content, null, 4)` that the consuming dialogs use to
 * seed their definition field. A dialog that compares the current text against that seed to decide
 * whether the form is dirty would otherwise report a pristine form as changed the moment the value
 * round-trips through YAML.
 */
const JSON_INDENT = 4;

/**
 * `lineWidth: 0` disables YAML's default line folding, which would otherwise wrap long strings
 * (URLs, base64 images, font declarations) across lines and make them painful to edit.
 */
const YAML_FORMAT_OPTIONS = { indent: 2, lineWidth: 0 };

/**
 * `aliasDuplicateObjects: false` prevents anchors/aliases (`&ref` / `*ref`) for objects that appear
 * twice — valid YAML, but surprising in a config file and lost on the way back to JSON.
 */
const YAML_STRINGIFY_OPTIONS = { ...YAML_FORMAT_OPTIONS, aliasDuplicateObjects: false };

const isBlank = (text: string) => text.trim() === "";

/**
 * Rejects values a projection would silently corrupt.
 *
 * YAML can express more than JSON: `.nan` / `.inf` load as non-finite numbers that `JSON.stringify`
 * writes as `null`, and a tag like `!!binary` loads as a `Uint8Array` that it writes as an
 * index-keyed object. And both parsers round an integer beyond `Number.MAX_SAFE_INTEGER` to the
 * nearest double, so serializing it back writes a *different* number. Either way the value saved
 * would differ from the text on screen with no indication, so such text is refused here and
 * surfaces as a parse failure the caller already reports.
 */
function assertProjectable(value: unknown): void {
    if (value === null || typeof value === "boolean" || typeof value === "string") {
        return;
    }
    if (typeof value === "number") {
        // Negative zero passes both integer checks, but `JSON.stringify` writes it as plain 0.
        if (
            !Number.isFinite(value) ||
            (Number.isInteger(value) && !Number.isSafeInteger(value)) ||
            Object.is(value, -0)
        ) {
            throw new Error("The value contains a number that cannot be projected faithfully");
        }
        return;
    }
    if (Array.isArray(value)) {
        value.forEach(assertProjectable);
        return;
    }
    // Anything beyond a plain object came from a YAML tag (binary, timestamp, …) and has no faithful
    // JSON form.
    if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
        Object.values(value).forEach(assertProjectable);
        return;
    }
    throw new Error("The value cannot be projected into JSON faithfully");
}

/**
 * Parses a YAML draft into the plain value it denotes, refusing anything JSON cannot express.
 *
 * Warnings are treated as failures too: the one the parser produces is an unresolvable tag, which it
 * would otherwise quietly read as its bare scalar — text saying `!myTag foo` but a value saying
 * `"foo"`.
 *
 * Returns `undefined` for a document with no content (blank or comments only), which has no value
 * form at all.
 */
function parseYaml(draft: string): unknown {
    const document = parseDocument(draft);
    const problem = document.errors[0] ?? document.warnings[0];
    if (problem !== undefined) {
        throw problem;
    }
    if (document.contents === null) {
        return undefined;
    }
    // Mapping keys are checked on the document, before `toJS()` erases the distinction: a typed key
    // like `1:` or `true:` comes out as the object property "1" / "true", so the JSON emitted would
    // quietly say a string where the text on screen says a number or boolean.
    visit(document, {
        Pair(_, pair) {
            if (!isScalar(pair.key) || typeof pair.key.value !== "string") {
                throw new Error("YAML contains a mapping key JSON cannot represent");
            }
        },
    });
    const parsed: unknown = document.toJS();
    assertProjectable(parsed);
    return parsed;
}

function parseText(text: string, language: ConfigEditorLanguage): unknown {
    if (language === "yaml") {
        return parseYaml(text);
    }
    // JSON.parse rounds too — an integer past MAX_SAFE_INTEGER comes back as a different number —
    // so the same fidelity guard applies before this value may drive a projection.
    const parsed: unknown = JSON.parse(text);
    assertProjectable(parsed);
    return parsed;
}

function stringifyValue(value: unknown, language: ConfigEditorLanguage): string {
    return language === "json"
        ? JSON.stringify(value, null, JSON_INDENT)
        : stringify(value, YAML_STRINGIFY_OPTIONS);
}

/**
 * Whether `text` is a value in `language` that can be projected into another language and back.
 *
 * Text the user is midway through breaking is not: re-reading it in another language could give it a
 * different meaning (`foo` is broken JSON but a valid YAML string), so switching language must leave
 * it alone rather than quietly turning it into something that parses. Neither is a comment-only YAML
 * document, whose projection would be empty — losing the comments.
 *
 * @internal
 */
export function isProjectable(text: string, language: ConfigEditorLanguage): boolean {
    if (isBlank(text)) {
        return false;
    }
    try {
        return parseText(text, language) !== undefined;
    } catch {
        return false;
    }
}

/**
 * Converts text from one of the editor's languages into another.
 *
 * Unconvertible text is passed through verbatim rather than swallowed — unparseable text, and a
 * comment-only YAML document, whose projection would be empty. In the display direction that keeps
 * a language switch from silently discarding what is on screen; in the primary direction it hands
 * the caller the raw text, whose own validation is what reports the problem while the user is
 * mid-edit.
 *
 * @internal
 */
export function convertText(
    text: string,
    fromLanguage: ConfigEditorLanguage,
    toLanguage: ConfigEditorLanguage,
): string {
    if (fromLanguage === toLanguage || isBlank(text)) {
        return text;
    }
    try {
        const parsed = parseText(text, fromLanguage);
        // A YAML document with no content beyond comments denotes no value, which has no text form.
        return parsed === undefined ? text : stringifyValue(parsed, toLanguage);
    } catch {
        return text;
    }
}

/**
 * Re-formats the displayed text in its own language.
 *
 * YAML is re-formatted structurally — indentation and spacing are normalized while comments, blank
 * lines and scalar styles are kept — so a hand-annotated document is tidied, never stripped.
 *
 * Returns `undefined` when there is nothing to format — blank or unparseable input — so the caller
 * can disable the action instead of offering a no-op.
 *
 * @internal
 */
export function beautify(draft: string, language: ConfigEditorLanguage): string | undefined {
    if (isBlank(draft)) {
        return undefined;
    }
    if (language === "json") {
        try {
            // The guarded parse, so re-formatting can never rewrite a number the parser rounded.
            return JSON.stringify(parseText(draft, "json"), null, JSON_INDENT);
        } catch {
            return undefined;
        }
    }
    const document = parseDocument(draft);
    // Warnings do not block formatting: an unresolved tag is kept verbatim by the serializer, so
    // re-formatting around it is safe — unlike projecting to another language, which would drop it.
    return document.errors.length > 0 ? undefined : document.toString(YAML_FORMAT_OPTIONS);
}
