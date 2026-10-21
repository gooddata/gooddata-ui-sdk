// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DeclarativeLdm } from "@gooddata/api-client-tiger";
import { type IDeclarativeLogicalModel } from "@gooddata/sdk-model";

import { convertDeclarativeLdm } from "./fromBackend/DeclarativeModelConverter.js";
import { convertDeclarativeLdmToBackend } from "./toBackend/DeclarativeModelConverter.js";

const ldm: DeclarativeLdm = {
    calendars: {
        fiscal: {
            name: "Fiscal calendar",
            description: "Starts in April",
            definition: { type: "fiscalYear", monthOffset: 3 },
            enabledGranularities: [
                { granularity: "FISCAL_YEAR", prefix: "fy" },
                { granularity: "FISCAL_QUARTER", prefix: "fq" },
            ],
        },
        retail: {
            name: "Retail calendar",
            definition: {
                type: "custom",
                dataSourceTables: { periods: { path: ["public", "retail_periods"], version: "1" } },
            },
            enabledGranularities: [{ granularity: "WEEK", prefix: "rw" }],
        },
    },
    datasetExtensions: [
        {
            id: "customers",
            workspaceDataFilterReferences: [
                {
                    filterColumn: "region_id",
                    filterColumnDataType: "STRING",
                    filterId: { id: "region", type: "workspaceDataFilter" },
                },
            ],
        },
    ],
    datasets: [
        {
            id: "orders",
            title: "Orders",
            description: "Customer orders",
            tags: ["Orders"],
            precedence: 2,
            type: "NORMAL",
            dataSourceTableId: {
                dataSourceId: "pg",
                id: "orders",
                path: ["public", "orders"],
                type: "dataSource",
            },
            grain: [{ id: "order_id", type: "attribute" }],
            attributes: [
                {
                    id: "order_id",
                    title: "Order ID",
                    sourceColumn: "order_id",
                    sourceColumnDataType: "STRING",
                    sortColumn: "order_id",
                    sortDirection: "DESC",
                    isHidden: false,
                    isNullable: true,
                    nullValue: "N/A",
                    locale: "en-US",
                    tags: [],
                    defaultView: { id: "order_name", type: "label" },
                    conditionalFormatting: null,
                    labels: [
                        {
                            id: "order_name",
                            title: "Order name",
                            sourceColumn: "order_name",
                            sourceColumnDataType: "STRING",
                            valueType: "TEXT",
                            translations: [{ locale: "de-DE", sourceColumn: "order_name_de" }],
                            conditionalFormatting: {
                                enabled: true,
                                conditions: [
                                    {
                                        id: "c1",
                                        operator: "CONTAINS",
                                        value: { kind: "literal", value: "rush" },
                                        format: {
                                            color: "#FFFFFF",
                                            backgroundColor: "#E54D40",
                                            scope: "cell",
                                        },
                                    },
                                    {
                                        operator: "BETWEEN",
                                        value: { kind: "literalRange", from: 1, to: 10 },
                                        format: { scope: "row" },
                                    },
                                    {
                                        operator: "IS_EMPTY",
                                        value: { kind: "none" },
                                        format: { color: "#000000", scope: "cell" },
                                    },
                                ],
                            },
                        },
                        {
                            id: "order_region",
                            title: "Order region",
                            sourceColumn: "region_code",
                            sourceColumnDataType: "STRING",
                            valueType: "GEO_AREA",
                            geoAreaConfig: { collection: { id: "countries", kind: "STATIC" } },
                            isHidden: true,
                        },
                    ],
                },
            ],
            facts: [
                {
                    id: "amount",
                    title: "Amount",
                    sourceColumn: "amount",
                    sourceColumnDataType: "NUMERIC",
                    isNullable: false,
                    tags: ["Money"],
                },
            ],
            aggregatedFacts: [
                {
                    id: "amount_sum",
                    sourceColumn: "amount_sum",
                    sourceColumnDataType: "NUMERIC",
                    sourceFactReference: { operation: "SUM", reference: { id: "amount", type: "fact" } },
                },
            ],
            references: [
                {
                    identifier: { id: "order_date", type: "dataset" },
                    multivalue: false,
                    sources: [
                        {
                            column: "ordered_at",
                            dataType: "DATE",
                            isNullable: true,
                            nullValue: "1970-01-01",
                            target: { id: "order_date.day", type: "date" },
                        },
                    ],
                },
                {
                    identifier: { id: "customers", type: "dataset" },
                    multivalue: true,
                    sourceColumns: ["customer_id"],
                    sourceColumnDataTypes: ["INT"],
                },
            ],
            workspaceDataFilterColumns: [{ name: "region_id", dataType: "STRING" }],
            workspaceDataFilterReferences: [
                {
                    filterColumn: "region_id",
                    filterColumnDataType: "STRING",
                    filterId: { id: "region", type: "workspaceDataFilter" },
                },
            ],
        },
        {
            id: "customers",
            title: "Customers",
            type: "AUXILIARY",
            sql: { dataSourceId: "pg", statement: "SELECT * FROM customers" },
            grain: [],
            references: [],
            attributes: [],
            facts: [],
        },
    ],
    dateInstances: [
        {
            id: "order_date",
            title: "Order date",
            description: "Date of the order",
            tags: ["Date"],
            granularities: ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"],
            granularitiesFormatting: { titleBase: "Order", titlePattern: "%titleBase - %granularityTitle" },
            conditionalFormatting: {
                enabled: false,
                conditions: [
                    {
                        id: "d1",
                        operator: "EQUAL_TO",
                        value: { kind: "relativeDate", granularity: "MONTH", from: -1, to: 0 },
                        format: { backgroundColor: "#00FF00", scope: "cell" },
                    },
                    {
                        id: "d2",
                        operator: "GREATER_THAN",
                        value: { kind: "absoluteDate", from: "2024-01-01", to: "2024-12-31" },
                        format: { scope: "row" },
                    },
                ],
            },
        },
    ],
};

describe("declarative logical model conversion", () => {
    it("keeps every field when the model goes from the backend and back", () => {
        expect(convertDeclarativeLdmToBackend(convertDeclarativeLdm(ldm))).toStrictEqual(ldm);
    });

    it("keeps every field when the model goes to the backend and back", () => {
        const model: IDeclarativeLogicalModel = convertDeclarativeLdm(ldm);

        expect(convertDeclarativeLdm(convertDeclarativeLdmToBackend(model))).toStrictEqual(model);
    });

    it("does not share arrays with the input", () => {
        const model = convertDeclarativeLdm(ldm);
        model.datasets![0].tags!.push("Changed");
        model.datasets![0].dataSourceTableId!.path!.push("changed");

        expect(ldm.datasets![0].tags).toEqual(["Orders"]);
        expect(ldm.datasets![0].dataSourceTableId!.path).toEqual(["public", "orders"]);
    });

    it("returns an empty model when the backend sends no model", () => {
        expect(convertDeclarativeLdm(undefined)).toStrictEqual({});
    });

    it("does not add keys for missing optional fields", () => {
        const model = convertDeclarativeLdm({
            datasets: [{ id: "d", title: "D", grain: [], references: [] }],
        });

        expect(model).toStrictEqual({ datasets: [{ id: "d", title: "D", grain: [], references: [] }] });
    });
});
