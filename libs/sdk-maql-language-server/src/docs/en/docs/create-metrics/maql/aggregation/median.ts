// (C) 2021-2026 GoodData Corporation

export const content = `# MEDIAN
The MEDIAN function counts the statistical median - an order statistic
that gives the middle value of a sample. If the middle falls between two
values, the function returns average of the two middle values. Null
values are ignored.

The MEDIAN function is especially useful in cases where a small set of
outliers could drastically skew the average if calculated as a mean.

## Syntax

\`\`\`
SELECT MEDIAN(…)
MEDIAN(fact)
MEDIAN(metric)
MEDIAN(metric_expression)
\`\`\`

## Examples

\`\`\`
SELECT MEDIAN({fact/cost}) BY ALL OTHER
SELECT MEDIAN({metric/payment}) BY {attribute/customer}
\`\`\``;
