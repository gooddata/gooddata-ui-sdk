// (C) 2021-2026 GoodData Corporation

export const content = `Includes all parent filters, except for any filters specified as a
comma-separated list of attributes.

This clause can be shortened to WITH PF EXCEPT.

In EXCEPT clauses, multiple attributes can be specified as a series of
comma-separated values.

## Example

In the table below, you can see how the WITH PARENT
FILTER EXCEPT keyword affects the filtered version of the visualization.


| Definition               | Visualization Filter            | Metric Value |
|--------------------------|--------------------------|--------------|
| \`SELECT M1\`              | (none)                   | 500          |
| \`SELECT M1\`              | F1: Group = X          | 350          |
| \`SELECT M1\`              | F1: Group = X; F2: Priority is Y           | 250          |
| \`SELECT M1 WITH PARENT FILTER EXCEPT {attribute/priority}\`  | F1: Group = X; F2: Priority is Y      | 350          |

In the above example in the fourth row, the
WITH PARENT FILTER EXCEPT includes all parent filters in the metric,
except for one: Priority. So, in this case, the Priority filter is not
applied to the metric. The generated metric value equates to the value
generated in the version in the second row.

## Syntax

\`\`\`
SELECT ... WITH PARENT FILTER EXCEPT Attribute1,...
\`\`\`

\`\`\`
SELECT ... WITH PF EXCEPT Attribute1,...
\`\`\``;
