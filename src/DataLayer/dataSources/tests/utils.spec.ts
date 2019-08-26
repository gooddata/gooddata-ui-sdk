// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { DataSource } from "../DataSource";
import { dataSourcesMatch } from "../utils";

describe("dataSource utils", () => {
    describe("dataSourcesMatch", () => {
        const noop = () => Promise.resolve({});
        const firstAfm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: "m0",
                    definition: {
                        measure: {
                            item: {
                                identifier: "metric000",
                            },
                        },
                    },
                },
            ],
        };
        const secondAfm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: {
                                identifier: "metric001",
                            },
                        },
                    },
                },
            ],
        };

        it("dataSources should match if they have identical fingerprint", () => {
            const first = new DataSource(noop, firstAfm);
            const second = new DataSource(noop, firstAfm);

            expect(dataSourcesMatch(first, second)).toBe(true);
        });

        it("dataSources should not match if their fingerprints differ", () => {
            const first = new DataSource(noop, firstAfm);
            const second = new DataSource(noop, secondAfm);

            expect(dataSourcesMatch(first, second)).toBe(false);
        });

        it("dataSources should not match if one of them is missing", () => {
            const first = new DataSource(noop, firstAfm);

            expect(dataSourcesMatch(first, undefined)).toBe(false);
        });
    });
});
