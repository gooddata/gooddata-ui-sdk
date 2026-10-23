// (C) 2021-2026 GoodData Corporation

export const content = `# BY ALL IN ALL OTHER DIMENSIONS EXCEPT FOR attribute
This keyword clause overrides all attributes except for those attributes
within the dimension of the attribute that is specified.

ALL IN ALL OTHER DIMENSIONS can be abbreviated as \"All Other.\"

## Syntax

\`\`\`
SELECT … BY ALL IN ALL OTHER DIMENSIONS EXCEPT FOR…
SELECT metric BY ALL IN ALL OTHER DIMENSIONS EXCEPT FOR attribute
\`\`\`

## Examples

\`\`\`
SELECT {metric/payment} BY ALL IN ALL OTHER DIMENSIONS EXCEPT FOR {attribute/date_opportunity_closed})
\`\`\`

In this example, Payment could be broken down by any date in the Date(Opportunity Closed) date dimension, such as \`Month/Year(Opportunity Closed)\`, \`Quarter/Year(Opportunity Closed)\`, or \`Year(Opportunity Closed)\`.`;
