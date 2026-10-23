// (C) 2021-2026 GoodData Corporation

export const content = `Remove parent filters, except for any filters specified as a comma-separated list of attributes.

This clause can be shortened to WITHOUT PF EXCEPT.

In EXCEPT clauses, multiple attributes may be specified as a series of
comma-separated values.

Excepted attribute filters are applied to the specified attribute and to
all attributes of coarser granularity in the hierarchy. For example, in
the hierarchy State-County-City, the values of the attribute City do not
group the values of County, but County groups City because County has coarser granularity than City. So, if City is excepted, County and State
are excepted too. If you apply the exception to the State attribute, it
is the only attribute filter that is excepted.

## Syntax

\`\`\`
SELECT ... WITHOUT PARENT FILTER EXCEPT Attribute1,...
\`\`\`

\`\`\`
SELECT ... WITHOUT PF EXCEPT Attribute1,...
\`\`\`

## Example 1

In the table below, you can see how the WITHOUT PARENT FILTER EXCEPT
keyword works with the State-County-City hierarchy.


| Definition                          | visualization Filter    | Metric Value |
|-------------------------------------|------------------|--------------|
| \`SELECT M1\`                         | (none)           | 1000         |
| \`SELECT M1\`                         |  F1: County = X | 600          |
| \`SELECT M1 WITHOUT PF\`              |  F1: County = X | 1000         |
| \`SELECT M1 WITHOUT PF EXCEPT City\`  |  F1: County = X | 600          |
| \`SELECT M1 WITHOUT PF EXCEPT State\` |  F1: County = X | 1000         |
| \`SELECT M1 WITHOUT PF EXCEPT State\` |  F1: State = Y  | 550          |


-   In the above example in the third row, the WITHOUT PARENT FILTER
    removes all parent filters from the metric, so COUNTY = X is not
    applied. The returned results match the unfiltered version of the
    metric in the first row.
-   In the fourth row, City is excepted. Since County has a coarser grain than City, the parent visualization filter (County = X) is applied.
-   In the fifth row, the excepted filter is State. However, the visualization
    filter is at the County attribute level, which is finer than State.
    Therefore, the filter is not applied, and the results match the
    unfiltered version in the first row.
-   In the fifth row, the excepted filter is State, which matches the
    visualization filter. So, the results are filtered.

## Example 2

In the table below, you can see how the WITHOUT PARENT
FILTER EXCEPT keyword affects the filtered version of the visualization.


| Definition               | Visualization Filter            | Metric Value |
|--------------------------|--------------------------|--------------|
| \`SELECT M1\`              | (none)                   | 500          |
| \`SELECT M1\`              |  F1: Group = X          | 350          |
| \`SELECT M1\`              |  F1: Group =            | 250          |
|                          | X; F2: Priority is Y    |              |
| \`SELECT M1 WITHOUT PARENT FILTER EXCEPT Group\`   |  F1: Group = X; F2: Priority is Y           | 350          |


In the above example in the fourth row, the
WITHOUT PARENT FILTER EXCEPT removes all parent filters from the metric,
except for one: Group, so the Priority filter is not applied to the
metric. The generated metric value equates to the value generated in the
version in the second row.


## Example 3

  |Definition                                                                |  visualization Filter|
  |---------------------------------------------------------------------------|---------------|
  |\`SELECT (SELECT M1 WITHOUT PF EXCEPT Date) WHERE (SELECT M2 BY Date) > Y\`  | Group = X |


-   M2 is filtered by group.
-   M1 is not filtered by group, only by the numeric range filter in the
    \`WHERE\` part.

## Example 4

| Definition                                          | Visualization Filter |
|-----------------------------------------------------|---------------|
| \`SELECT (SELECT M1 WITHOUT PF EXCEPT Date) WHERE (SELECT M2 BY Date) > Y\`    | Group = X  Date = Z   |

-   M2 is filtered by group, date.
-   M1 is filtered by date and the numeric range in the \`WHERE\` part.`;
