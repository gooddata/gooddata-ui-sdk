// (C) 2021-2026 GoodData Corporation

export const content = `# CEILING
The CEILING function rounds an input value to the nearest integer that
is greater than it.

## Syntax

\`\`\`
SELECT CEILING(…)
CEILING(constant)
CEILING(fact)
CEILING(metric)
CEILING(metric_expression)
\`\`\`

## Examples

\`\`\`
SELECT CEILING(12.2) = 13
SELECT CEILING(12.7) = 13
\`\`\``;
