// (C) 2021-2026 GoodData Corporation

export const content = `# SQRT
The square root function (SQRT) returns a square root of a number (e.g.,
Revenue). If the number is negative, SQRT returns NULL.

## Syntax

\`\`\`
SELECT SQRT(…)
SELECT SQRT(constant)
SELECT SQRT(metric)
\`\`\`

## Examples

\`\`\`
SELECT SQRT(25)
\`\`\`

returns the value \"5\"

\`\`\`
SELECT SQRT(33.6)
\`\`\`

returns the value \"5.796550698\"

\`\`\`
SELECT SQRT(SELECT SUM({fact/sales}))
\`\`\`

returns the square root of a Total Sales metric.`;
