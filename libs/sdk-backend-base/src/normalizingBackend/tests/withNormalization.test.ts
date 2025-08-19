// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { NoDataError } from "@gooddata/sdk-backend-spi";
import { IAutomationAlertExecutionDefinition } from "@gooddata/sdk-model";

import { dummyBackend, dummyBackendEmptyData } from "../../dummyBackend/index.js";
import { withNormalization } from "../index.js";

describe("withNormalization", () => {
    const measures = [
        ReferenceMd.Won,
        ReferenceMd.Amount,
        ReferenceMdExt.WonPopClosedYear,
        ReferenceMdExt.WonPreviousPeriod,
        ReferenceMdExt.AmountWithRatio,
        ReferenceMdExt.MaxAmount,
        ReferenceMdExt.CalculatedLost,
    ];

    const attributes = [ReferenceMd.Region.Default, ReferenceMd.Product.Name];

    it("should keep transparency of exec definition", async () => {
        const backend = withNormalization(dummyBackendEmptyData());

        const result = await backend
            .workspace("testWorkspace")
            .execution()
            .forItems([...attributes, ...measures])
            .execute();

        expect(result.definition.attributes).toEqual(attributes);
        expect(result.definition.measures).toEqual(measures);
    });

    it("should keep transparency of exec definition in case of no data error (RAIL-3232)", async () => {
        const backend = withNormalization(
            dummyBackend({
                // make sure the dataView is passed to the NoDataError
                raiseNoDataExceptions: "with-data-view",
            }),
        );

        const result = await backend
            .workspace("testWorkspace")
            .execution()
            .forItems([...attributes, ...measures])
            .execute();

        try {
            await result.readAll();
        } catch (err) {
            const typedError = err as NoDataError;
            expect(typedError.dataView?.definition.attributes).toEqual(attributes);
            expect(typedError.dataView?.definition.measures).toEqual(measures);
        }
    });

    it("should normalize also attributes locals ids in filters", async () => {
        const AlertExecution: IAutomationAlertExecutionDefinition = {
            attributes: [
                {
                    attribute: {
                        localIdentifier: "5050b198945940d989c6ec1dc5d41cb0",
                        displayForm: {
                            identifier: "cross_border_ind",
                            type: "displayForm",
                        },
                        showAllValues: false,
                    },
                },
            ],
            measures: [
                {
                    measure: {
                        localIdentifier: "dfa7419de85a48cab8a203960a84e766",
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: "gross_fraud_rate",
                                    type: "measure",
                                },
                                filters: [],
                                computeRatio: false,
                            },
                        },
                    },
                },
            ],
            auxMeasures: [],
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: {
                            identifier: "DW_PROCESS_MONTH_END_DATE",
                            type: "dataSet",
                        },
                        from: -15,
                        to: -1,
                        granularity: "GDC.time.month",
                    },
                },
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            localIdentifier: "5050b198945940d989c6ec1dc5d41cb0",
                        },
                        in: {
                            values: ["Domestic"],
                        },
                    },
                },
            ],
        };

        let normalized;
        const backend = withNormalization(
            dummyBackend({
                // make sure the dataView is passed to the NoDataError
                raiseNoDataExceptions: "with-data-view",
            }),
            {
                normalizationStatus: (s) => {
                    normalized = s.normalized;
                },
            },
        );

        const query = backend
            .workspace("testWorkspace")
            .execution()
            .forItems([...AlertExecution.attributes, ...AlertExecution.measures], AlertExecution.filters);

        const r = await query.execute();
        expect(r).toBeDefined();
        expect(normalized).toMatchSnapshot();
        expect(r.definition).toMatchSnapshot();
    });
});
