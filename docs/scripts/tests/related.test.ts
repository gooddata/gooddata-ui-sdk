// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ApiItem, ApiPackageJson, ExcerptToken } from "../lib/api-model.js";
import { computeRelated, type RelatedInput } from "../lib/related.js";

const CHARTS = "@gooddata/sdk-ui-charts";
const UI = "@gooddata/sdk-ui";

const t = (text: string): ExcerptToken => ({ kind: "Content", text });
const r = (pkg: string, name: string, kind = "interface"): ExcerptToken => ({
    kind: "Reference",
    text: name,
    canonicalReference: `${pkg}!${name}:${kind}`,
});

function item(pkg: string, name: string, kind: string, over: Partial<ApiItem> = {}): ApiItem {
    return {
        kind,
        name,
        canonicalReference: `${pkg}!${name}:${kind.toLowerCase()}`,
        excerptTokens: [t(`export ${kind.toLowerCase()} ${name}`)],
        ...over,
    };
}

const pkgDoc = (pkg: string, members: ApiItem[]): ApiPackageJson => ({
    kind: "Package",
    name: pkg,
    members: [{ kind: "EntryPoint", name: "", canonicalReference: `${pkg}!`, members } as ApiItem],
});

/**
 * IBarChartProps extends IBarChartBucketProps and IBucketChartProps, has a `config: IChartConfig`
 * member, and BarChart() takes it. AreaChart, AxisNamePosition, Zeta are unrelated package mates.
 */
function chartsModel(): ApiPackageJson[] {
    const props = item(CHARTS, "IBarChartProps", "Interface", {
        excerptTokens: [
            t("export interface IBarChartProps extends "),
            r(CHARTS, "IBarChartBucketProps"),
            t(", "),
            r(CHARTS, "IBucketChartProps"),
            t(" "),
        ],
        extendsTokenRanges: [
            { startIndex: 1, endIndex: 2 },
            { startIndex: 3, endIndex: 4 },
        ],
        members: [
            {
                kind: "PropertySignature",
                name: "config",
                canonicalReference: `${CHARTS}!IBarChartProps#config:member`,
                excerptTokens: [t("config?: "), r(CHARTS, "IChartConfig"), t(";")],
            },
        ],
    });
    const barChart = item(CHARTS, "BarChart", "Function", {
        excerptTokens: [
            t("export declare function BarChart(props: "),
            r(CHARTS, "IBarChartProps"),
            t("): JSX.Element"),
        ],
    });
    const child = item(CHARTS, "IStackedBarChartProps", "Interface", {
        excerptTokens: [
            t("export interface IStackedBarChartProps extends "),
            r(CHARTS, "IBarChartProps"),
            t(" "),
        ],
        extendsTokenRanges: [{ startIndex: 1, endIndex: 2 }],
    });
    return [
        pkgDoc(CHARTS, [
            item(CHARTS, "AreaChart", "Function"),
            item(CHARTS, "AxisNamePosition", "TypeAlias"),
            barChart,
            item(CHARTS, "IBarChartBucketProps", "Interface"),
            props,
            item(CHARTS, "IBucketChartProps", "Interface"),
            item(CHARTS, "IChartConfig", "Interface"),
            child,
            item(CHARTS, "Zeta", "Variable"),
        ]),
    ];
}

function input(docs: ApiPackageJson[], over: Partial<RelatedInput> = {}): RelatedInput {
    const pageSlugs = new Set<string>();
    for (const doc of docs)
        for (const ep of doc.members)
            for (const m of ep.members ?? [])
                pageSlugs.add(`${doc.name.replace("@gooddata/", "")}.${m.name.toLowerCase()}`);
    return { docs, pageSlugs, sourcePathBySlug: new Map(), guideSymbolGroups: [], ...over };
}

describe("computeRelated", () => {
    it("ranks parents, then users and children, then used types, then package fallback", () => {
        const related = computeRelated(input(chartsModel()));
        assert.deepEqual(related.get("sdk-ui-charts.ibarchartprops"), [
            "sdk-ui-charts.ibarchartbucketprops", // tier 1, A–Z
            "sdk-ui-charts.ibucketchartprops",
            "sdk-ui-charts.barchart", // tier 2: direct user
            "sdk-ui-charts.istackedbarchartprops", // tier 2: child
            "sdk-ui-charts.ichartconfig", // tier 3: used in a member
        ]);
    });

    it("lists the types that use S before the types S uses, and counts inherited members", () => {
        const configMember = (owner: string): ApiItem => ({
            kind: "PropertySignature",
            name: "config",
            canonicalReference: `${UI}!${owner}#config:member`,
            excerptTokens: [t("config?: "), r(UI, "IChartConfig"), t(";")],
        });
        const docs = [
            pkgDoc(UI, [
                item(UI, "IBase", "Interface", { members: [configMember("IBase")] }),
                item(UI, "IChartConfig", "Interface", {
                    members: [
                        {
                            kind: "PropertySignature",
                            name: "sizing",
                            canonicalReference: `${UI}!IChartConfig#sizing:member`,
                            excerptTokens: [t("sizing?: "), r(UI, "Sizing", "type"), t(";")],
                        },
                    ],
                }),
                item(UI, "IChild", "Interface", {
                    excerptTokens: [t("export interface IChild extends "), r(UI, "IBase"), t(" ")],
                    extendsTokenRanges: [{ startIndex: 1, endIndex: 2 }],
                }),
                item(UI, "Sizing", "TypeAlias"),
            ]),
        ];
        const related = computeRelated(input(docs));
        assert.deepEqual(related.get("sdk-ui.ichartconfig")?.slice(0, 2), ["sdk-ui.ibase", "sdk-ui.sizing"]);
        assert.deepEqual(related.get("sdk-ui.ichild")?.slice(0, 2), ["sdk-ui.ibase", "sdk-ui.ichartconfig"]);
    });

    it("lists a function's parameter types before package mates", () => {
        const related = computeRelated(input(chartsModel()));
        assert.deepEqual(related.get("sdk-ui-charts.barchart")?.slice(0, 1), [
            "sdk-ui-charts.ibarchartprops",
        ]);
        assert.ok(!related.get("sdk-ui-charts.barchart")?.slice(0, 1).includes("sdk-ui-charts.areachart"));
    });

    it("never lists the symbol itself, never repeats one, and caps at the limit", () => {
        const related = computeRelated(input(chartsModel()));
        for (const [slug, list] of related) {
            assert.ok(!list.includes(slug), `${slug} lists itself`);
            assert.equal(new Set(list).size, list.length, `${slug} has duplicates`);
            assert.ok(list.length <= 5);
        }
    });

    it("links only symbols that have a reference page", () => {
        const docs = chartsModel();
        const pageSlugs = input(docs).pageSlugs;
        pageSlugs.delete("sdk-ui-charts.ibarchartbucketprops");
        const related = computeRelated(input(docs, { pageSlugs }));
        assert.ok(
            !related.get("sdk-ui-charts.ibarchartprops")?.includes("sdk-ui-charts.ibarchartbucketprops"),
        );
        assert.equal(related.has("sdk-ui-charts.ibarchartbucketprops"), false);
    });

    it("fills up from the same package A–Z when nothing closer exists", () => {
        const related = computeRelated(input(chartsModel()));
        assert.deepEqual(related.get("sdk-ui-charts.zeta"), [
            "sdk-ui-charts.areachart",
            "sdk-ui-charts.axisnameposition",
            "sdk-ui-charts.barchart",
            "sdk-ui-charts.ibarchartbucketprops",
            "sdk-ui-charts.ibarchartprops",
        ]);
    });

    it("puts same-source-file symbols before guide siblings, and both before the fallback", () => {
        const docs = [
            pkgDoc(UI, [
                item(UI, "Alpha", "Variable"),
                item(UI, "Beta", "Variable"),
                item(UI, "Gamma", "Variable"),
                item(UI, "Omega", "Variable"),
            ]),
        ];
        const related = computeRelated(
            input(docs, {
                sourcePathBySlug: new Map([
                    ["sdk-ui.omega", "libs/sdk-ui/src/x.ts"],
                    ["sdk-ui.gamma", "libs/sdk-ui/src/x.ts"],
                ]),
                guideSymbolGroups: [["sdk-ui.omega", "sdk-ui.beta"]],
            }),
        );
        assert.deepEqual(related.get("sdk-ui.omega"), ["sdk-ui.gamma", "sdk-ui.beta", "sdk-ui.alpha"]);
    });

    it("merges overloads into one entry and is deterministic", () => {
        const docs = chartsModel();
        const overload = item(CHARTS, "BarChart", "Function", {
            canonicalReference: `${CHARTS}!BarChart:function(2)`,
            overloadIndex: 2,
            excerptTokens: [
                t("export declare function BarChart(p: "),
                r(CHARTS, "IChartConfig"),
                t("): void"),
            ],
        });
        docs[0].members[0].members!.push(overload);
        const a = computeRelated(input(docs));
        const b = computeRelated(input(docs));
        assert.deepEqual([...a], [...b]);
        assert.deepEqual(a.get("sdk-ui-charts.barchart")?.slice(0, 2), [
            "sdk-ui-charts.ibarchartprops",
            "sdk-ui-charts.ichartconfig",
        ]);
    });
});
