// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import {
    collectProps,
    findPropsInterface,
    loadApiModelFromDocs,
    refKey,
    refToSlug,
    resolvePropsForPage,
    symbolToRefKey,
    type ApiItem,
    type ApiPackageJson,
} from "../lib/api-model.js";

const ref = (text: string, canonicalReference: string) => ({
    kind: "Reference" as const,
    text,
    canonicalReference,
});
const txt = (text: string) => ({ kind: "Content" as const, text });

const CHARTS = "@gooddata/sdk-ui-charts";
const UI = "@gooddata/sdk-ui";

function pkg(name: string, members: ApiItem[]): ApiPackageJson {
    return {
        kind: "Package",
        name,
        members: [{ kind: "EntryPoint", canonicalReference: `${name}!`, name: "", members }],
    };
}

const barChartFn: ApiItem = {
    kind: "Function",
    canonicalReference: `${CHARTS}!BarChart:function(1)`,
    name: "BarChart",
    excerptTokens: [
        txt("export declare function BarChart(props: "),
        ref("IBarChartProps", `${CHARTS}!IBarChartProps:interface`),
        txt("): "),
        ref("JSX.Element", "@types/react!JSX.Element:interface"),
        txt(";"),
    ],
    parameters: [
        {
            parameterName: "props",
            parameterTypeTokenRange: { startIndex: 1, endIndex: 2 },
            isOptional: false,
        },
    ],
    overloadIndex: 1,
};

const barChartProps: ApiItem = {
    kind: "Interface",
    canonicalReference: `${CHARTS}!IBarChartProps:interface`,
    name: "IBarChartProps",
    excerptTokens: [
        txt("export interface IBarChartProps extends "),
        ref("IBarChartBucketProps", `${CHARTS}!IBarChartBucketProps:interface`),
        txt(", "),
        ref("IBucketChartProps", `${UI}!IBucketChartProps:interface`),
        txt(" "),
    ],
    extendsTokenRanges: [
        { startIndex: 1, endIndex: 2 },
        { startIndex: 3, endIndex: 4 },
    ],
    members: [],
};

const bucketProps: ApiItem = {
    kind: "Interface",
    canonicalReference: `${CHARTS}!IBarChartBucketProps:interface`,
    name: "IBarChartBucketProps",
    excerptTokens: [txt("export interface IBarChartBucketProps ")],
    extendsTokenRanges: [],
    members: [
        {
            kind: "PropertySignature",
            canonicalReference: `${CHARTS}!IBarChartBucketProps#measures:member`,
            name: "measures",
            docComment: "/**\n * Specify one or more measures.\n *\n * @remarks\n * Cardinality note.\n */\n",
            excerptTokens: [
                txt("measures: "),
                ref("AttributesMeasuresOrPlaceholders", `${UI}!AttributesMeasuresOrPlaceholders:type`),
                txt(";"),
            ],
            isOptional: false,
            propertyTypeTokenRange: { startIndex: 1, endIndex: 2 },
        },
        {
            kind: "PropertySignature",
            canonicalReference: `${CHARTS}!IBarChartBucketProps#filters:member`,
            name: "filters",
            docComment: "/**\n * Specify filters.\n */\n",
            excerptTokens: [
                txt("filters?: "),
                ref("NullableFiltersOrPlaceholders", `${UI}!NullableFiltersOrPlaceholders:type`),
                txt(";"),
            ],
            isOptional: true,
            propertyTypeTokenRange: { startIndex: 1, endIndex: 2 },
        },
        {
            kind: "PropertySignature",
            canonicalReference: `${CHARTS}!IBarChartBucketProps#backend:member`,
            name: "backend",
            docComment: "/**\n * Own backend wins over the inherited one.\n */\n",
            excerptTokens: [txt("backend?: "), txt("string"), txt(";")],
            isOptional: true,
            propertyTypeTokenRange: { startIndex: 1, endIndex: 2 },
        },
    ],
};

const commonProps: ApiItem = {
    kind: "Interface",
    canonicalReference: `${UI}!IBucketChartProps:interface`,
    name: "IBucketChartProps",
    excerptTokens: [
        txt("export interface IBucketChartProps extends "),
        ref("IBucketChartProps", `${UI}!IBucketChartProps:interface`), // self-reference: must not loop
        txt(", "),
        ref("HTMLAttributes", "@types/react!HTMLAttributes:interface"), // outside the model: skipped
        txt(" "),
    ],
    extendsTokenRanges: [
        { startIndex: 1, endIndex: 2 },
        { startIndex: 3, endIndex: 4 },
    ],
    members: [
        {
            kind: "MethodSignature",
            canonicalReference: `${UI}!IBucketChartProps#onDrill:member(1)`,
            name: "onDrill",
            docComment:
                "/**\n * Called on drill. See {@link IDrillEvent | the event}.\n *\n * @deprecated use onDrillV2\n */\n",
            excerptTokens: [
                txt("onDrill?(event: "),
                ref("IDrillEvent", `${UI}!IDrillEvent:interface`),
                txt("): "),
                txt("void"),
                txt(";"),
            ],
            isOptional: true,
        },
        {
            kind: "PropertySignature",
            canonicalReference: `${UI}!IBucketChartProps#backend:member`,
            name: "backend",
            excerptTokens: [
                txt("backend?: "),
                ref("IAnalyticalBackend", "@gooddata/sdk-backend-spi!IAnalyticalBackend:interface"),
                txt(";"),
            ],
            isOptional: true,
            propertyTypeTokenRange: { startIndex: 1, endIndex: 2 },
        },
        {
            kind: "IndexSignature",
            canonicalReference: `${UI}!IBucketChartProps:index(1)`,
            name: "",
            excerptTokens: [txt("[key: string]: unknown;")],
        },
    ],
};

const pivotVar: ApiItem = {
    kind: "Variable",
    canonicalReference: `${UI}!RawExecute:var`,
    name: "RawExecute",
    excerptTokens: [
        txt("RawExecute: "),
        txt("(props: "),
        ref("IBucketChartProps", `${UI}!IBucketChartProps:interface`),
        txt(") => JSX.Element"),
    ],
    variableTypeTokenRange: { startIndex: 1, endIndex: 4 },
};

const model = loadApiModelFromDocs([
    pkg(CHARTS, [barChartFn, barChartProps, bucketProps]),
    pkg(UI, [commonProps, pivotVar]),
]);

test("refKey strips the kind and overload suffix", () => {
    assert.equal(refKey(`${CHARTS}!BarChart:function(1)`), `${CHARTS}!BarChart`);
    assert.equal(
        refKey(`${CHARTS}!IBarChartBucketProps#filters:member`),
        `${CHARTS}!IBarChartBucketProps#filters`,
    );
    assert.equal(refKey(`${UI}!Foo:type`), `${UI}!Foo`);
});

test("refToSlug matches the api_refs.json key rule; non-@gooddata refs do not link", () => {
    assert.equal(
        refToSlug(`${UI}!NullableFiltersOrPlaceholders:type`),
        "sdk-ui.nullablefiltersorplaceholders",
    );
    assert.equal(refToSlug("@types/react!JSX.Element:interface"), undefined);
    assert.equal(refToSlug(`${UI}!~Local:interface`), undefined);
});

test("symbolToRefKey maps guide api_symbols onto model keys", () => {
    assert.equal(symbolToRefKey("@gooddata/sdk-ui-charts:BarChart"), `${CHARTS}!BarChart`);
    assert.equal(symbolToRefKey("not-a-symbol"), undefined);
});

test("findPropsInterface: function -> first param type; interface -> itself; variable -> first interface ref", () => {
    assert.equal(findPropsInterface(model, barChartFn)?.name, "IBarChartProps");
    assert.equal(findPropsInterface(model, barChartProps)?.name, "IBarChartProps");
    assert.equal(findPropsInterface(model, pivotVar)?.name, "IBucketChartProps");
});

test("findPropsInterface: skips the untyped parameter api-extractor adds for destructured props", () => {
    const destructuredFn: ApiItem = {
        ...barChartFn,
        parameters: [
            {
                parameterName: "{ measures, }",
                parameterTypeTokenRange: { startIndex: 0, endIndex: 0 },
                isOptional: false,
            },
            ...barChartFn.parameters!,
        ],
    };
    assert.equal(findPropsInterface(model, destructuredFn)?.name, "IBarChartProps");
});

test("findPropsInterface: an inline object parameter has no props interface", () => {
    const inlineFn: ApiItem = {
        ...barChartFn,
        excerptTokens: [
            txt("export declare function useThing(input: "),
            txt("{\n    props: "),
            ref("IBarChartProps", `${CHARTS}!IBarChartProps:interface`),
            txt(";\n}"),
            txt("): void;"),
        ],
        parameters: [
            {
                parameterName: "input",
                parameterTypeTokenRange: { startIndex: 1, endIndex: 4 },
                isOptional: false,
            },
        ],
    };
    assert.equal(findPropsInterface(model, inlineFn), undefined);
});

test("collectProps walks inheritance across packages, shadows by name, skips unknown parents and cycles", () => {
    const props = collectProps(model, barChartProps);
    assert.deepEqual(
        props.map((p) => p.name),
        ["measures", "filters", "backend", "onDrill"],
    );
    const byName = Object.fromEntries(props.map((p) => [p.name, p]));

    assert.equal(byName.measures.required, true);
    assert.equal(byName.measures.inherited, true);
    assert.equal(byName.measures.owner, "IBarChartBucketProps");
    assert.equal(byName.measures.ownerRef, `${CHARTS}!IBarChartBucketProps`);
    assert.equal(byName.measures.description, "Specify one or more measures.");
    assert.equal(byName.measures.type[0].ref, `${UI}!AttributesMeasuresOrPlaceholders:type`);

    assert.equal(byName.filters.required, false);

    // nearer ancestor's `backend` wins over the farther one
    assert.equal(byName.backend.type.map((t) => t.text).join(""), "string");

    assert.equal(byName.onDrill.type.map((t) => t.text).join(""), "(event: IDrillEvent) => void");
    assert.equal(byName.onDrill.type[1].ref, `${UI}!IDrillEvent:interface`);
    assert.equal(byName.onDrill.description, "Called on drill. See the event.");
    assert.equal(byName.onDrill.deprecated, true);
});

test("own members are not inherited", () => {
    const props = collectProps(model, bucketProps);
    assert.equal(
        props.every((p) => p.inherited === false),
        true,
    );
});

test("resolvePropsForPage: api_symbols in order; props_interfaces only when no api_symbols are declared", () => {
    const viaFn = resolvePropsForPage(model, ["@gooddata/sdk-ui-charts:BarChart"], []);
    assert.equal(viaFn?.root.name, "IBarChartProps");
    assert.equal(viaFn?.props.length, 4);

    const viaIface = resolvePropsForPage(model, [], ["IBucketChartProps"]);
    assert.equal(viaIface?.root.name, "IBucketChartProps");

    // declared symbols that are not public must not fall through to an ancestor
    assert.equal(
        resolvePropsForPage(model, ["@gooddata/sdk-ui-ext:Missing"], ["IBucketChartProps"]),
        undefined,
    );
    assert.equal(resolvePropsForPage(model, [], ["Nope"]), undefined);
});
