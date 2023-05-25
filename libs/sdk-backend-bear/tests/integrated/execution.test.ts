// (C) 2020 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { IBucket } from "@gooddata/sdk-model";

import { testBackend, testWorkspace } from "./backend";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("bear execution", () => {
    it("should execute with totals in attribute bucket", async () => {
        const buckets: IBucket[] = [
            {
                localIdentifier: "measures",
                items: [ReferenceMd.Amount],
            },
            {
                localIdentifier: "attribute",
                items: [ReferenceMd.Department],
                totals: [
                    {
                        type: "sum",
                        measureIdentifier: ReferenceMd.Amount.measure.localIdentifier,
                        attributeIdentifier: ReferenceMd.Department.attribute.localIdentifier,
                    },
                ],
            },
            {
                localIdentifier: "columns",
                items: [],
            },
        ];
        const result = await backend.workspace(testWorkspace()).execution().forBuckets(buckets);

        expect(result).toMatchSnapshot();
    });

    it("should execute with totals in columns bucket", async () => {
        const buckets: IBucket[] = [
            {
                localIdentifier: "measures",
                items: [ReferenceMd.Amount],
            },
            {
                localIdentifier: "attribute",
                items: [],
            },
            {
                localIdentifier: "columns",
                items: [ReferenceMd.Department],
                totals: [
                    {
                        type: "sum",
                        measureIdentifier: ReferenceMd.Amount.measure.localIdentifier,
                        attributeIdentifier: ReferenceMd.Department.attribute.localIdentifier,
                    },
                ],
            },
        ];
        const result = await backend.workspace(testWorkspace()).execution().forBuckets(buckets);

        expect(result).toMatchSnapshot();
    });
});
