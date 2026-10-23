// (C) 2021-2026 GoodData Corporation

export const content = `# ABS
The absolute value function (ABS) returns an absolute value of a number
(e.g., Revenue) as a positive number:

-   positive inputs will remain unchanged
-   negative inputs will be rendered positive

## Syntax

\`\`\`
SELECT ABS(…)
SELECT ABS(number)
SELECT ABS(metric)
\`\`\`

## Examples

\`\`\`
SELECT ABS(-5) returns the value "5"
SELECT ABS(10) returns the value "10"
SELECT ABS(({metric/total_amount})-(SELECT {metric/total_amount} WITHOUT PF))
\`\`\``;
