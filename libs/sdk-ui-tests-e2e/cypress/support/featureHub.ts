// (C) 2021-2025 GoodData Corporation

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
                    {
                        id: "d154cf37-9ffe-4cae-b892-123678340327",
                        key: "enableWidgetIdentifiersRollout",
                        l: false,
                        version: 42,
                        type: "BOOLEAN",
                        value: true,
                        strategies: [],
                    },
                    {
                        id: "3d6febf7-430f-44df-a537-2436e2e07520",
                        key: "enableDateFilterIdentifiersRollout",
                        l: false,
                        type: "BOOLEAN",
                        value: true,
                        version: 2,
                    },
                    {
                        id: "64b7b92c-6721-461d-a8fb-52664f6ef219",
                        key: "enableNewExecutorFlow",
                        l: false,
                        version: 4,
                        type: "BOOLEAN",
                        value: true,
                    },
                    {
                        id: "e5f9bdd6-4f89-46be-84af-37f59548b33b",
                        key: "enableExecutionCancelling",
                        l: false,
                        version: 2,
                        type: "BOOLEAN",
                        value: true,
                        v: "0d2K",
                    },
                    {
                        id: "3e4f903c-604a-4980-9e65-8cdce9bdb371",
                        key: "enableAttributeFilterVirtualised",
                        l: false,
                        version: 3,
                        type: "BOOLEAN",
                        value: true,
                    },
                ],
            },
        ],
    });
});
