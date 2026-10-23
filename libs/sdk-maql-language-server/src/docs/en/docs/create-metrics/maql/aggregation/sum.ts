// (C) 2021-2026 GoodData Corporation

export const content = `# SUM
The SUM function returns a sum of all numbers in the set (e.g., Salary
Paid).

## Syntax

\`\`\`
SELECT SUM(…)
SELECT SUM(fact)
\`\`\`

## Examples

The metric defined by the SUM of the *Sales* fact would be computed by
adding revenue earned from all individual sales transactions: 

\`\`\`
SELECT SUM({fact/sales})
\`\`\``;
