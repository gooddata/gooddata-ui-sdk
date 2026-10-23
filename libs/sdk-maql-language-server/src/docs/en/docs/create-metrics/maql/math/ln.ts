// (C) 2021-2026 GoodData Corporation

export const content = `# LN
The LN function returns the natural logarithm of a number with base e,
the constant equal to 2.71828182845904. The LN function returns NULL if
number is less than or equal to 0.

The LN function has the following format:

\`\`\`
LN(n)
\`\`\`

-   where *n* is greater than 0

A natural logarithm LN(n) is the inverse of the EXP( ) function and
takes as arguments any numeric data, including metrics, metrics
expressions, and constants.

## Syntax

\`\`\`
 SELECT LN(…)
SELECT LN(number)
\`\`\`

## Examples

\`\`\`
SELECT LN(10)
SELECT LN(1/12)
SELECT LN(1.5)
SELECT LN(SUM({fact/amount}))
\`\`\``;
