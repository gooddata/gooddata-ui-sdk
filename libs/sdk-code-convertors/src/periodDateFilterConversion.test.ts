// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Dashboard, Query, Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { buildAfmExecution } from "./execution/buildAfmExecution.js";
import { declarativeDashboardToYaml } from "./from/declarativeDashboardToYaml.js";
import { declarativeVisualisationToYaml } from "./from/declarativeVisualisationToYaml.js";
import { yamlDashboardToDeclarative } from "./to/yamlDashboardToDeclarative.js";
import {
    type VisualisationDefinition,
    yamlFiltersToDeclarative,
    yamlVisualisationToDeclarative,
} from "./to/yamlVisualisationToDeclarative.js";
import { CoreErrorCode } from "./utils/errors.js";

const dataSet = (id: string) => ({ identifier: { id, type: "dataset" } });
const parameter = (id: string) => ({ identifier: { id, type: "parameter" } });

const EMPTY_VALUES = [undefined, "include", "exclude", "only"] as const;

/** A range of the filter's own, which a period takes from its parameter instead. */
const OWN_RANGE = { granularity: "MONTH", from: -1, to: 0 } as const;
const OWN_RANGE_KEYS = Object.keys(OWN_RANGE) as Array<keyof typeof OWN_RANGE>;
const withOwnRange = (filter: object, rangeKey: keyof typeof OWN_RANGE) => ({
    ...filter,
    [rangeKey]: OWN_RANGE[rangeKey],
});

function refusal(convert: () => unknown): unknown {
    try {
        convert();
    } catch (error) {
        return error;
    }
    throw new Error("the conversion did not refuse the filter");
}

const ownRangeRefusal = (key: string, rangeKey: string, path: string[]) => ({
    code: CoreErrorCode.PeriodFilterWithRange,
    message: `Date filter "${key}" uses a date range parameter, so it cannot also set "${rangeKey}". in: ${path.join("/")}`,
    context: { path },
});

describe("a visualization date filter set to a period", () => {
    const visualisation = (query: object): Visualisation =>
        ({
            type: "bar_chart",
            id: "revenue_by_period",
            title: "Revenue by period",
            query: { fields: { m1: { using: "metric/revenue" } }, ...query },
            metrics: [{ field: "m1" }],
        }) as Visualisation;

    function roundTrip(input: Visualisation) {
        const declarative = yamlVisualisationToDeclarative([], input);
        const { json } = declarativeVisualisationToYaml([], declarative);
        return { stored: declarative.content as VisualisationDefinition, json: json as Visualisation };
    }

    const period = (emptyValues?: (typeof EMPTY_VALUES)[number]) => ({
        type: "date_filter" as const,
        using: "date",
        parameter: "last_13_months",
        ...(emptyValues ? { empty_values: emptyValues } : {}),
    });
    const storedPeriod = (localIdentifier: string, emptyValues?: (typeof EMPTY_VALUES)[number]) => ({
        parameterizedDateFilter: {
            dataSet: dataSet("date"),
            parameter: parameter("last_13_months"),
            localIdentifier,
            ...(emptyValues ? { emptyValueHandling: emptyValues } : {}),
        },
    });

    it.each(EMPTY_VALUES)("round-trips at query level, empty values %s", (emptyValues) => {
        const input = visualisation({ filter_by: { reporting_period: period(emptyValues) } });

        const { stored, json } = roundTrip(input);

        expect(stored.filters).toEqual([storedPeriod("reporting_period", emptyValues)]);
        expect(json.query.filter_by).toStrictEqual(input.query.filter_by);
    });

    it.each(EMPTY_VALUES)("round-trips in a metric's filter, empty values %s", (emptyValues) => {
        const input = visualisation({
            fields: { m1: { using: "metric/revenue", filter_by: { metric_period: period(emptyValues) } } },
        });

        const { stored, json } = roundTrip(input);

        const [measure] = stored.buckets[0].items as Array<{
            measure: { definition: { measureDefinition: { filters: unknown[] } } };
        }>;
        expect(measure.measure.definition.measureDefinition.filters).toEqual([
            storedPeriod("metric_period", emptyValues),
        ]);
        expect(json.query.fields["m1"]).toStrictEqual(input.query.fields["m1"]);
        expect(json.query.filter_by).toBeUndefined();
    });

    it("round-trips with the attribute filters it carries", () => {
        const year = { type: "attribute_filter", using: "label/date.year", state: { include: ["2025"] } };
        const input = visualisation({
            filter_by: { reporting_period: { ...period("include"), with: { date_year_filter: year } } },
        });

        const { stored, json } = roundTrip(input);

        expect(stored.filters).toEqual([
            storedPeriod("reporting_period", "include"),
            {
                positiveAttributeFilter: {
                    displayForm: { identifier: { id: "date.year", type: "label" } },
                    in: { values: ["2025"] },
                },
            },
        ]);
        expect(json.query.filter_by?.["reporting_period"]).toStrictEqual({
            ...period("include"),
            with: { "date.year_filter": year },
        });
    });

    it("is named after its date data set and period when stored without a local identifier", () => {
        const declarative = yamlVisualisationToDeclarative([], visualisation({}));
        const { localIdentifier: _, ...unnamed } = storedPeriod("x").parameterizedDateFilter;
        const stored = {
            ...declarative,
            content: { ...(declarative.content as object), filters: [{ parameterizedDateFilter: unnamed }] },
        };

        const pulled = declarativeVisualisationToYaml([], stored).json as Visualisation;
        const redeployed = roundTrip(pulled);

        expect(pulled.query.filter_by).toStrictEqual({ date_last_13_months: period() });
        expect(redeployed.stored.filters).toEqual([storedPeriod("date_last_13_months")]);
    });

    it.each([
        ["two periods with long ids", "d".repeat(200), [`${"p".repeat(200)}_a`, `${"p".repeat(200)}_b`]],
        // 126 + "_" + 128 is exactly 255 characters, before the "_2" of the repeated key.
        ["one period of a 255 character name twice", "d".repeat(126), ["p".repeat(128), "p".repeat(128)]],
    ])("keeps the names of %s within the 255 characters of a key", (_case, longDataSet, periods) => {
        const unnamed = (period: string) => ({
            parameterizedDateFilter: { dataSet: dataSet(longDataSet), parameter: parameter(period) },
        });
        const declarative = yamlVisualisationToDeclarative([], visualisation({}));
        const stored = {
            ...declarative,
            content: {
                ...(declarative.content as object),
                filters: periods.map(unnamed),
            },
        };

        const pulled = declarativeVisualisationToYaml([], stored).json as Visualisation;
        const keys = Object.keys(pulled.query.filter_by ?? {});

        expect(keys).toHaveLength(2);
        for (const key of keys) {
            expect(key).toMatch(/^(?!\.)[.a-z0-9_-]{1,255}$/i);
        }
        expect(
            roundTrip(pulled).stored.filters?.map((filter) => Object.values(filter)[0].localIdentifier),
        ).toEqual(keys);
    });

    it("refuses a range of its own rather than dropping it", () => {
        const convert = () =>
            yamlFiltersToDeclarative([], {
                f: {
                    type: "date_filter",
                    using: "date",
                    parameter: "p",
                    granularity: "MONTH",
                    from: -1,
                    to: 0,
                },
            });

        expect(refusal(convert)).toMatchObject({
            code: CoreErrorCode.PeriodFilterWithRange,
            message: `Date filter "f" uses a date range parameter, so it cannot also set "granularity", "from", "to". in: f`,
        });
    });

    it.each(OWN_RANGE_KEYS)("refuses its own %s at query level", (rangeKey) => {
        const input = visualisation({ filter_by: { reporting_period: withOwnRange(period(), rangeKey) } });

        expect(refusal(() => yamlVisualisationToDeclarative([], input))).toMatchObject(
            ownRangeRefusal("reporting_period", rangeKey, ["query", "filter_by", "reporting_period"]),
        );
    });

    it.each(OWN_RANGE_KEYS)("refuses its own %s in a metric's filter", (rangeKey) => {
        const input = visualisation({
            fields: {
                m1: {
                    using: "metric/revenue",
                    filter_by: { metric_period: withOwnRange(period(), rangeKey) },
                },
            },
        });

        expect(refusal(() => yamlVisualisationToDeclarative([], input))).toMatchObject(
            ownRangeRefusal("metric_period", rangeKey, [
                "query",
                "fields",
                "m1",
                "filter_by",
                "metric_period",
            ]),
        );
    });

    describe("in the editor preview", () => {
        const afmPeriod = (localIdentifier: string, emptyValueHandling?: string) => ({
            parameterizedDateFilter: {
                dataset: dataSet("date"),
                parameter: parameter("last_13_months"),
                localIdentifier,
                ...(emptyValueHandling ? { emptyValueHandling } : {}),
            },
        });

        it.each(EMPTY_VALUES)("is sent as the period, empty values %s", (emptyValues) => {
            const query: Query = { fields: {}, filter_by: { reporting_period: period(emptyValues) } };

            const { filters } = buildAfmExecution([], query).execution.execution;

            expect(filters).toEqual([afmPeriod("reporting_period", emptyValues?.toUpperCase())]);
        });

        it("is sent in a metric's filter and with the attribute filters it carries", () => {
            const year = {
                type: "attribute_filter" as const,
                using: "label/date.year",
                state: { include: ["2025"] },
            };
            const query: Query = {
                fields: { m1: { using: "metric/revenue", filter_by: { metric_period: period() } } },
                filter_by: { reporting_period: { ...period(), with: { year } } },
            };

            const { measures, filters } = buildAfmExecution([], query).execution.execution;

            expect(measures[0].definition).toMatchObject({
                measure: { filters: [afmPeriod("metric_period")] },
            });
            expect(filters).toEqual([
                afmPeriod("reporting_period"),
                {
                    positiveAttributeFilter: {
                        label: { identifier: { id: "date.year", type: "label" } },
                        in: { values: ["2025"] },
                    },
                },
            ]);
        });

        it.each(OWN_RANGE_KEYS)("refuses its own %s at query level", (rangeKey) => {
            const query: Query = {
                fields: {},
                filter_by: { reporting_period: withOwnRange(period(), rangeKey) },
            };

            expect(refusal(() => buildAfmExecution([], query))).toMatchObject(
                ownRangeRefusal("reporting_period", rangeKey, ["filter_by", "reporting_period"]),
            );
        });

        it.each(OWN_RANGE_KEYS)("refuses its own %s in a metric's filter", (rangeKey) => {
            const query: Query = {
                fields: {
                    m1: {
                        using: "metric/revenue",
                        filter_by: { metric_period: withOwnRange(period(), rangeKey) },
                    },
                },
            };

            expect(refusal(() => buildAfmExecution([], query))).toMatchObject(
                ownRangeRefusal("metric_period", rangeKey, ["fields", "m1", "filter_by", "metric_period"]),
            );
        });
    });
});

describe("a dashboard date filter set to a period", () => {
    const commonPeriod = {
        type: "date_filter",
        parameter: "last_13_months",
        title: "Reporting period",
        mode: "readonly",
    };
    const orderPeriod = {
        type: "date_filter",
        date: "order_date",
        parameter: "last_13_months",
        empty_values: "exclude",
        title: "Order period",
        mode: "hidden",
    };
    const storedCommonPeriod = {
        dashboardParameterizedDateFilter: {
            parameter: parameter("last_13_months"),
            localIdentifier: "common_period",
        },
    };
    const storedOrderPeriod = {
        dashboardParameterizedDateFilter: {
            dataSet: dataSet("order_date"),
            parameter: parameter("last_13_months"),
            localIdentifier: "order_period",
            emptyValueHandling: "exclude",
        },
    };

    const dashboard = (overrides: object): Dashboard =>
        ({ type: "dashboard", id: "sales", title: "Sales", sections: [], ...overrides }) as Dashboard;

    type StoredContent = {
        dateFilterConfig?: unknown;
        dateFilterConfigs?: unknown;
        tabs: Array<{ filterContextRef: { identifier: { id: string } } }>;
    };

    function deploy(input: Dashboard) {
        const { dashboard, filterContext, tabFilterContexts } = yamlDashboardToDeclarative([], input);
        const filterContexts = [...(filterContext ? [filterContext] : []), ...(tabFilterContexts ?? [])];
        return { dashboard, content: dashboard.content as StoredContent, filterContexts };
    }

    function pull({ dashboard, filterContexts }: ReturnType<typeof deploy>) {
        return declarativeDashboardToYaml([], dashboard, filterContexts).json;
    }

    const storedFilters = (filterContext: { content?: unknown }) =>
        (filterContext.content as { filters: unknown[] }).filters;

    it("round-trips the common period and a data set's period with their titles and modes", () => {
        const input = dashboard({ filters: { common_period: commonPeriod, order_period: orderPeriod } });

        const deployed = deploy(input);

        expect(storedFilters(deployed.filterContexts[0])).toEqual([storedCommonPeriod, storedOrderPeriod]);
        expect(deployed.content.dateFilterConfig).toEqual({
            filterName: "Reporting period",
            mode: "readonly",
        });
        expect(deployed.content.dateFilterConfigs).toEqual([
            { dateDataSet: dataSet("order_date"), config: { filterName: "Order period", mode: "hidden" } },
        ]);
        expect(pull(deployed).filters).toStrictEqual(input.filters);
    });

    it("keeps a bare common period, which says nothing beyond its period", () => {
        const input = dashboard({ filters: { common_period: { type: "date_filter", parameter: "p" } } });

        const deployed = deploy(input);

        expect(storedFilters(deployed.filterContexts[0])).toEqual([
            {
                dashboardParameterizedDateFilter: {
                    parameter: parameter("p"),
                    localIdentifier: "common_period",
                },
            },
        ]);
        expect(pull(deployed).filters).toStrictEqual(input.filters);
    });

    it("round-trips inside a filter group", () => {
        const input = dashboard({
            filters: {
                periods: {
                    type: "filter_group",
                    title: "Periods",
                    filters: { common_period: commonPeriod, order_period: orderPeriod },
                },
            },
        });

        const deployed = deploy(input);

        expect(storedFilters(deployed.filterContexts[0])).toEqual([storedCommonPeriod, storedOrderPeriod]);
        expect(pull(deployed).filters).toStrictEqual(input.filters);
    });

    it.each(["2", "3"])("round-trips in every tab's filter context, version %s", (version) => {
        const input = dashboard({
            version,
            sections: undefined,
            tabs: [
                { id: "overview", title: "Overview", filters: { common_period: commonPeriod }, sections: [] },
                { id: "orders", title: "Orders", filters: { order_period: orderPeriod }, sections: [] },
            ],
        });

        const deployed = deploy(input);
        const [overview, orders] = deployed.content.tabs;
        const filtersOf = (tab: StoredContent["tabs"][number]) =>
            storedFilters(
                deployed.filterContexts.find(({ id }) => id === tab.filterContextRef.identifier.id)!,
            );

        expect(filtersOf(overview)).toEqual([storedCommonPeriod]);
        expect(filtersOf(orders)).toEqual([storedOrderPeriod]);
        expect(pull(deployed).tabs?.map((tab) => tab.filters)).toStrictEqual(
            input.tabs?.map((tab) => tab.filters),
        );
    });

    it("stays a parent of an attribute filter", () => {
        const region = {
            type: "attribute_filter",
            using: "label/region",
            parents: [{ using: "order_period", common: false }],
        };
        const input = dashboard({ filters: { order_period: orderPeriod, region } });

        const deployed = deploy(input);

        expect(storedFilters(deployed.filterContexts[0])[1]).toMatchObject({
            attributeFilter: {
                filterElementsByDate: [{ filterLocalIdentifier: "order_period", isCommonDate: false }],
            },
        });
        expect(pull(deployed).filters?.["region"]).toMatchObject({ parents: region.parents });
    });

    it.each(OWN_RANGE_KEYS)("refuses its own %s as the common period", (rangeKey) => {
        const input = dashboard({ filters: { common_period: withOwnRange(commonPeriod, rangeKey) } });

        expect(refusal(() => deploy(input))).toMatchObject(
            ownRangeRefusal("common_period", rangeKey, ["common_period"]),
        );
    });

    it.each(OWN_RANGE_KEYS)("refuses its own %s as a data set's period", (rangeKey) => {
        const input = dashboard({ filters: { order_period: withOwnRange(orderPeriod, rangeKey) } });

        expect(refusal(() => deploy(input))).toMatchObject(
            ownRangeRefusal("order_period", rangeKey, ["order_period"]),
        );
    });

    it("refuses a range of its own inside a filter group and in a tab", () => {
        const ranged = withOwnRange(orderPeriod, "from");
        const inGroup = dashboard({
            filters: {
                periods: { type: "filter_group", title: "Periods", filters: { order_period: ranged } },
            },
        });
        const inTab = dashboard({
            version: "3",
            sections: undefined,
            tabs: [{ id: "orders", title: "Orders", filters: { order_period: ranged }, sections: [] }],
        });

        expect(refusal(() => deploy(inGroup))).toMatchObject(
            ownRangeRefusal("order_period", "from", ["order_period"]),
        );
        expect(refusal(() => deploy(inTab))).toMatchObject(
            ownRangeRefusal("order_period", "from", ["order_period"]),
        );
    });

    it("is named after its period when stored without a local identifier", () => {
        const deployed = deploy(
            dashboard({ filters: { common_period: commonPeriod, order_period: orderPeriod } }),
        );
        const filterContext = deployed.filterContexts[0];
        const filters = storedFilters(filterContext) as Array<typeof storedOrderPeriod>;
        filters.forEach(({ dashboardParameterizedDateFilter }) => {
            delete (dashboardParameterizedDateFilter as { localIdentifier?: string }).localIdentifier;
        });

        const pulled = pull(deployed);
        const redeployed = deploy(pulled);

        expect(Object.keys(pulled.filters ?? {})).toEqual([
            "date_last_13_months",
            "order_date_last_13_months",
        ]);
        expect(storedFilters(redeployed.filterContexts[0])).toEqual([
            {
                dashboardParameterizedDateFilter: {
                    ...storedCommonPeriod.dashboardParameterizedDateFilter,
                    localIdentifier: "date_last_13_months",
                },
            },
            {
                dashboardParameterizedDateFilter: {
                    ...storedOrderPeriod.dashboardParameterizedDateFilter,
                    localIdentifier: "order_date_last_13_months",
                },
            },
        ]);
    });
});
