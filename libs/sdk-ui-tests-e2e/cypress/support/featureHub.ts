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
        body: {
            data: [],
        },
    });
});
