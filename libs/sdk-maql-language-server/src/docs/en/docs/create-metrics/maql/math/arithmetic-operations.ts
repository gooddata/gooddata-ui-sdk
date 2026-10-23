// (C) 2021-2026 GoodData Corporation

export const content = `# Arithmetic Operations
Predefined metrics can be manipulated with any basic arithmetic
operation: addition (+), subtraction (-), multiplication (*), and
division (/).

By using numerical variables, you can also add dynamic values into your arithmetic operations.

## Adding, Subtracting, Multiplying, and Dividing

Add, subtract, multiply, or divide predefined metrics.

## Syntax

\`\`\`
SELECT metric1 + metric2
SELECT metric1 - metric2
SELECT metric1 * metric2
SELECT metric1 / metric2
\`\`\`

## Examples

\`\`\`
SELECT {metric/expenses} + {metric/salary}
SELECT {metric/revenue} - {metric/cost}
SELECT {metric/profit} * 0.03
SELECT {metric/new_revenue} / {metric/revenue_last_year}
\`\`\``;
