#!/usr/bin/env node
// (C) 2026 GoodData Corporation

// oxlint-disable eslint-js/no-console -- CLI gate; console output is its interface

// THE ARCHITECTURE GATE for AD's state layer.
//
// Eight rules, each naming a shape this package's state layer does not allow:
//
//   [R1] a `(state: IAppState) => IAppState` function in domain/business code. Only the two
//        sanctioned infrastructure wrappers may be root->root, and a saga is not a hiding place
//        for a whole-root transformer.
//   [R2] the ROOT STATE TYPE imported by a module that must be value-level — `*_state.ts`,
//        `*_types.ts`, `*_helpers.ts`, `*_operations.ts`. A pure helper's signature is its
//        documentation; the moment it can name the root it stops being narrow, and naming the
//        root is what drags reducer modules into import cycles.
//   [R3] PATH-ADDRESSED ROOT ACCESS — a `getIn`/`setIn`/`updateIn`/`deleteIn` whose
//        receiver is the root state. Deep addressing inside a DOMAIN VALUE is legitimate and
//        lives in `utils/value_access.ts`; over the root it is dynamic addressing with no owner
//        and no types.
//   [R4] a PATH MODULE — `constants/state_paths.ts`, any `*_paths.ts`, or a re-invention of one
//        (an exported const array of root branch keys). This is what stops a mount table growing.
//   [R5] a CLUSTER / WORKING-SET / CHANGE-SET shape by name — `pathKey`, `changedDomains`,
//        write-surface arrays, `*Cluster*State`, `collectClusterChanges`, `diffDomainState`,
//        `extractWrites`. The CONCEPT is banned, so the check is deliberately name-based: these
//        are the names such a design reaches for, and a new one is cheap to add here.
//   [R6] REDUCER OWNERSHIP — a reducer/slice module importing another domain's selectors. A
//        reducer owns ONE slice, receives only that slice, and calls no selectors.
//   [R7] a HAND-WRITTEN ACTION CREATOR — a function returning an object literal with a `type`
//        property, or an interface declaring one. Every creator is
//        `createAction(FROZEN_STRING, prepare?)` and every action type is
//        `ReturnType<typeof creator>`. Two idioms for one thing is what makes a store's dispatch
//        permissive: a hand-written interface has no implicit index signature, so it is not
//        assignable to redux 5's `UnknownAction`, so `AppDispatch` has to widen to
//        `Dispatch<AnyAction>` — and then nothing about dispatch is type-checked.
//   [R8] `AnyAction` from redux — deprecated in redux 5 and, more to the point, the permissive
//        type whose `[key: string]: any` index signature makes the whole action stream `any`.
//        `UnknownAction` is the replacement; a module that genuinely needs to read `payload`
//        off an arbitrary action declares its OWN reader type and says why.
//
// The ALLOWLIST is the point, and it is short by design: exactly two sanctioned whole-root
// reducers (time travel and the app-reset wrapper), plus the root composition itself and the typed
// test fixtures. Everything else is a violation. A gate whose allowlist grows is a gate that has
// stopped meaning anything — extend the ARCHITECTURE, not this list.
//
// Usage:
//   node scripts/audit-state-architecture.mjs           # report
//   node scripts/audit-state-architecture.mjs --gate    # exit 1 on any finding (wired into validate)
//   node scripts/audit-state-architecture.mjs --json

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
    type Node,
    type SourceFile,
    type TypeNode,
    isArrowFunction,
    isCallExpression,
    isFunctionDeclaration,
    isFunctionExpression,
    isIdentifier,
    isImportDeclaration,
    isMethodDeclaration,
    isPropertyAssignment,
    isPropertySignatureDeclaration,
    isStringLiteral,
} from "typescript/unstable/ast";
import { API } from "typescript/unstable/sync";

const LIB_ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SRC_ROOT = join(LIB_ROOT, "src");
const TSCONFIG = join(LIB_ROOT, "tsconfig.json");

// ------------------------------------------------------------------------------------ allowlist

/** The root state type's own module, and the only modules allowed to be root→root. */
const ROOT_STATE_MODULE = "src/store/types.ts";

/**
 * TIER 1 — the SANCTIONED whole-root code: the two whole-root reducers, the root composition
 * itself, and the test-fixture patchers. A domain transformer does not become infrastructure by
 * being hard to move — if you are about to add a `*_service.ts` here, dissolve it instead.
 */
const ROOT_TRANSFORMER_ALLOWLIST = new Set([
    // a snapshot is by definition a projection of the whole root
    "src/store/_infra/time_travel.ts",
    // the app-reset wrapper, the combined root, and the pristine build
    "src/reducers/root_reducer.ts",
    "src/reducers/combined_root_reducer.ts",
    "src/reducers/initial_state.ts",
    // the one restore fixup that cannot be a case reducer (time travel calls it)
    "src/store/shortcuts/shortcut_dropped_item_reducer.ts",
    // TEST-ONLY typed fixture patching
    "src/tests/state_builder.test.helpers.ts",
    "src/tests/measure_date_datasets.test.helpers.ts",
    "src/tests/route.test.helpers.ts",
    "src/tests/constants.test.helpers.ts",
    // the test harness that drives one trigger through the real saga + real root reducer
    "src/tests/dispatch_buckets_trigger.test.utils.ts",
]);

/**
 * TIER 2 — the declared budget of remaining `IAppState → IAppState` transformers: the write halves
 * of the two service facades and the buckets removal chain.
 *
 * This is a one-way count, not an exemption. Adding a transformer fails the gate, and REMOVING one
 * fails it too, with a message telling you to lower the number — so the count cannot quietly
 * stagnate.
 */
const ROOT_TRANSFORMER_BUDGET = {
    "src/services/buckets_service.ts": 13,
    "src/store/filter_bar/filter_bar_service.ts": 14,
    "src/services/pluggable_visualization_service.ts": 3,
};

/** Modules that must stay value-level: they may not name the root state type. */
const VALUE_LEVEL_SUFFIXES = ["_state.ts", "_types.ts", "_helpers.ts", "_operations.ts"];

/**
 * Value-level modules that legitimately name the root — each an operation INPUT reader that the
 * saga hands the selected state to, kept here rather than loosening the rule.
 */
const VALUE_LEVEL_EXCEPTIONS = new Set([
    // reads the operation's inputs off the root, by property, for the saga to pass on
    "src/store/buckets/buckets_operation_inputs.ts",
    // the root shape's own module declares the undo projection of itself
    ROOT_STATE_MODULE,
    // matches the *_state.ts suffix but BUILDS the root — it is tier-1 infrastructure
    "src/reducers/initial_state.ts",
]);

const DEEP_ACCESS_FNS = new Set(["getIn", "setIn", "updateIn", "deleteIn"]);

/**
 * [R7] The modules that legitimately name an action-shaped `type` property.
 *
 * `postMessageApi/actions/post_message_action_helper.ts` declares `ICommandAction`, the shape of
 * the EXTERNAL postMessage protocol rather than a redux creator; the protocol is frozen and its
 * type is `PostEventActionTypeKeys` (the whole enum), which no `createAction` can express.
 */
const HANDWRITTEN_ACTION_ALLOWLIST = new Set(["src/postMessageApi/actions/post_message_action_helper.ts"]);

/**
 * [R7] `type:` in an ACTION position. Deliberately narrow: an action-type ENUM member (every frozen
 * string in this package lives in one — `ActionTypeKeys` or a per-domain `*ActionTypeKeys`), or a
 * raw string in AD's action-string convention (`UI/…`, `STORE/…`, `SAGA/…`, `COMMAND/…`).
 *
 * A bare uppercase string is deliberately NOT enough: `type: "BUCKET_ITEM"` is a react-dnd
 * drop-context discriminator (`typings/drag_and_drop.ts`, `components/buckets/Bucket.tsx`) and
 * `type: "ATTRIBUTE"` is a dropdown fixture — neither is a redux action.
 *
 * Matched against the VALUE of a `type` property in the AST, never against raw source: a comment or
 * a string that happens to read `type: STORE/FOO` is not a property assignment, so it cannot fail
 * the gate.
 */
const ACTION_TYPE_VALUE =
    /^(?:[A-Z][A-Za-z0-9_]*(?:TypeKeys|Keys)\.[A-Z0-9_]+|"(?:UI|STORE|SAGA|COMMAND)\/[A-Z0-9_/]+")$/;

/** The banned cluster/change-set vocabulary. Name-based on purpose — see [R5]. */
const BANNED_NAMES = [
    /\bpathKey\b/,
    /\bchangedDomains\b/,
    /\bcollectClusterChanges\b/,
    /\bdiffDomainState\b/,
    /\bextractWrites\b/,
    /\bWRITE_SURFACE\b/,
    /\b[A-Z]\w*Cluster(?:State|Context)\b/,
    /\binterface\s+I\w*ClusterState\b/,
];

const ROOT_STATE_TYPE_NAMES = new Set(["IAppState", "ICombinedRootState", "IUndoableState"]);

// --------------------------------------------------------------------------------------- helpers

function walk(dir: string, out: string[] = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            walk(full, out);
        } else if (/\.tsx?$/.test(entry)) {
            out.push(full);
        }
    }
    return out;
}

const rel = (file: string) => relative(LIB_ROOT, file).split("\\").join("/");
const isTest = (r: string) =>
    r.includes("/test/") || /\.test\.tsx?$/.test(r) || /(^|\/)test_helpers\.tsx?$/.test(r);

type Finding = { rule: string; file: string; line: number; note: string };

const findings: Finding[] = [];
/** [R1] tier-2 counts, checked against the declared budget after the scan. */
const rootTransformerCounts: Record<string, number> = {};
const report = (rule: string, file: string, line: number, note: string) =>
    findings.push({ rule, file, line, note });

const lineOf = (sourceFile: SourceFile, node: Node) =>
    sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;

/**
 * Does this type reference name the root state? Syntactic on purpose — cheap and unambiguous.
 * @param typeNode
 */
const namesRootState = (typeNode: TypeNode) =>
    !!typeNode && ROOT_STATE_TYPE_NAMES.has(typeNode.getText().replace(/\s/g, "").split("<")[0]);

// ----------------------------------------------------------------------------------------- scan

const files = walk(SRC_ROOT);

// [R4] path modules must not exist, anywhere
for (const file of files) {
    const r = rel(file);
    if (/(^|\/)state_paths\.ts$/.test(r) || r.endsWith("_paths.ts")) {
        report(
            "R4",
            r,
            1,
            "path module: the root is addressed by PROPERTY. Put the value in the owning " +
                "domain's state type and read it through that domain's selector.",
        );
    }
}

const api = new API({ cwd: LIB_ROOT });
const snapshot = api.updateSnapshot({ openProjects: [TSCONFIG] });

const project = snapshot.getProject(TSCONFIG);
if (!project) throw new Error(`no project for ${TSCONFIG}`);

for (const file of files) {
    const r = rel(file);
    const text = readFileSync(file, "utf8");

    const sourceFile = project.program.getSourceFile(file);
    if (!sourceFile) {
        throw new Error(`File ${file} is not included in the tsconfig`);
    }

    // [R5] rejected vocabulary
    for (const pattern of BANNED_NAMES) {
        const m = pattern.exec(text);
        if (m) {
            const line = text.slice(0, m.index).split("\n").length;
            report("R5", r, line, `banned shape \`${m[0]}\` — see [R5] at the top of this file.`);
        }
    }

    const imports: { spec: string; node: Node }[] = [];
    const visit = (node: Node): Node => {
        if (isImportDeclaration(node) && isStringLiteral(node.moduleSpecifier)) {
            imports.push({ spec: node.moduleSpecifier.text, node });
        }

        // [R1] root -> root functions outside the allowlist
        if (
            (isFunctionDeclaration(node) ||
                isMethodDeclaration(node) ||
                isArrowFunction(node) ||
                isFunctionExpression(node)) &&
            !ROOT_TRANSFORMER_ALLOWLIST.has(r) &&
            !isTest(r)
        ) {
            const takesRoot = node.parameters.some((p) => namesRootState(p.type));
            if (takesRoot && namesRootState(node.type)) {
                if (r in ROOT_TRANSFORMER_BUDGET) {
                    rootTransformerCounts[r] = (rootTransformerCounts[r] ?? 0) + 1;
                    return node.forEachChild(visit);
                }
                report(
                    "R1",
                    r,
                    lineOf(sourceFile, node),
                    "`(state: IAppState) => IAppState` in domain code. Select the individual " +
                        "domain values in a saga, call narrow typed helpers, and commit through " +
                        "ONE semantic event.",
                );
            }
        }

        // [R7] a `type` property whose value spells an action type — a hand-written action
        // creator's returned literal, or a hand-written action interface's discriminant.
        if (
            (isPropertyAssignment(node) || isPropertySignatureDeclaration(node)) &&
            !isTest(r) &&
            !HANDWRITTEN_ACTION_ALLOWLIST.has(r) &&
            isIdentifier(node.name) &&
            node.name.text === "type"
        ) {
            const valueNode = isPropertyAssignment(node) ? node.initializer : node.type;
            const value = valueNode?.getText(sourceFile).replace(/\s+/g, "") ?? "";
            // an interface may union several members (`A.X | A.Y`); each has to be an action type
            const parts = value.split("|").filter(Boolean);
            if (parts.length > 0 && parts.every((part) => ACTION_TYPE_VALUE.test(part))) {
                report(
                    "R7",
                    r,
                    lineOf(sourceFile, node),
                    "hand-written action shape — a `type:` property spelling an action type. Every " +
                        "creator is `createAction(FROZEN_STRING, prepare?)` and every action type is " +
                        "`ReturnType<typeof creator>`. Note `createAction<P>(TYPE)` is NOT the " +
                        "answer: supplying only the payload generic makes TS default the second one " +
                        "to `string`, which erases the literal `type` and silently breaks every " +
                        "discriminated-union switch. Use the prepare form.",
                );
            }
        }

        // [R8] the deprecated permissive action type. Matched as an IDENTIFIER in the AST, so a
        // comment or string that merely names it cannot fail the gate.
        if (isIdentifier(node) && node.text === "AnyAction") {
            report(
                "R8",
                r,
                lineOf(sourceFile, node),
                "`AnyAction` — deprecated in redux 5, and its `[key: string]: any` index " +
                    "signature leaves dispatch unchecked. Use `UnknownAction`, or declare your " +
                    "own reader type and say why.",
            );
        }

        // [R3] path-addressed ROOT access
        if (isCallExpression(node) && isIdentifier(node.expression)) {
            const fn = node.expression.text;
            if (DEEP_ACCESS_FNS.has(fn) && node.arguments.length >= 2) {
                const receiver = node.arguments[0].getText(sourceFile);
                // the root is `state`/`root`/`appState`, or anything whose text ends there
                if (/^(state|root|appState|rootState|liveState|snapshot)$/.test(receiver.trim())) {
                    report(
                        "R3",
                        r,
                        lineOf(sourceFile, node),
                        `\`${fn}\` over the ROOT state. Read/write the branch by property; deep ` +
                            "addressing INSIDE a domain value goes through utils/value_access.ts.",
                    );
                }
            }
        }

        node.forEachChild(visit);
        return undefined;
    };
    visit(sourceFile);

    const isValueLevel =
        VALUE_LEVEL_SUFFIXES.some((s) => r.endsWith(s)) && !VALUE_LEVEL_EXCEPTIONS.has(r) && !isTest(r);
    const isReducerModule = /_(reducer|slice|slices)\.ts$/.test(r);

    for (const { spec, node } of imports) {
        // [R2] a value-level module naming the root state
        if (isValueLevel && spec.endsWith("store/types.js")) {
            report(
                "R2",
                r,
                lineOf(sourceFile, node),
                "value-level module imports the ROOT state type. A pure helper takes typed domain " +
                    "values plus explicit arguments; its signature is the documentation.",
            );
        }

        // [R6] reducer ownership. A `./`-relative selector import is the reducer's OWN domain,
        // which the rule permits; anything further away is a foreign domain.
        const isForeignSelector = /_selectors?\.js$/.test(spec) && !spec.startsWith("./");
        if (isReducerModule && !isTest(r) && isForeignSelector) {
            report(
                "R6",
                r,
                lineOf(sourceFile, node),
                `reducer module imports \`${spec}\` — a reducer owns ONE slice, receives only ` +
                    "that slice and calls no selectors.",
            );
        }

        // [R4] path-addressed root access must not reappear behind a helper module
        if (spec.endsWith("utils/state_access.js")) {
            report(
                "R4",
                r,
                lineOf(sourceFile, node),
                "`utils/state_access.ts` does not exist. Value-level deep addressing lives in " +
                    "`utils/value_access.ts`; the root is addressed by property.",
            );
        }
    }
}

// -------------------------------------------------------------------------------------- budget

for (const [file, allowed] of Object.entries(ROOT_TRANSFORMER_BUDGET)) {
    const seen = rootTransformerCounts[file] ?? 0;
    if (seen > allowed) {
        report(
            "R1",
            file,
            1,
            `${seen} root->root transformers, ${allowed} declared in the budget. Dissolve the new ` +
                "one: select the domain values in a saga and call narrow typed helpers.",
        );
    } else if (seen < allowed) {
        report(
            "R1",
            file,
            1,
            `${seen} root->root transformers but the budget still declares ${allowed}. Lower the ` +
                "number in scripts/audit-state-architecture.mjs so the gate keeps holding the line " +
                "you just moved.",
        );
    }
}

// --------------------------------------------------------------------------------------- output

const gate = process.argv.includes("--gate");

if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ findings }, null, 2));
} else if (findings.length === 0) {
    console.log("state architecture audit: 0 findings (rules R1–R8)");
} else {
    const byRule: Map<string, Finding[]> = new Map();
    for (const f of findings) {
        if (!byRule.has(f.rule)) byRule.set(f.rule, []);
        byRule.get(f.rule).push(f);
    }
    // oxlint-disable-next-line typescript/require-array-sort-compare
    for (const [rule, list] of [...byRule].sort()) {
        console.log(`\n[${rule}] ${list.length} finding(s)`);
        for (const f of list) {
            console.log(`  ${f.file}:${f.line}`);
            console.log(`      ${f.note}`);
        }
    }
    console.log(
        `\n${findings.length} finding(s). The fix is in the architecture, not in this script's ` +
            "allowlist — see the rule notes at the top of this file.",
    );
}

if (gate && findings.length > 0) {
    process.exit(1);
}
