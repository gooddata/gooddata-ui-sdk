// (C) 2021-2026 GoodData Corporation

export const content = `# OR
OR logical operator works in the following way:

-   If either expression is true, then the result is true.
-   If both expressions are false, then the result is false.

## Examples

In the following example, all metric values associated with the years 2006 and 2005 will be returned.

\`\`\`
SELECT {metric/payment} WHERE {label/date_ordered.year} = "2006" OR {label/date_ordered.year} = "2005"
\`\`\`

\`OR\` can also be used to combine two different types of filters. Consider
the case where you want to return the total of all payments from the
year 2006 and the first four months of 2007:

\`\`\`
SELECT SUM({metric/payment}) WHERE {label/date_ordered.year} = "2006" OR {label/date_ordered.month} IN ("2007-01", "2007-02", "2007-03", "2007-04")
\`\`\``;
