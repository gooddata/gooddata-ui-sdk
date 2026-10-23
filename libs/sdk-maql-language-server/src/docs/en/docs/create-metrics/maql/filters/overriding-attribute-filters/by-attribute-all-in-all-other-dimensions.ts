// (C) 2021-2026 GoodData Corporation

export const content = `# BY attribute ALL IN ALL OTHER DIMENSIONS
The first part of this keyword serves a similar role as the BY
statement, defining an aggregation floor at the granularity level of the
specified attribute. But the keyword also overrides all attributes in
all other dimensions - keeping them from having any effect on the
metric.

ALL IN ALL OTHER DIMENSIONS can be abbreviated as \"All Other.\"

## Syntax

\`\`\`
SELECT … BY … ALL IN ALL OTHER DIMENSIONS
SELECT metric BY attribute ALL IN ALL OTHER DIMENSIONS
\`\`\`

## Examples

\`\`\`
SELECT SUM(metric/resolution_time) BY {label/date.quarter} ALL IN ALL OTHER DIMENSIONS
\`\`\``;
