// (C) 2021-2026 GoodData Corporation

export const content = `# Filtering with the HAVING Clause
Using the HAVING filter enables you to apply filtration to a metric
after all containing metrics and aggregation functions have been
computed.

In MAQL, the WHERE clause is used to perform basic filtration on your
data before it has been aggregated. In some cases, you may want to
filter your metric data after it has been aggregated, so that you can
make conditional evaluations based on the results of the computations
within the metric.

HAVING clause filtration is applied after all other conditions of the
metric have been resolved.

You cannot apply the HAVING keyword in a metric that contains a
WHERE clause.

## Syntax

\`\`\`
SELECT ... HAVING ...
\`\`\`

If your metric contains multiple keywords, they must be listed in alphabetical order:

\`\`\`
SELECT (...) (BY ...) (FOR ...) (WHERE...|HAVING ...) (WITH PF|WITHOUT PF)
\`\`\`

### Restrictions

Suppose you have created a metric containing the following: 

\`\`\`
SELECT SUM({fact/sales}) BY {label/date.quarter}, {attribute/product_id} HAVING {label/region} = "West"
\`\`\`

However, since there is no direct relationship between Quarter and
Region or between Product and Region, the HAVING clause conditions are
ignored.

However, if the HAVING clause included Quarter, Year, Product, or
Product Category, then the filter would be applied.

A HAVING filter is only applied if the data model supports its
evaluation.

## Examples

\`\`\`
SELECT SUM({fact/sales}) BY {label/date.quarter}, {attribute/product_id} HAVING {label/region} = "West"
\`\`\`

\`\`\`
SELECT SUM({fact/amount}) BY {attribute/region}, {label/date.quarter} HAVING {label/date.year} = "2014"
\`\`\`

\`\`\`
SELECT SUM({fact/amount}) BY {label/date.quarter} FOR PREVIOUS({label/date.quarter}) HAVING {label/date.quarter} = "2014" WITHOUT PARENT FILTER
\`\`\`

The last MAQL statement above returns values for amount for the quarter
before this one, displaying only results from 2014. No parent filters
are applied.`;
