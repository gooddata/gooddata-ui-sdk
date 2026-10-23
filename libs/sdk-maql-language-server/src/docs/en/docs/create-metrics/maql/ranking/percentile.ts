// (C) 2021-2026 GoodData Corporation

export const content = `# PERCENTILE
The PERCENTILE( ) function returns the specified percentile out of a set of values. This could be useful for establishing a threshold of
acceptance, such as for candidates who score above the 90th percentile
on a certification exam, or rewarding sales reps in the top percentile
with regard to deals won in the past year.

**Formats:**

\`\`\`
PERCENTILE(numeric, k)
\`\`\`

-   where *numeric* is a fact or metric
-   where *k* is a value between 0 and 1 representing the percentile you
    want returned specified as a decimal. k accepts constants as inputs.
    Numeric values must be expressed in the following format: 0.xx
-   For metric expressions, you should compute percentiles using syntax
    similar to the following:

    \`\`\`
    SELECT PERCENTILE((SELECT SUM([fact]) BY [attribute]),0.25)
    \`\`\`

    \`\`\`
    PERCENTILE(numeric, k%)
    \`\`\`

-   where *numeric* is a fact or metric
-   where *k%* is a number between 0 and 100 representing the percentile
    you want returned. k accepts constants as inputs, followed by
    percent signs as inputs.
-   For metric expressions, you should compute percentiles using syntax
    similar to the following: 

    \`\`\`
    SELECT PERCENTILE((SELECT SUM([fact]) BY [attribute]),25%)
    \`\`\`

## Syntax

\`\`\`
SELECT PERCENTILE(…) [ASC|DESC] [BY(…)]
SELECT PERCENTILE(metric, decimal)
SELECT PERCENTILE(metric, percentage)
SELECT PERCENTILE(fact, decimal)
SELECT PERCENTILE(fact, percentage)
SELECT PERCENTILE((SELECT SUM([metric]) BY [attribute]), decimal)
SELECT PERCENTILE((SELECT SUM([metric]) BY [attribute]), percentage)
\`\`\`

## Examples

\`\`\`
SELECT PERCENTILE({metric/Amount}, 0.75)
SELECT PERCENTILE({metric/Amount}, 75%)
\`\`\``;
