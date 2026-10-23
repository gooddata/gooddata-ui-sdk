// (C) 2021-2026 GoodData Corporation

export const content = `# TOP or BOTTOM(n) OF
Similar to [WHERE TOP or BOTTOM(n) IN](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/ranking/where-top-or-bottom-in/), WHERE TOP or
BOTTOM OF can serve as a filter that limits the values included in the
metric's computations. Using the OF keyword (rather than IN) allows
ranking of more than one metric and interprets the ranking metric as a sub-metric.

This filter supports percent parameters: *n%*.

When you are using filters with a percentage (such as \`TOP(20%)\`), the
number of the selected items is always rounded **up**.

For example, you want to select 20% of 21 items, and each item has a
distinct value of the metric that it is ranked by. The result is going
to be 5, because 20% of 21 is 4.2, and it gets rounded up to 5.

## Syntax

\`\`\`
SELECT … WHERE TOP(…) OF … [WITHIN …]
SELECT  metric1  WHERE [TOP|BOTTOM](n) OF ( metric2 , ...)
SELECT  metric1  WHERE [TOP|BOTTOM](n) OF ( metric2 , ...) WITHIN ( ... )
\`\`\`

## Examples

\`\`\`
SELECT {metric/amount}  WHERE TOP(5%) OF ({metric/Amount}) AND {label/product} = "Explorer"
\`\`\``;
