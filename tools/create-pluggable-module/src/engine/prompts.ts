// (C) 2026 GoodData Corporation

import { type Interface as ReadlineInterface, createInterface } from "readline";

import type { ApplicationScope, IPromptDescriptor, IScaffoldAnswers } from "../types.js";

/**
 * Thin wrapper over readline's `line` events. The reason we can't use
 * `rl.question(prompt, cb)` is that `cb` is only attached when question() runs;
 * if input arrives faster than question() can re-attach (which happens whenever
 * stdin is a pipe rather than a TTY), `line` events fire with no listeners and
 * the data is lost. We buffer them ourselves so piped input works correctly —
 * essential for non-interactive smoke tests and CI.
 */
class LineReader {
    private readonly rl: ReadlineInterface;
    private readonly buffer: string[] = [];
    private pending: ((line: string | undefined) => void) | undefined;
    private closed = false;

    constructor() {
        this.rl = createInterface({ input: process.stdin, output: process.stdout });
        this.rl.on("line", (line) => {
            if (this.pending) {
                const fn = this.pending;
                this.pending = undefined;
                fn(line);
            } else {
                this.buffer.push(line);
            }
        });
        this.rl.on("close", () => {
            this.closed = true;
            if (this.pending) {
                const fn = this.pending;
                this.pending = undefined;
                fn(undefined);
            }
        });
    }

    /** Resolves with the next line, or undefined if stdin closed without one. */
    next(): Promise<string | undefined> {
        if (this.pending) {
            // Footgun-guard: two pending reads on the same LineReader would
            // have the second silently overwrite the first's resolver. Callers
            // must await each next() before starting the next one.
            throw new Error("LineReader.next() called while previous next() is still pending");
        }
        if (this.buffer.length > 0) {
            return Promise.resolve(this.buffer.shift());
        }
        if (this.closed) {
            return Promise.resolve(undefined);
        }
        return new Promise((resolve) => {
            this.pending = resolve;
        });
    }

    close(): void {
        this.rl.close();
    }
}

const APP_NAME_RE = /^gdc-[a-z][a-z0-9-]*$/;

/**
 * Shared text-value sanity check. Blocks characters that would either break
 * shell/script substitution (`"`, `\``, `$`, `\`), break template token
 * substitution (`{`, `}`), or break line-based file formats (`\n`, `\r`).
 *
 * Exported so profiles can reuse it on their own extra prompts and keep the
 * accepted character set consistent across the scaffolder.
 */
export function validateTextValue(value: string): string | null {
    if (/["\\\n\r`${}]/.test(value)) {
        return "Must not contain double quotes, backslashes, backticks, dollar signs, curly braces, or newlines.";
    }
    return null;
}

// Name format only — destination-collision checking happens later in the engine,
// AFTER the profile has resolved the dest root (the client profile lets the user
// override the destPath, so checking modules/<name> here would miss real collisions
// and false-positive on overrides). See runProfile.ts.
function validateAppName(name: string): string | null {
    if (!APP_NAME_RE.test(name)) {
        return `App name must start with "gdc-" and contain only lowercase letters, digits, and hyphens.`;
    }
    if (name.startsWith("gdc-app-template")) {
        return `Names starting with "gdc-app-template" are reserved for the template itself. Choose a different name.`;
    }
    return null;
}

async function ask(reader: LineReader, question: string): Promise<string> {
    process.stdout.write(question);
    const line = await reader.next();
    if (line === undefined) {
        throw new Error("stdin closed before a value was provided — non-interactive input ran out.");
    }
    return line;
}

async function askUntilValid(
    reader: LineReader,
    label: string,
    validate: (value: string) => string | null,
): Promise<string> {
    while (true) {
        const value = (await ask(reader, `  ${label}: `)).trim();
        const err = validate(value);
        if (!err) return value;
        console.log(`  Error: ${err}`);
    }
}

async function askScope(reader: LineReader): Promise<ApplicationScope> {
    while (true) {
        const choice = (await ask(reader, "  Application scope (1 = workspace, 2 = organization): ")).trim();
        if (choice === "1") return "workspace";
        if (choice === "2") return "organization";
        console.log('  Error: Enter "1" or "2".');
    }
}

/**
 * Drives the full prompt sequence: shared appName/title/scope, then the
 * profile's extraPrompts in order. Returns once every answer is collected.
 */
export async function runPrompts(extraPrompts: readonly IPromptDescriptor[]): Promise<IScaffoldAnswers> {
    const reader = new LineReader();
    try {
        console.log("\n  Scaffold a new pluggable application\n");

        const appName = await askUntilValid(reader, "App name (must start with gdc-)", validateAppName);

        const title = await askUntilValid(reader, "en-US title", (v) => {
            if (!v) return "Title is required.";
            return validateTextValue(v);
        });

        const scope = await askScope(reader);

        const maintainer = await askUntilValid(
            reader,
            "Maintainer (preferably email, but could be a person or team name)",
            (v) => {
                if (!v) return "Maintainer is required.";
                return validateTextValue(v);
            },
        );

        const answers: IScaffoldAnswers = { appName, title, scope, maintainer };

        for (const prompt of extraPrompts) {
            const value = await askExtra(reader, prompt);
            if (value !== undefined) {
                answers[prompt.key] = value;
            }
        }

        return answers;
    } finally {
        reader.close();
    }
}

async function askExtra(reader: LineReader, prompt: IPromptDescriptor): Promise<string | undefined> {
    while (true) {
        const suffix = prompt.optional ? " (optional, press Enter to skip)" : "";
        const value = (await ask(reader, `  ${prompt.label}${suffix}: `)).trim();
        if (!value) {
            if (prompt.optional) return undefined;
            console.log("  Error: A value is required.");
            continue;
        }
        const err = prompt.validate ? prompt.validate(value) : null;
        if (!err) return value;
        console.log(`  Error: ${err}`);
    }
}
