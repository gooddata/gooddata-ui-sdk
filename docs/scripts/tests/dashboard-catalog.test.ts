// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ApiItem, ApiPackageJson, ExcerptToken } from "../lib/api-model.js";
import { buildDashboardCatalog, firstSentence } from "../lib/dashboard-catalog.js";

const DASH = "@gooddata/sdk-ui-dashboard";
const t = (text: string): ExcerptToken => ({ kind: "Content", text });
const r = (name: string, kind = "type"): ExcerptToken => ({
    kind: "Reference",
    text: name,
    canonicalReference: `${DASH}!${name}:${kind}`,
});

function item(name: string, kind: string, tokens: ExcerptToken[], over: Partial<ApiItem> = {}): ApiItem {
    // api-extractor writes `:type` for type aliases.
    const suffix = kind === "TypeAlias" ? "type" : kind.toLowerCase();
    return {
        kind,
        name,
        canonicalReference: `${DASH}!${name}:${suffix}`,
        excerptTokens: tokens,
        ...over,
    };
}

function model(): ApiPackageJson[] {
    const members = [
        item("DashboardEvents", "TypeAlias", [
            t("export type DashboardEvents = "),
            r("DashboardSaved"),
            t(" | "),
            r("IRenderModeChanged", "interface"),
            t(" | "),
            r("AlphaEvent"),
        ]),
        item("DashboardCommands", "TypeAlias", [
            t("export type DashboardCommands = "),
            r("ChangeDateFilter"),
        ]),
        item(
            "DashboardSaved",
            "TypeAlias",
            [
                t(
                    'export type DashboardSaved = IDashboardEvent & {\n    readonly type: "GDC.DASH/EVT.SAVED";\n}',
                ),
            ],
            {
                docComment:
                    "/**\n * Emitted when the dashboard is saved. More detail.\n *\n * @remarks\n * x\n * @public\n */",
            },
        ),
        item(
            "IRenderModeChanged",
            "Interface",
            [t("export interface IRenderModeChanged extends IDashboardEvent ")],
            {
                docComment: "/**\n * Render mode changed.\n * @beta\n */",
                members: [
                    {
                        kind: "PropertySignature",
                        name: "type",
                        canonicalReference: `${DASH}!IRenderModeChanged#type:member`,
                        excerptTokens: [t('readonly type: "GDC.DASH/EVT.RENDER_MODE.CHANGED";')],
                    },
                ],
            },
        ),
        item("AlphaEvent", "TypeAlias", [
            t('export type AlphaEvent = { readonly type: "GDC.DASH/EVT.ALPHA" }'),
        ]),
        item(
            "ChangeDateFilter",
            "TypeAlias",
            [
                t(
                    'export type ChangeDateFilter = IDashboardCommand & { readonly type: "GDC.DASH/CMD.DATE.CHANGE" }',
                ),
            ],
            {
                docComment: "/** Changes the date filter. */",
            },
        ),
        item(
            "isDashboardSaved",
            "Function",
            [t("isDashboardSaved: (obj: unknown) => "), t("obj is "), r("DashboardSaved")],
            {
                returnTypeTokenRange: { startIndex: 1, endIndex: 3 },
            } as Partial<ApiItem>,
        ),
        item(
            "changeDateFilter",
            "Function",
            [t("export declare function changeDateFilter(from: string): "), r("ChangeDateFilter")],
            {
                returnTypeTokenRange: { startIndex: 1, endIndex: 2 },
            } as Partial<ApiItem>,
        ),
        item(
            "applyDateFilter",
            "Function",
            [t("export declare function applyDateFilter(): "), r("ChangeDateFilter")],
            {
                returnTypeTokenRange: { startIndex: 1, endIndex: 2 },
            } as Partial<ApiItem>,
        ),
    ];
    return [
        {
            kind: "Package",
            name: DASH,
            members: [{ kind: "EntryPoint", name: "", canonicalReference: `${DASH}!`, members } as ApiItem],
        },
    ];
}

const pages = new Set([
    "sdk-ui-dashboard.dashboardsaved",
    "sdk-ui-dashboard.irendermodechanged",
    "sdk-ui-dashboard.changedatefilter",
    "sdk-ui-dashboard.isdashboardsaved",
    "sdk-ui-dashboard.applydatefilter",
]);

describe("buildDashboardCatalog", () => {
    it("lists the published members of DashboardEvents with type string, summary and guard", () => {
        const catalog = buildDashboardCatalog(model(), pages);
        assert.deepEqual(catalog.get("sdk-ui-dashboard.dashboardsaved"), {
            catalog: "event",
            event_type: "GDC.DASH/EVT.SAVED",
            summary: "Emitted when the dashboard is saved.",
            helpers: [{ title: "isDashboardSaved()", slug: "sdk-ui-dashboard.isdashboardsaved" }],
        });
    });

    it("reads the type string from an interface member", () => {
        const catalog = buildDashboardCatalog(model(), pages);
        assert.equal(
            catalog.get("sdk-ui-dashboard.irendermodechanged")?.event_type,
            "GDC.DASH/EVT.RENDER_MODE.CHANGED",
        );
    });

    it("skips union members without a reference page (alpha)", () => {
        const catalog = buildDashboardCatalog(model(), pages);
        assert.equal(catalog.has("sdk-ui-dashboard.alphaevent"), false);
    });

    it("lists a command's factory functions A–Z; one whose slug clashes with the command stays unlinked", () => {
        const catalog = buildDashboardCatalog(model(), pages);
        assert.deepEqual(catalog.get("sdk-ui-dashboard.changedatefilter"), {
            catalog: "command",
            event_type: "GDC.DASH/CMD.DATE.CHANGE",
            summary: "Changes the date filter.",
            helpers: [
                { title: "applyDateFilter()", slug: "sdk-ui-dashboard.applydatefilter" },
                // `changeDateFilter` and `ChangeDateFilter` share one page slug; the page is the command's.
                { title: "changeDateFilter()" },
            ],
        });
    });

    it("borrows a command's summary from its first factory when the type has none", () => {
        const docs = model();
        const items = docs[0].members[0].members!;
        items.find((i) => i.name === "ChangeDateFilter")!.docComment = "/**\n * @public\n */";
        items.find((i) => i.name === "applyDateFilter")!.docComment = "/** Applies a date filter. */";
        assert.equal(
            buildDashboardCatalog(docs, pages).get("sdk-ui-dashboard.changedatefilter")?.summary,
            "Applies a date filter.",
        );
    });

    it("cuts a summary to its first sentence", () => {
        assert.equal(firstSentence("Fails. The failure may be: - a user error"), "Fails.");
        assert.equal(firstSentence("No period here"), "No period here");
        assert.equal(firstSentence("Version 1.2 ships. Next"), "Version 1.2 ships.");
    });

    it("returns nothing when the dashboard package is not in the model", () => {
        assert.equal(buildDashboardCatalog([], pages).size, 0);
    });
});
