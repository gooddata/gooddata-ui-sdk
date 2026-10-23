// (C) 2021-2026 GoodData Corporation

export const content = `# TOP or BOTTOM(n) IN
WHERE TOP|BOTTOM IN is a ranking filter. It limits the inputs into a
metric's computations to those values that are the top or bottom *n*
rankings according to the ranking criteria that you specify. This filter
supports the percent parameters *n%*.

When you are using filters with a percentage (such as \`TOP(20%)\`), the
number of the selected items is always rounded **up**.

For example, you want to select 20% of 21 items, and each item has a
distinct value of the metric that it is ranked by. The result is going
to be 5, because 20% of 21 is 4.2, and it gets rounded up to 5.

## Syntax

\`\`\`
SELECT … WHERE TOP(…) IN … WITHIN …
SELECT metric1 WHERE TOP(n) IN (SELECT metric2 BY attribute1, attribute2...) WITHIN (...)
\`\`\`

Here, \`metric1\` represents the metric the value of which is actually returned.
The value returned depends on which values are included in its
computations. These inputs are determined by the filtering criteria
statement that follows the IN keyword in parentheses.

The attributes that follow BY are those that will be ranked according to their \`metric2\` values. Whichever attribute values are associated with
\`metric2\` values that fall in the TOP(n) or BOTTOM(n) are then included
in \`metric1\` computations - determining the final output.

The syntax for this type of rank filtering requires the SELECT keyword
before the metric following the IN keyword.

## Examples

\`\`\`
SELECT {metric/no_of_tickets} WHERE TOP(5) IN (SELECT {metric/no_of_tickets} 2 BY {attribute/assignee}) WITHIN ({attribute/ticket_group}, all other)
\`\`\`

This example returns TOP(#) assignees by EACH group. 

\`\`\`
SELECT {metric/Amount} WHERE TOP(5) IN (SELECT {metric/avg_won} BY {attribute/product})
\`\`\`

MAQL also supports using the OF keyword following the TOP|BOTTOM ranking
filter. This changes the way the metric is interpreted by the query
engine. With OF you can carry out rankings by more than one metric.
Likewise, the ranking metric is interpreted as a submetric, rather than
a subreport (as is the case for TOP|BOTTOM in conjunction with the IN
keyword).

See also [TOP or BOTTOM(n) OF](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/ranking/where-top-or-bottom-of/).`;
