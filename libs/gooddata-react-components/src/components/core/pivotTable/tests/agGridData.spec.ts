// (C) 2007-2019 GoodData Corporation

import { AFM } from "@gooddata/typings";
import * as fixtures from "../../../../../stories/test_data/fixtures";
import { createIntlMock } from "../../../visualizations/utils/intlUtils";
import { getRowHeaders, getFields } from "../agGridHeaders";
import { getRow, getRowTotals } from "../agGridData";

const intl = createIntlMock();

describe("getRowTotals", () => {
    it("should return total rows", () => {
        const fixture = fixtures.pivotTableWithColumnRowAttributesAndTotals;
        const rowFields: string[] = getRowHeaders(
            fixture.executionResponse.dimensions[0].headers,
            {},
            false,
        ).map(header => header.field);
        const columnFields: string[] = getFields(fixture.executionResult.headerItems[1]);
        expect(
            getRowTotals(
                fixture.executionResult.totals,
                [...rowFields, ...columnFields],
                fixture.executionResponse.dimensions[0].headers,
                fixture.executionRequest.resultSpec,
                fixture.executionRequest.afm.measures.map((measure: AFM.IMeasure) => measure.localIdentifier),
                intl,
            ),
        ).toEqual([
            {
                "a_2009_1-a_2071_1-m_0": "1566006.57195",
                "a_2009_1-a_2071_1-m_1": "150708.58845",
                "a_2009_1-a_2071_2-m_0": "1555682.95305",
                "a_2009_1-a_2071_2-m_1": "146457.68655",
                "a_2009_1-a_2071_3-m_0": "1548771.3336",
                "a_2009_1-a_2071_3-m_1": "143611.7256",
                "a_2009_2-a_2071_4-m_0": "1563377.8356",
                "a_2009_2-a_2071_4-m_1": "149626.1676",
                "a_2009_2-a_2071_5-m_0": "1544490.2151",
                "a_2009_2-a_2071_5-m_1": "141848.9121",
                "a_2009_2-a_2071_6-m_0": "1562776.8822",
                "a_2009_2-a_2071_6-m_1": "149378.7162",
                "a_2009_3-a_2071_7-m_0": "1559076.77865",
                "a_2009_3-a_2071_7-m_1": "147855.14415",
                "a_2009_3-a_2071_8-m_0": "1526945.56485",
                "a_2009_3-a_2071_8-m_1": "134624.64435",
                "a_2009_3-a_2071_9-m_0": "1559730.40485",
                "a_2009_3-a_2071_9-m_1": "148124.28435",
                "a_2009_4-a_2071_10-m_0": "1554810.0141",
                "a_2009_4-a_2071_10-m_1": "146098.2411",
                "a_2009_4-a_2071_11-m_0": "1556026.614",
                "a_2009_4-a_2071_11-m_1": "146599.194",
                "a_2009_4-a_2071_12-m_0": "1476657.6039",
                "a_2009_4-a_2071_12-m_1": "113917.8369",
                a_2211: "Sum",
                colSpan: {
                    count: 3,
                    headerKey: "a_2211",
                },
                rowTotalActiveMeasures: ["m_0", "m_1"],
                type: "rowTotal",
            },
            {
                "a_2009_1-a_2071_1-m_0": "52200.219065",
                "a_2009_1-a_2071_1-m_1": null,
                "a_2009_1-a_2071_2-m_0": "51856.098435",
                "a_2009_1-a_2071_2-m_1": null,
                "a_2009_1-a_2071_3-m_0": "51625.71112",
                "a_2009_1-a_2071_3-m_1": null,
                "a_2009_2-a_2071_4-m_0": "52112.59452",
                "a_2009_2-a_2071_4-m_1": null,
                "a_2009_2-a_2071_5-m_0": "51483.00717",
                "a_2009_2-a_2071_5-m_1": null,
                "a_2009_2-a_2071_6-m_0": "52092.56274",
                "a_2009_2-a_2071_6-m_1": null,
                "a_2009_3-a_2071_7-m_0": "51969.225955",
                "a_2009_3-a_2071_7-m_1": null,
                "a_2009_3-a_2071_8-m_0": "50898.185495",
                "a_2009_3-a_2071_8-m_1": null,
                "a_2009_3-a_2071_9-m_0": "51991.013495",
                "a_2009_3-a_2071_9-m_1": null,
                "a_2009_4-a_2071_10-m_0": "51827.00047",
                "a_2009_4-a_2071_10-m_1": null,
                "a_2009_4-a_2071_11-m_0": "51867.5538",
                "a_2009_4-a_2071_11-m_1": null,
                "a_2009_4-a_2071_12-m_0": "49221.92013",
                "a_2009_4-a_2071_12-m_1": null,
                a_2211: "Avg",
                colSpan: {
                    count: 3,
                    headerKey: "a_2211",
                },
                rowTotalActiveMeasures: ["m_0"],
                type: "rowTotal",
            },
        ]);
    });
    it("should return null when no totals are defined", () => {
        const fixture = fixtures.pivotTableWithColumnAndRowAttributes;
        const rowFields: string[] = getRowHeaders(
            fixture.executionResponse.dimensions[0].headers,
            {},
            false,
        ).map(header => header.field);
        const columnFields: string[] = getFields(fixture.executionResult.headerItems[1]);
        expect(
            getRowTotals(
                fixture.executionResult.totals,
                [...rowFields, ...columnFields],
                fixture.executionResponse.dimensions[0].headers,
                fixture.executionRequest.resultSpec,
                fixture.executionRequest.afm.measures.map((measure: AFM.IMeasure) => measure.localIdentifier),
                intl,
            ),
        ).toBe(null);
    });
});

describe("getRow", () => {
    it("should return a grid row", () => {
        const headerItems = fixtures.pivotTableWithColumnAndRowAttributes.executionResult.headerItems;
        const rowHeaders = getRowHeaders(
            fixtures.pivotTableWithColumnAndRowAttributes.executionResponse.dimensions[0].headers,
            {},
            false,
        );

        const columnFields: string[] = getFields(headerItems[1]);

        expect(
            getRow(
                fixtures.pivotTableWithColumnAndRowAttributes.executionResult.data[0],
                0,
                columnFields,
                rowHeaders,
                headerItems[0],
                [],
                intl,
            ),
        ).toEqual({
            "a_2009_1-a_2071_1-m_0": "160104.5665",
            "a_2009_1-a_2071_1-m_1": "49454.8215",
            "a_2009_1-a_2071_1-m_2": "40000",
            "a_2009_1-a_2071_1-m_3": "70649.745",
            "a_2009_1-a_2071_2-m_0": "156148.86625",
            "a_2009_1-a_2071_2-m_1": "47826.00375",
            "a_2009_1-a_2071_2-m_2": "40000",
            "a_2009_1-a_2071_2-m_3": "68322.8625",
            "a_2009_1-a_2071_3-m_0": "154299.8485",
            "a_2009_1-a_2071_3-m_1": "47064.6435",
            "a_2009_1-a_2071_3-m_2": "40000",
            "a_2009_1-a_2071_3-m_3": "67235.205",
            "a_2009_2-a_2071_4-m_0": "158572.501",
            "a_2009_2-a_2071_4-m_1": "48823.971",
            "a_2009_2-a_2071_4-m_2": "40000",
            "a_2009_2-a_2071_4-m_3": "69748.53",
            "a_2009_2-a_2071_5-m_0": "152789.662",
            "a_2009_2-a_2071_5-m_1": "46442.802",
            "a_2009_2-a_2071_5-m_2": "40000",
            "a_2009_2-a_2071_5-m_3": "66346.86",
            "a_2009_2-a_2071_6-m_0": "158587.036",
            "a_2009_2-a_2071_6-m_1": "48829.956",
            "a_2009_2-a_2071_6-m_2": "40000",
            "a_2009_2-a_2071_6-m_3": "69757.08",
            "a_2009_3-a_2071_7-m_0": "156553.19425",
            "a_2009_3-a_2071_7-m_1": "47992.49175",
            "a_2009_3-a_2071_7-m_2": "40000",
            "a_2009_3-a_2071_7-m_3": "68560.7025",
            "a_2009_3-a_2071_8-m_0": "147504.62125",
            "a_2009_3-a_2071_8-m_1": "44266.60875",
            "a_2009_3-a_2071_8-m_2": "40000",
            "a_2009_3-a_2071_8-m_3": "63238.0125",
            "a_2009_3-a_2071_9-m_0": "157944.04075",
            "a_2009_3-a_2071_9-m_1": "48565.19325",
            "a_2009_3-a_2071_9-m_2": "40000",
            "a_2009_3-a_2071_9-m_3": "69378.8475",
            "a_2009_4-a_2071_10-m_0": "156878.19175",
            "a_2009_4-a_2071_10-m_1": "48126.31425",
            "a_2009_4-a_2071_10-m_2": "40000",
            "a_2009_4-a_2071_10-m_3": "68751.8775",
            "a_2009_4-a_2071_11-m_0": "156446.52775",
            "a_2009_4-a_2071_11-m_1": "47948.57025",
            "a_2009_4-a_2071_11-m_2": "40000",
            "a_2009_4-a_2071_11-m_3": "68497.9575",
            "a_2009_4-a_2071_12-m_0": "130719.01675",
            "a_2009_4-a_2071_12-m_1": "37354.88925",
            "a_2009_4-a_2071_12-m_2": "40000",
            "a_2009_4-a_2071_12-m_3": "53364.1275",
            a_2205: "Montgomery",
            a_2211: "Alabama",
            headerItemMap: {
                a_2205: {
                    attributeHeaderItem: {
                        name: "Montgomery",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2204/elements?id=6340107",
                    },
                },
                a_2211: {
                    attributeHeaderItem: {
                        name: "Alabama",
                        uri: "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340109",
                    },
                },
            },
        });
    });
    it("should return subtotal row", () => {
        const headerItems =
            fixtures.pivotTableWithTwoMetricsFourAttributesSubtotals.executionResult.headerItems;
        const rowHeaders = getRowHeaders(
            fixtures.pivotTableWithTwoMetricsFourAttributesSubtotals.executionResponse.dimensions[0].headers,
            {},
            false,
        );

        const columnFields: string[] = getFields(headerItems[1]);

        expect(
            getRow(
                fixtures.pivotTableWithTwoMetricsFourAttributesSubtotals.executionResult.data[0],
                3,
                columnFields,
                rowHeaders,
                headerItems[0],
                [null, null, null, "even"],
                intl,
            ),
        ).toEqual({
            a_1024: "East Coast",
            a_1027: "Direct Sales",
            a_1094: "Rollup (Total)",
            a_64727: "Exclude",
            headerItemMap: {
                a_1024: {
                    attributeHeaderItem: {
                        name: "East Coast",
                        uri: "/gdc/md/ux8xk21n3al4qr1akoz7j6xkl5dt1dqj/obj/1023/elements?id=1225",
                    },
                },
                a_1027: {
                    attributeHeaderItem: {
                        name: "Direct Sales",
                        uri: "/gdc/md/ux8xk21n3al4qr1akoz7j6xkl5dt1dqj/obj/1026/elements?id=1226",
                    },
                },
                a_1094: { totalHeaderItem: { name: "nat", type: "nat" } },
                a_64727: {
                    attributeHeaderItem: {
                        name: "Exclude",
                        uri: "/gdc/md/ux8xk21n3al4qr1akoz7j6xkl5dt1dqj/obj/64726/elements?id=966650",
                    },
                },
            },
            subtotalStyle: "even",
            type: "rowSubtotal",
            m_0: "40500",
            m_1: "41142",
        });
    });
});
