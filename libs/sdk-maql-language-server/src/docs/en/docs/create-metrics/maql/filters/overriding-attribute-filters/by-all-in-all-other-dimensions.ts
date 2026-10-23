// (C) 2021-2026 GoodData Corporation

export const content = `# BY ALL IN ALL OTHER DIMENSIONS
This clause overrides all attributes - keeping the metric from being
broken down at all. As a result, the associated metric will remain
aggregated at the highest possible level of aggregation across all
dimensions.

ALL IN ALL OTHER DIMENSIONS can be abbreviated as \"ALL OTHER\".

## Syntax

\`\`\`
SELECT ... BY ALL IN ALL OTHER DIMENSIONS
SELECT metric BY ALL IN ALL OTHER DIMENSIONS
\`\`\`

## Examples

\`\`\`
SELECT {metric/payment} BY ALL IN ALL OTHER DIMENSIONS
SELECT {metric/payment} / (SELECT {metric/payment} BY ALL IN ALL OTHER DIMENSIONS)
\`\`\`

The second example above could be useful in a visualization that breaks data
down with a Month attribute. The above metric would show the percent
share of each month's payments relative to the sum of all payments
across all time and all other dimensions.`;
