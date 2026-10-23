// (C) 2021-2026 GoodData Corporation

export const content = `# FOR Next
By default, the FOR Next function refers to values from one time period
in the future. This can be customized by adding a second parameter to
the function.

## Syntax

\`\`\`
SELECT … FOR Next(…,…)
SELECT metric FOR Next(time_attribute)
\`\`\`

## Examples

\`\`\`
SELECT {metric/revenue} FOR Next({attribute/quarter})
\`\`\`

You can customize FOR Next() by adding a second parameter to the
function. For example, you might want to return a payment value from
three quarters in the future with respect to a certain time period (see
below).

\`\`\`
SELECT {metric/payment} FOR Next({attribute/quarter},3)
\`\`\``;
