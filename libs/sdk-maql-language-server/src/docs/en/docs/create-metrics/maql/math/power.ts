// (C) 2021-2026 GoodData Corporation

export const content = `# POWER
The POWER function returns a number raised to the base specified as the
second parameter of the POWER function (e.g., Interest rate, Revenue).
Complex and undefined results are replaced with NULL.

The POWER function has the following format:

\`\`\`
POWER(n, b)
\`\`\`

The base *n* and the exponent *b* accept any numeric data, including
metrics, metric expressions, and constants.

For fractional exponent (b) values, using fractions (for example, 1/2)
rather than decimals (for example, 0.5) improves performance.

## Syntax

\`\`\`
POWER(…,…)
POWER(number, power)
\`\`\`

## Examples

\`\`\`
SELECT POWER(10, 1/12)
SELECT POWER(SUM({fact/amount}), 2)
SELECT POWER(1, SUM({fact/amount}))
SELECT POWER({metric/total_amount} * (1/2), {metric/total_amount})
\`\`\``;
