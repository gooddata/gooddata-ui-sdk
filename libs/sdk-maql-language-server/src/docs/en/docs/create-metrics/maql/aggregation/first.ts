// (C) 2021-2026 GoodData Corporation

export const content = `# FIRST_VALUE
The \`FIRST_VALUE\` function returns the first value of a sequence. 

The function is typically used to determine the first value of semi-additive fact when used together with sum aggregation.


## Syntax

\`\`\`
SELECT FIRST_VALUE({numeric})
      ORDER BY {attribute/label} [ASC|DESC]
      [WITHIN (... | CURRENT)]

\`\`\`

The argument of the function is a metric or a subselect defining an aggregation.

> If you use facts, make sure that the fact has only a single value defined for each \`ORDER BY\` attribute.

The sequence is determined by the attribute in \`ORDER BY\`. The metric is broken down by the given attribute and the results are displayed in the ascending order by default.

> To show the result in the descending order, use the DESC directive.
>
> \`NULL\` values are considered as the smallest values.

If the metric is broken down by other attributes, these attributes define a partition in which the first value is being determined. 

Use the \`WITHIN\` keyword to avoid this behavior and use the common first value for all the values of the given attributes.

## Examples

The first value of a sum of semi-additive snapshots from a dataset with daily snapshots. 

Example of such a semi-additive snapshot can be **account balance** (values of multiple accounts can be summed up but not their daily snapshots).

\`\`\`
SELECT FIRST_VALUE(SUM({fact/snapshot_value})) ORDER BY {attribute/date.day}
\`\`\`

For a more complex example, see also [LAST_VALUE](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/aggregation/last/).`;
