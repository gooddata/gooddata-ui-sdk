// (C) 2021-2026 GoodData Corporation

export const content = `# Filtering with the WHERE Clause
After you have aggregated a fact to form the foundations of a metric,
you can use MAQL syntax to add filters to your metric definition.
Filters are optional features that can be used to narrow the set of data
from which a metric is computed. With logical expressions, you can also
combine two or more filters within a single metric definition.

The basic syntax for filters uses the word WHERE to introduce the filter
expression:

\`\`\`
SELECT ... WHERE ...
\`\`\`

This section will explore several types of syntax for customizing metric
filters:

-   Special operators for defining filters
    -   Example:

        \`\`\`
        SELECT {metric/revenue} WHERE {label/date.year} = "2006"
        \`\`\`
-   Time macros for filtering for floating time periods:
    -   Example:

        \`\`\`
        SELECT {metric/payment} WHERE {attribute/date} = THIS – 1
        \`\`\`
-   Logical expressions for combining filters
    -   Example:

        \`\`\`
        SELECT {metric/revenue} WHERE {label/date.year} = "2006" AND {label/date.month} = "5"
        \`\`\``;
