// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ModelProp, TypeToken } from "../lib/api-model.js";
import { loadApiModelFromDocs, type ApiPackageJson } from "../lib/api-model.js";
import {
    NO_LINKS,
    buildPropsData,
    makeRefLinker,
    renderPropsTable,
    type RefLinker,
} from "../lib/props-table.js";

const UI = "@gooddata/sdk-ui";
const CHARTS = "@gooddata/sdk-ui-charts";

function prop(over: Partial<ModelProp> & { name: string }): ModelProp {
    return {
        type: [{ text: "string" }],
        required: false,
        description: "",
        deprecated: false,
        beta: false,
        alpha: false,
        owner: "IOwn",
        ownerRef: `${CHARTS}!IOwn`,
        inherited: false,
        ...over,
    };
}
const inherited = (over: Partial<ModelProp> & { name: string }) =>
    prop({
        owner: "IBarChartBucketProps",
        ownerRef: `${CHARTS}!IBarChartBucketProps`,
        inherited: true,
        ...over,
    });

const ref = (text: string, ref: string): TypeToken => ({ text, ref });

const rows = (section: string) =>
    section.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| Prop"));

describe("renderPropsTable (no links)", () => {
    it("emits the table without a heading", () => {
        const section = renderPropsTable(
            [
                inherited({
                    name: "measures",
                    type: [{ text: "IMeasure[]" }],
                    required: true,
                    description: "Primary measures.",
                }),
                inherited({
                    name: "backend",
                    type: [{ text: "IAnalyticalBackend" }],
                    owner: "IBucketChartProps",
                    ownerRef: `${UI}!IBucketChartProps`,
                }),
            ],
            NO_LINKS,
        );
        assert.ok(section.startsWith("| Prop | Type | Required | Description | Inherited from |"));
        assert.ok(
            section.includes(
                "| `measures` | `IMeasure[]` | Yes | Primary measures. | `IBarChartBucketProps` |",
            ),
        );
        assert.ok(section.includes("| `backend` | `IAnalyticalBackend` | No | — | `IBucketChartProps` |"));
    });

    it("renders an em-dash for empty descriptions and own props", () => {
        const section = renderPropsTable([prop({ name: "foo" })], NO_LINKS);
        assert.ok(section.includes("| `foo` | `string` | No | — | — |"));
    });

    it("returns empty string when there are no props", () => {
        assert.equal(renderPropsTable([], NO_LINKS), "");
    });

    it("does not truncate", () => {
        const many = Array.from({ length: 20 }, (_, i) => inherited({ name: `prop${i}` }));
        assert.equal(rows(renderPropsTable(many, NO_LINKS)).length, 20);
    });

    it("sorts required own, optional own, required inherited, optional inherited", () => {
        const section = renderPropsTable(
            [
                prop({ name: "optionalOwn" }),
                prop({ name: "requiredOwn", required: true }),
                inherited({ name: "requiredInherited", required: true }),
                inherited({ name: "optionalInherited" }),
            ],
            NO_LINKS,
        );
        assert.deepEqual(
            rows(section).map((r) => r.split("|")[1].trim()),
            ["`requiredOwn`", "`optionalOwn`", "`requiredInherited`", "`optionalInherited`"],
        );
    });

    it("escapes pipes so the row keeps five columns", () => {
        const section = renderPropsTable(
            [prop({ name: "viewBy", type: [{ text: "IAttribute | Attribute[]" }], description: "A | B" })],
            NO_LINKS,
        );
        const columns = rows(section)[0]
            .split(/(?<!\\)\|/)
            .filter((s) => s !== "");
        assert.equal(columns.length, 5);
        assert.ok(section.includes("`IAttribute \\| Attribute[]`"));
    });

    it("marks deprecated props in the description", () => {
        const section = renderPropsTable(
            [prop({ name: "old", deprecated: true, description: "Use new." })],
            NO_LINKS,
        );
        assert.ok(section.includes("| `old` | `string` | No | _(Deprecated)_ Use new. | — |"));
        const bare = renderPropsTable([prop({ name: "old", deprecated: true })], NO_LINKS);
        assert.ok(bare.includes("| _(Deprecated)_ | — |"));
    });
});

const linker: RefLinker = {
    symbolPath: (slug) =>
        ({
            "sdk-ui-charts.ibarchartbucketprops": "/ref/sdk-ui-charts/sdk-ui-charts.ibarchartbucketprops",
            "sdk-ui.explicitdrill": "/ref/sdk-ui/sdk-ui.explicitdrill",
            "sdk-ui.ichartconfig": "/ref/sdk-ui/sdk-ui.ichartconfig",
        })[slug],
    memberPath: (ownerSlug, name) =>
        ownerSlug === "sdk-ui-charts.ibarchartbucketprops" && name === "drillableItems"
            ? "/ref/sdk-ui-charts/sdk-ui-charts.ibarchartbucketprops.drillableitems"
            : undefined,
};

describe("renderPropsTable (linked)", () => {
    it("links the prop name, each resolvable type token and the parent interface", () => {
        const section = renderPropsTable(
            [
                inherited({
                    name: "drillableItems",
                    type: [ref("ExplicitDrill", `${UI}!ExplicitDrill:type`), { text: "[]" }],
                    description: "Configure drillability.",
                }),
            ],
            linker,
        );
        assert.ok(
            section.includes(
                "| [`drillableItems`](apiref:/ref/sdk-ui-charts/sdk-ui-charts.ibarchartbucketprops.drillableitems) " +
                    "| [`ExplicitDrill`](apiref:/ref/sdk-ui/sdk-ui.explicitdrill)`[]` | No | Configure drillability. " +
                    "| [`IBarChartBucketProps`](apiref:/ref/sdk-ui-charts/sdk-ui-charts.ibarchartbucketprops) |",
            ),
            section,
        );
    });

    it("leaves unresolvable references and React types as plain code", () => {
        const section = renderPropsTable(
            [
                prop({
                    name: "config",
                    type: [
                        { text: "Partial<" },
                        ref("IUnknown", `${UI}!IUnknown:interface`),
                        { text: "> | " },
                        ref("Element", "@types/react!Element:interface"),
                    ],
                }),
            ],
            linker,
        );
        assert.ok(section.includes("| `config` | `Partial<IUnknown> \\| Element` | No | — | — |"), section);
    });

    it("keeps the spacing around links outside the code spans", () => {
        const section = renderPropsTable(
            [
                prop({
                    name: "dashboard",
                    type: [
                        { text: "string | " },
                        ref("ExplicitDrill", `${UI}!ExplicitDrill:type`),
                        { text: " | IDashboard" },
                    ],
                }),
            ],
            linker,
        );
        assert.ok(
            section.includes(
                "| `string \\|` [`ExplicitDrill`](apiref:/ref/sdk-ui/sdk-ui.explicitdrill) `\\| IDashboard` |",
            ),
            section,
        );
    });

    it("splits mixed types into linked and plain runs", () => {
        const section = renderPropsTable(
            [
                prop({
                    name: "config",
                    type: [
                        { text: "Partial<" },
                        ref("IChartConfig", `${UI}!IChartConfig:interface`),
                        { text: ">" },
                    ],
                }),
            ],
            linker,
        );
        assert.ok(
            section.includes("| `Partial<`[`IChartConfig`](apiref:/ref/sdk-ui/sdk-ui.ichartconfig)`>` |"),
            section,
        );
    });
});

describe("makeRefLinker", () => {
    const pages = new Set([
        "sdk-ui-charts.ibarchartbucketprops",
        "sdk-ui-charts.ibarchartbucketprops.drillableitems",
    ]);
    const l = makeRefLinker("__API_REF_BASE__", pages);
    it("links a symbol only when its page was generated", () => {
        assert.equal(
            l.symbolPath("sdk-ui-charts.ibarchartbucketprops"),
            "__API_REF_BASE__/sdk-ui-charts/sdk-ui-charts.ibarchartbucketprops",
        );
        assert.equal(l.symbolPath("sdk-ui.nope"), undefined);
    });
    it("links a member through api-documenter's safe file name, only when its page exists", () => {
        assert.equal(
            l.memberPath("sdk-ui-charts.ibarchartbucketprops", "drillableItems"),
            "__API_REF_BASE__/sdk-ui-charts/sdk-ui-charts.ibarchartbucketprops.drillableitems",
        );
        assert.equal(l.memberPath("sdk-ui-charts.ibarchartbucketprops", "filters"), undefined);
    });
});

/** A one-package model: BarChart(props: IBarChartProps), IBarChartProps { height? }, and a symbol with no props. */
function model() {
    const doc: ApiPackageJson = {
        kind: "Package",
        name: CHARTS,
        members: [
            {
                kind: "EntryPoint",
                canonicalReference: `${CHARTS}!`,
                name: "",
                members: [
                    {
                        kind: "Function",
                        canonicalReference: `${CHARTS}!BarChart:function(1)`,
                        name: "BarChart",
                        excerptTokens: [
                            { kind: "Content", text: "declare function BarChart(props: " },
                            {
                                kind: "Reference",
                                text: "IBarChartProps",
                                canonicalReference: `${CHARTS}!IBarChartProps:interface`,
                            },
                            { kind: "Content", text: "): JSX.Element;" },
                        ],
                        parameters: [
                            {
                                parameterName: "props",
                                parameterTypeTokenRange: { startIndex: 1, endIndex: 2 },
                                isOptional: false,
                            },
                        ],
                    },
                    {
                        kind: "Interface",
                        canonicalReference: `${CHARTS}!IBarChartProps:interface`,
                        name: "IBarChartProps",
                        members: [
                            {
                                kind: "PropertySignature",
                                canonicalReference: `${CHARTS}!IBarChartProps#height:member`,
                                name: "height",
                                docComment: "/**\n * Chart height.\n */\n",
                                excerptTokens: [
                                    { kind: "Content", text: "height?: " },
                                    { kind: "Content", text: "number" },
                                    { kind: "Content", text: ";" },
                                ],
                                propertyTypeTokenRange: { startIndex: 1, endIndex: 2 },
                                isOptional: true,
                            },
                        ],
                    },
                    {
                        kind: "Variable",
                        canonicalReference: `${CHARTS}!NOTHING:var`,
                        name: "NOTHING",
                        excerptTokens: [{ kind: "Content", text: "NOTHING: string" }],
                    },
                ],
            },
        ],
    } as ApiPackageJson;
    return loadApiModelFromDocs([doc]);
}

const guide = (over: {
    path: string;
    apiSymbols?: string[];
    propsInterfaces?: string[];
    usesShortcode?: boolean;
}) => ({
    apiSymbols: [],
    propsInterfaces: [],
    usesShortcode: true,
    hasPropsTable: false,
    ...over,
});

describe("buildPropsData", () => {
    it("keys one table per guide symbol, resolving a component to its props interface", () => {
        const { tables, unresolvedPages } = buildPropsData(
            model(),
            [guide({ path: "bar", apiSymbols: [`${CHARTS}:BarChart`] })],
            NO_LINKS,
        );
        assert.deepEqual(Object.keys(tables), [`${CHARTS}:BarChart`]);
        assert.ok(tables[`${CHARTS}:BarChart`].includes("| `height` | `number` | No | Chart height. | — |"));
        assert.deepEqual(unresolvedPages, []);
    });

    it("drops symbols without props, so a page falls through to its next api_symbol", () => {
        const { tables } = buildPropsData(
            model(),
            [guide({ path: "bar", apiSymbols: [`${CHARTS}:NOTHING`, `${CHARTS}:BarChart`] })],
            NO_LINKS,
        );
        assert.deepEqual(Object.keys(tables), [`${CHARTS}:BarChart`]);
    });

    it("uses props_interfaces only when the page has no api_symbols", () => {
        const { tables } = buildPropsData(
            model(),
            [guide({ path: "p", propsInterfaces: ["IBarChartProps"] })],
            NO_LINKS,
        );
        assert.deepEqual(Object.keys(tables), ["props_interfaces:IBarChartProps"]);
    });

    it("reports a {{% props %}} page whose symbols have no public props", () => {
        const { unresolvedPages } = buildPropsData(
            model(),
            [
                guide({ path: "broken", apiSymbols: [`${CHARTS}:NOTHING`] }),
                guide({ path: "handwritten", apiSymbols: [`${CHARTS}:NOTHING`], usesShortcode: false }),
            ],
            NO_LINKS,
        );
        assert.deepEqual(unresolvedPages, ["broken"]);
    });
});

describe("beta props", () => {
    it("marks a @beta prop after any deprecation mark", () => {
        const table = renderPropsTable(
            [prop({ name: "next", beta: true, description: "Try it." })],
            NO_LINKS,
        );
        assert.ok(table.includes("| `next` | `string` | No | _(Beta)_ Try it. | — |"), table);
        const both = renderPropsTable([prop({ name: "x", beta: true, deprecated: true })], NO_LINKS);
        assert.ok(both.includes("| _(Deprecated)_ _(Beta)_ | — |"), both);
    });

    it("leaves the rows unmarked when the whole interface is @beta", () => {
        const table = renderPropsTable([prop({ name: "next", beta: true })], NO_LINKS, "beta");
        assert.ok(table.includes("| `next` | `string` | No | — | — |"), table);
    });
});

describe("alpha props", () => {
    it("marks an @alpha prop on a @public or @beta interface", () => {
        const table = renderPropsTable(
            [prop({ name: "next", alpha: true, description: "Try it." })],
            NO_LINKS,
        );
        assert.ok(table.includes("| `next` | `string` | No | _(Alpha)_ Try it. | — |"), table);
        const onBeta = renderPropsTable([prop({ name: "next", alpha: true })], NO_LINKS, "beta");
        assert.ok(onBeta.includes("| _(Alpha)_ | — |"), onBeta);
    });

    it("leaves the rows unmarked when the whole interface is @alpha", () => {
        const table = renderPropsTable(
            [prop({ name: "a", alpha: true }), prop({ name: "b", beta: true })],
            NO_LINKS,
            "alpha",
        );
        assert.ok(table.includes("| `a` | `string` | No | — | — |"), table);
        assert.ok(table.includes("| `b` | `string` | No | — | — |"), table);
    });
});
