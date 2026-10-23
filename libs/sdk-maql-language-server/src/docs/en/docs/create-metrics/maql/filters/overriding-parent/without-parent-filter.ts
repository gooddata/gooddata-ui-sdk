// (C) 2021-2026 GoodData Corporation

export const content = `Removes parent filters from being applied to the metric. All parent
filters specified in visualization, dashboards, and any metrics in which this
metric is nested are ignored.

This clause can be shortened to WITHOUT PF.

**Example**

In the table below, you can see how the WITHOUT PARENT FILTER clause
affects the filtered version of the visualization.


| Definition                        | Visualization Filter   | Metric Value |
|-----------------------------------|-----------------|--------------|
| \`SELECT M1\`                       | (none)          | 500          |
| \`SELECT M1\`                       |  F1: Group = X | 350          |
| \`SELECT M1 WITHOUT PARENT FILTER\` |  F1: Group = X | 500          |


Since the metric in the third row removes the parent filter in the
visualization, the returned value matches the calculation when no visualization filter
is applied in the first row.

## Syntax

\`\`\`
SELECT ... WITHOUT PARENT FILTER
\`\`\`

\`\`\`
SELECT ... WITHOUT PF
\`\`\``;
