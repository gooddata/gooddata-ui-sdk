// (C) 2021-2026 GoodData Corporation

export const content = `# Relational Operators
Relational operators can be used with facts, metrics, or date labels to
define filter conditions on a metric.

## Syntax

\`\`\`
SELECT … WHERE … (<|>|=|!=|<>|BETWEEN) …
SELECT metric WHERE fact1 < fact2
SELECT metric WHERE fact1 < number
SELECT metric1 WHERE metric2 > number
SELECT metric WHERE date_label > date_value
SELECT metric WHERE date1_label < date2_label
SELECT metric WHERE attribute = attribute_value
SELECT metric WHERE attribute <> attribute_value
SELECT metric WHERE label IN (label_value1, label_value2)
SELECT metric WHERE label NOT IN (label_value1, label_value2)
SELECT metric WHERE fact BETWEEN number AND number
SELECT metric WHERE date_label BETWEEN date_value1 AND date_value2
SELECT metric WHERE fact NOT BETWEEN number AND metric
SELECT metric WHERE attribute = NULL
SELECT metric WHERE attribute <> NULL
SELECT metric WHERE label IN (label_value1, label_value2, NULL)
SELECT metric WHERE label NOT IN (label_value1, label_value2, NULL)
\`\`\`

## Examples

\`\`\`
SELECT {metric/number of transactions} WHERE {metric/total_amount} > 10000
SELECT {metric/number_of_transactions} WHERE {metric/amount} > 6 AND {metric/amount} <= 20
SELECT {metric/profit} WHERE {label/date_ordered.monthYear} < "2007-05"
SELECT {metric/profit} WHERE {label/date_ordered.year} > "2007"
SELECT {metric/profit} WHERE {label/date_ordered.date} <= "2010-12-22"
SELECT {metric/profit} WHERE {label/date_ordered.week} < {label/date_shipped.week}
SELECT {metric/payment} WHERE {label/country} = "US"
SELECT {metric/payment} WHERE {label/date_ordered.week} = {label/date_shipped.week}
SELECT {metric/payment} WHERE {label/country} <> "US"
SELECT {metric/payment} WHERE {label/region} IN ("America", "EU")
SELECT {metric/payment} WHERE {label/region} NOT IN ("America", "EU")
SELECT {metric/payment} WHERE {label/date.quarter} BETWEEN THIS - 5 AND THIS
SELECT {metric/payment} WHERE {fact/cost} BETWEEN 100 AND 200
SELECT {metric/payment} WHERE {fact/cost} BETWEEN 100 AND {metric/highest_cost}
SELECT {metric/payment} WHERE {label/country} = NULL
SELECT {metric/payment} WHERE {label/country} <> NULL
SELECT {metric/payment} WHERE {label/region} IN ("America", "EU", NULL)
SELECT {metric/payment} WHERE {label/region} NOT IN ("America", "EU", NULL)
\`\`\`
>A comparison of attribute values with NULL using MAQL relational operators translates to semantics of \`\`IS NULL\`\`/ \`\`IS NOT NULL\`\` operators in SQL.`;
