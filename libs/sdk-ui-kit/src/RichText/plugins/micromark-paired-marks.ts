// (C) 2026 GoodData Corporation

import { type Data, type Delete, type Parent, type PhrasingContent } from "mdast";
// remark-parse registers the parser's extension types on unified's processor data.
import type {} from "remark-parse";
import { type Data as ProcessorData } from "unified";

// The parser's own types, read off what remark-parse registers, so that this file needs none of the
// parser's internal packages.
type MicromarkExtension = NonNullable<ProcessorData["micromarkExtensions"]>[number];
type Construct = Exclude<NonNullable<NonNullable<MicromarkExtension["text"]>[string]>, unknown[]>;
type Tokenizer = Construct["tokenize"];
type Resolver = NonNullable<Construct["resolveAll"]>;
type TokenizeContext = ThisParameterType<Tokenizer>;
type Effects = Parameters<Tokenizer>[0];
type State = Parameters<Tokenizer>[1];
type Code = Parameters<State>[0];
type Event = Parameters<Resolver>[0][number];
type Token = Event[1];
type TokenType = Token["type"];
type FromMarkdownExtension = Exclude<NonNullable<ProcessorData["fromMarkdownExtensions"]>[number], unknown[]>;
type Handle = NonNullable<NonNullable<FromMarkdownExtension["enter"]>[string]>;
type CompileContext = ThisParameterType<Handle>;

interface IHighlightData extends Data {
    hName?: string;
}

/**
 * Highlighted phrasing, written `==text==`.
 */
interface IHighlight extends Parent {
    type: "highlight";
    children: PhrasingContent[];
    data?: IHighlightData;
}

declare module "mdast" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface PhrasingContentMap {
        highlight: IHighlight;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface RootContentMap {
        highlight: IHighlight;
    }
}

const TILDE = 126;
const EQUALS_SIGN = 61;
const SPACE = 32;

// What a character is to the pairing rules: whitespace, punctuation, or anything else.
const WHITESPACE = 1;
const PUNCTUATION = 2;

// One splice spreads its items as call arguments, which the engine caps, so a long list goes in parts.
const SPLICE_CHUNK = 10000;

// The parser lists its token names in an interface that extensions add to. This package does not depend
// on the package declaring it, so the names a mark adds are cast here, in one place.
function tokenType(name: string): TokenType {
    return name as TokenType;
}

function replaceRange<T>(list: T[], range: { start: number; count: number }, items: T[]): void {
    if (items.length < SPLICE_CHUNK) {
        list.splice(range.start, range.count, ...items);
        return;
    }
    list.splice(range.start, range.count);
    for (let offset = 0; offset < items.length; offset += SPLICE_CHUNK) {
        list.splice(range.start + offset, 0, ...items.slice(offset, offset + SPLICE_CHUNK));
    }
}

function appendAll<T>(list: T[], items: T[]): void {
    replaceRange(list, { start: list.length, count: 0 }, items);
}

// Line endings and tabs arrive as negative codes and the end of the text as null; all count as space.
function classifyCharacter(code: Code): typeof WHITESPACE | typeof PUNCTUATION | undefined {
    if (code === null || code < 0 || code === SPACE || /\s/u.test(String.fromCharCode(code))) {
        return WHITESPACE;
    }
    return /[\p{P}\p{S}]/u.test(String.fromCharCode(code)) ? PUNCTUATION : undefined;
}

function resolveAll(
    constructs: Array<Pick<Construct, "resolveAll">>,
    events: Event[],
    context: TokenizeContext,
): Event[] {
    const called: Resolver[] = [];
    let resolved = events;
    for (const { resolveAll: resolve } of constructs) {
        if (resolve !== undefined && !called.includes(resolve)) {
            resolved = resolve(resolved, context);
            called.push(resolve);
        }
    }
    return resolved;
}

/**
 * Reads a mark written as a character doubled on both sides, `~~text~~` or `==text==`, the way GFM
 * reads strikethrough: the doubled characters pair up like emphasis markers, so a mark nests with
 * strong, emphasis and links, and an escaped, longer or unpaired run stays as typed.
 */
function pairedMarkSyntax(marker: number, name: string): MicromarkExtension {
    const whole = tokenType(name);
    const text = tokenType(`${name}Text`);
    const sequence = tokenType(`${name}Sequence`);
    const temporary = tokenType(`${name}SequenceTemporary`);

    // Pairs each closing run with the nearest opening one before it; what is left unpaired becomes
    // plain text again.
    const resolveAllMark: Resolver = (events, context) => {
        let index = -1;
        while (++index < events.length) {
            const [kind, close] = events[index];
            if (kind !== "enter" || close.type !== temporary || !close._close) {
                continue;
            }
            let open = index;
            while (open--) {
                const [openKind, opener] = events[open];
                if (openKind !== "exit" || opener.type !== temporary || !opener._open) {
                    continue;
                }
                close.type = sequence;
                opener.type = sequence;
                const wholeToken: Token = { type: whole, start: { ...opener.start }, end: { ...close.end } };
                const textToken: Token = { type: text, start: { ...opener.end }, end: { ...close.start } };
                const next: Event[] = [
                    ["enter", wholeToken, context],
                    ["enter", opener, context],
                    ["exit", opener, context],
                    ["enter", textToken, context],
                ];
                const insideSpan = context.parser.constructs.insideSpan.null;
                if (insideSpan) {
                    appendAll(next, resolveAll(insideSpan, events.slice(open + 1, index), context));
                }
                appendAll(next, [
                    ["exit", textToken, context],
                    ["enter", close, context],
                    ["exit", close, context],
                    ["exit", wholeToken, context],
                ]);
                replaceRange(events, { start: open - 1, count: index - open + 3 }, next);
                index = open + next.length - 2;
                break;
            }
        }
        for (const [, token] of events) {
            if (token.type === temporary) {
                token.type = tokenType("data");
            }
        }
        return events;
    };

    const tokenizeMark = function (this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
        const previous = this.previous;
        const lastEvent = this.events.at(-1);
        let size = 0;

        const more = (code: Code): State | undefined => {
            const before = classifyCharacter(previous);
            if (code === marker) {
                // Exactly two characters; a longer run stays as typed.
                if (size > 1) {
                    return nok(code);
                }
                effects.consume(code);
                size++;
                return more;
            }
            if (size < 2) {
                return nok(code);
            }
            const token = effects.exit(temporary);
            const after = classifyCharacter(code);
            token._open = !after || (after === PUNCTUATION && Boolean(before));
            token._close = !before || (before === PUNCTUATION && Boolean(after));
            return ok(code);
        };

        return (code: Code): State | undefined => {
            // A character right after an unescaped one of the same kind belongs to a longer run.
            if (previous === marker && lastEvent?.[1].type !== tokenType("characterEscape")) {
                return nok(code);
            }
            effects.enter(temporary);
            return more(code);
        };
    };

    const construct: Construct = { name, tokenize: tokenizeMark, resolveAll: resolveAllMark };
    return { text: { [marker]: construct }, insideSpan: { null: [construct] } };
}

function pairedMarkFromMarkdown(name: string, createNode: () => Delete | IHighlight): FromMarkdownExtension {
    return {
        canContainEols: [createNode().type],
        enter: {
            [name]: function (this: CompileContext, token: Token) {
                this.enter(createNode(), token);
            },
        },
        exit: {
            [name]: function (this: CompileContext, token: Token) {
                this.exit(token);
            },
        },
    };
}

/**
 * Reads `~~text~~` into a `delete` node, which renders as `<del>`.
 */
export function strikethrough(): { syntax: MicromarkExtension; fromMarkdown: FromMarkdownExtension } {
    return {
        syntax: {
            ...pairedMarkSyntax(TILDE, "strikethrough"),
            // Lets `*` and `_` open or close against `~~`, as in GFM, so `x**~~y~~**z` is bold. Highlight
            // does not get this for `=`: `a*=b* c` would turn emphatic.
            attentionMarkers: { null: [TILDE] },
        },
        fromMarkdown: pairedMarkFromMarkdown("strikethrough", () => ({ type: "delete", children: [] })),
    };
}

/**
 * Reads `==text==` into a `highlight` node, which renders as `<mark>`.
 */
export function highlight(): { syntax: MicromarkExtension; fromMarkdown: FromMarkdownExtension } {
    return {
        syntax: pairedMarkSyntax(EQUALS_SIGN, "highlight"),
        fromMarkdown: pairedMarkFromMarkdown("highlight", () => ({
            type: "highlight",
            children: [],
            data: { hName: "mark" },
        })),
    };
}
