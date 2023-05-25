// (C) 2021-2022 GoodData Corporation

/**
 * Mocking FeatureHub request to remove dependency on it
 * NOTE: UI SDK plan to use FeatureHub SDK after we upgrade version of typescript
 * - more info in ticket RAIL-4279
 * Once rewritten, check if this stub still works
 */
beforeEach(() => {
    cy.intercept("GET", "/features*", {
        statusCode: 200,
        body: [
            {
                id: "d2f33050-c46b-491e-82a1-17daba57a0a8",
                features: [
                    {
                        id: "d154cf37-9ffe-4cae-b892-017ff3429a7c",
                        key: "dashboardEditModeDevRollout",
                        l: false,
                        version: 42,
                        type: "BOOLEAN",
                        value: true,
                        strategies: [],
                    },
                ],
            },
        ],
    });
});
