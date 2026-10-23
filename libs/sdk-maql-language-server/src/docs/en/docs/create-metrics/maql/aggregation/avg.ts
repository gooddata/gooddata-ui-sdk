// (C) 2021-2026 GoodData Corporation

export const content = `# AVG
The AVG function returns the average value of all numbers in the set (e.g., Salary paid). Null values are ignored.

## Syntax

\`\`\`
SELECT AVG(…)
SELECT AVG(fact)
\`\`\`

## Examples

The metric AVG of Payment is computed by adding all payment transactions
together and dividing by the number of payment transactions:

\`\`\`
SELECT AVG({fact/payment})
\`\`\``;
