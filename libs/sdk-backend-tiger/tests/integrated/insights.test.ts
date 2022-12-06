// (C) 2022 GoodData Corporation

import { testBackend, testWorkspace } from "./backend";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger insights", () => {
    it("should load insights", async () => {
        const result = await backend.workspace(testWorkspace()).insights().getInsights();

        expect(JSON.parse(JSON.stringify(result))).toMatchSnapshot({
            allItems: [
                {
                    insight: {
                        uri: expect.any(String),
                    },
                },
            ],
            items: [
                {
                    insight: {
                        uri: expect.any(String),
                    },
                },
            ],
        });
    });

    it("should load empty insights for out-of-range page", async () => {
        const result = await backend.workspace(testWorkspace()).insights().getInsights();
        const page = await result.goTo(4);
        expect(JSON.parse(JSON.stringify(page))).toMatchSnapshot({
            allItems: [
                {
                    insight: {
                        uri: expect.any(String),
                    },
                },
            ],
        });
    });
});
