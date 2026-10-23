// (C) 2021-2026 GoodData Corporation

export const content = `# LAST_VALUE
The \`LAST_VALUE\` function returns the last value of a sequence. 

The function is typically used to determine the last value of semi-additive fact when used together with sum aggregation.

## Syntax

\`\`\`
SELECT LAST_VALUE({numeric})
      ORDER BY {attribute/label} [ASC|DESC]
      [WITHIN (... | CURRENT)]

\`\`\`

The argument of the function is a metric or a subselect defining an aggregation.

> If you use facts, make sure that the fact has only a single value defined for each \`ORDER BY\` attribute.

The sequence is determined by the attribute in \`ORDER BY\`. The metric is broken down by the given attribute and the results are displayed in the ascending order by default.

> To show the result in the descending order, use the DESC directive.
>
> \`NULL\` values are considered as the smallest values.

If the metric is broken down by other attributes, these attributes define a partition in which the last value is being determined. 

Use the \`WITHIN\` keyword to avoid this behavior and use the common last value for all the values of the given attributes.

> See also [FIRST_VALUE](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/aggregation/first/) for additional information.

## Examples

The last value of a sum of semi-additive snapshots from a dataset with daily snapshots. 

Example of such a semi-additive snapshot can be **account balance** (values of multiple accounts can be summed up but not their daily snapshots).

\`\`\`
SELECT LAST_VALUE(SUM({fact/snapshot_value})) ORDER BY {attribute/date.day}
\`\`\`

To show how much your account balance has grown since the beginning of the year, you can use the following metrics and syntax:

| Metric | Syntax |
| --- | --- |
| last_day_value | \`SELECT LAST_VALUE(SUM({fact/snapshot_value})) ORDER BY {attribute/date.day}\` |
| first_day_value_in_year | \`SELECT FIRST_VALUE(SUM({fact/snapshot_value})) ORDER BY {attribute/date.day} WITHIN ({attribute/date.year})\` |
| growth_to_date | \`SELECT {metric/last_day_value}/{metric/first_day_value_in_year}-1\` |

</br>
The result may look as follows:

| Date - Month/Year| last_day_value | first_day_value_in_year | growth_to_date |
| --- | --- | --- | --- |
|2022-01|1,000|1,000|0%|
|2022-02|2,000|1,000|+100%|
|2022-03|3,000|1,000|+200%|
|2022-04|4,000|1,000|+300%|
|2022-05|5,000|1,000|+400%|
|2022-06|6,000|1,000|+500%|
|2022-07|7,000|1,000|+600%|
|2022-08|8,000|1,000|+700%|
|2022-09|9,000|1,000|+800%|
|2022-10|10,000|1,000|+900%|
|2022-11|11,000|1,000|+1000%|
|2022-12|12,000|1,000|+1100%|
|2023-01|13,000|12,000|+8.3%|
|2023-02|14,000|12,000|+16.7%|
|2023-03|15,000|12,000|+25%|`;
