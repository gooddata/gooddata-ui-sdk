// (C) 2021-2026 GoodData Corporation

export const content = `# LOG
The LOG function returns the logarithm of a number for the given base
specified in second parameter of the LOG function. If the base value is
omitted, base 10 is used.

The LOG function has the following format:

\`\`\`
LOG(n,b)
\`\`\`

-   *n* is any positive value
-   *b* is base, *b* is any positive value other than 0 or 1

## Syntax

\`\`\`
SELECT LOG(…)  
SELECT SQRT(number, base)
\`\`\`

## Examples

\`\`\`
SELECT LOG(10, 1/12)
SELECT LOG(SUM({fact/amount}), 2)
SELECT LOG({metric/amount_max} * 400, {metric/amount_Max})
\`\`\``;
