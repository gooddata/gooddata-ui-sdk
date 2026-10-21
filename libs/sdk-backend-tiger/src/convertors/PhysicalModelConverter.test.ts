// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ScanResultPdm, type ScanSqlResponse } from "@gooddata/api-client-tiger";
import { type IGenerateLogicalModelRequest } from "@gooddata/sdk-model";

import { convertScanResult, convertSqlScanResult } from "./fromBackend/PhysicalModelConverter.js";
import {
    convertGenerateLogicalModelRequest,
    convertScanRequest,
} from "./toBackend/PhysicalModelConverter.js";

describe("physical model conversion", () => {
    it("converts the scan result", () => {
        const scanResult: ScanResultPdm = {
            pdm: {
                tables: [
                    {
                        id: "orders",
                        path: ["public", "orders"],
                        type: "TABLE",
                        namePrefix: "out",
                        columns: [
                            {
                                name: "order_id",
                                dataType: "STRING",
                                isPrimaryKey: true,
                                isNullable: false,
                                description: "Order ID",
                            },
                            { name: "order_name", dataType: "STRING", defaultLabelOf: "order_id" },
                            {
                                name: "customer_id",
                                dataType: "INT",
                                referencedTableId: "customers",
                                referencedTableColumn: "id",
                                nullValue: "0",
                            },
                        ],
                    },
                ],
            },
            warnings: [{ name: "orders", message: "Bad table", columns: [{ name: "x", message: "Bad" }] }],
        };

        expect(convertScanResult(scanResult)).toStrictEqual(scanResult);
    });

    it("converts the SQL scan result", () => {
        const response: ScanSqlResponse = {
            columns: [{ name: "id", dataType: "INT", description: "ID", nullValue: "0" }],
            dataPreview: [["1"], [null]],
        };

        expect(convertSqlScanResult(response)).toStrictEqual(response);
    });

    it("converts the scan request without missing optional fields", () => {
        expect(convertScanRequest({ scanTables: true, scanViews: false, separator: "__" })).toStrictEqual({
            scanTables: true,
            scanViews: false,
            separator: "__",
        });
    });

    it("converts the generate request with the physical model", () => {
        const request: IGenerateLogicalModelRequest = {
            separator: "__",
            factPrefix: "f",
            grainPrefix: "gr",
            workspaceId: "ws",
            generateLongIds: true,
            pdm: {
                tables: [
                    {
                        id: "orders",
                        path: ["public", "orders"],
                        type: "TABLE",
                        columns: [
                            { name: "id", dataType: "INT" },
                            { name: "name", dataType: "STRING", defaultLabelOf: "id" },
                        ],
                    },
                ],
                sqls: [
                    {
                        statement: "SELECT 1 AS id",
                        title: "One",
                        columns: [{ name: "id", dataType: "INT", nullValue: "0" }],
                    },
                ],
                tableOverrides: [
                    {
                        path: ["public", "orders"],
                        columns: [{ name: "url", ldmTypeOverride: "LABEL", labelType: "HYPERLINK" }],
                    },
                ],
            },
        };

        expect(convertGenerateLogicalModelRequest(request)).toStrictEqual(request);
    });
});
