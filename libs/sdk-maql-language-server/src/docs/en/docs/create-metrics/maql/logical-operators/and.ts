// (C) 2021-2026 GoodData Corporation

export const content = `# AND
AND logical operator works in the following way:

-   If both expressions are true (e.g. not FALSE and not NULL), then the
    result is true.
-   In all other cases, the result is false.

If you combine filters using AND, both filters are applied when
computing the metric.

## Examples:

\`\`\`
SELECT {metric/payment} WHERE {label/date.year} = "2006" AND {label/date.month} = "5"
\`\`\`

While OR combines filters in a way that allows more data to pass through
visualization computations, AND restricts, or limits, the amount of data that
is used in computations.

Consider the case where our metric has a filter that serves to include
all data from 2006 as well as data from the first four months of 2007.
Adding an additional AND clause onto the metric definition limits the
data that is used in the metric's computations because now there are
more conditions than before that data must meet in order to be included in computations.

In the following example, payments must come from 2006 or the first four
months of 2007 to be included in metric computations. They must also be
greater than $10,000.

\`\`\`
SELECT SUM({metric/payment}) WHERE ({label/date.year} = "2006" OR {label/date.month} IN ("2007-01", "2007-02", "2007-03", "2007-04")) AND {metric/payment} > 10000
\`\`\`

Payment values that come from 2006 or the first four months of 2007 but
are less than 10,000 will be excluded.`;
