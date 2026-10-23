// (C) 2021-2026 GoodData Corporation

export const content = `# EXP
The exponential function EXP returns *e* raised to the power of a number
(e.g., Annual rate).

As the inverse of the LN(*n*) function, EXP(*n*) returns the value of
the constant e, 2.71828182845904, raised to the power of the positive
real number, n.

EXP( ) takes as arguments any numeric data, including metrics, metrics
expressions, and constants.

## Syntax

\`\`\`
EXP(…)
EXP(number)
\`\`\`

## Examples

\`\`\`
SELECT EXP(10)
SELECT EXP(1/12)
SELECT EXP(1.5)
SELECT EXP(SUM({fact/amount}))
\`\`\``;
