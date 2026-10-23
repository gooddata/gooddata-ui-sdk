// (C) 2021-2026 GoodData Corporation

export const content = `Applies all parent filters to the metric. All parent filters specified
in visualizations, dashboards, and any metrics in which this metric is nested
are applied to the calculation.

This clause can be shortened to WITH PF.

The WITH PARENT keyword is applied by default when other visualization filters
are not present.

## Example

In the table below, you can see how the WITH PARENT FILTER clause
affects the filtered version of the visualization.


| Definition                        | Visualization Filter   | Metric Value |
|-----------------------------------|-----------------|--------------|
| \`SELECT M1\`                       | (none)          | 500          |
| \`SELECT M1\`                       | F1: Group = X | 350          |
| \`SELECT (SELECT M1 WITH PARENT FILTER) WHERE Group = Y\`            | F1: Group = X | null         |

In the third row above, the definition includes a nested metric in which
parent filters are forced to be included from inside the nested metric.

-   In the parent metric is the filter Group = Y.
-   At the visualization level, the filter is Group = X.
-   The WITH PARENT FILTER keyword means that all parent filters are
    applied to the metric. During evaluation, both Group = X and Group =
    Y are applied to the data as a logical AND. Since a data element may
    be associated with a single attribute value, there are no data
    elements that match both filters, and the result set is null.

## Syntax

\`\`\`
SELECT ... WITH PARENT FILTER
\`\`\`

\`\`\`
SELECT ... WITH PF
\`\`\``;
