// (C) 2021-2026 GoodData Corporation

export const content = `# WITHIN Clause
You can add variations of the WITHIN clause to any supported [Rank Variations](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/ranking/rank-variations/). This syntax lets you rank
values within subgroups defined by a visualization's attribute values.
Subgroup ranking is useful, for example, if you want to rank the top
sales reps (in terms of amount won) within each sales region.

## Ranking functions without WITHIN

When you use a ranking function without an accompanying WITHIN clause
(for example, \`SELECT RANK({metric/avg_won})\`), the function sequentially ranks
all metric values across the rows in a visualization. The output is identical
to \`RANK(...) WITHIN(ALL IN ALL OTHER DIMENSIONS)\`, as displayed below.

\`\`\`
SELECT RANK ({metric/amount_won})
\`\`\`

![RANK without the WITHIN clause](https://www.gooddata.com/developers/cloud-native/doc/maql/rank-without-within.png)

## Ranking functions with WITHIN

When you use ranking functions with an accompanying WITHIN clause, any
number of parameter formulations are possible, resulting in different
outputs.

\`\`\`
WITHIN (attribute1, attribute2, ...)
\`\`\`

Ranks metric values within one or more subgroups defined by the
insight\'s attributes.

\`\`\`
SELECT RANK ({metric/{amount_won}) DESC WITHIN ({attribute/vertical}, {attribute/region})
\`\`\`

![WITHIN (Region,Vertical)](https://www.gooddata.com/developers/cloud-native/doc/maql/rank-within.png )

## WITHIN (ALL ATTRIBUTE)

Ranks metric values within one or more subgroups defined by all visualization
attributes **other than** the attribute specified in the metric (and any
other attributes in the same dataset as the attribute specified in the
metric).

If the ranking metric is a stand-alone metric, then it will rank as
described in [Rank Variations](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/ranking/rank-variations/).

\`\`\`
SELECT RANK ({metric/{amount_won}) DESC WITHIN (ALL {attribute/vertical})
\`\`\`

For example, if Vertical, Region, and Sales Rep attributes are included
in the visualization, the above metric ranks metric values sequentially by
Region and Sales Rep, but not by Vertical.


![WITHIN (ALL Vertical)](https://www.gooddata.com/developers/cloud-native/doc/maql/rank-within-all.png )

Notice that if you remove Vertical from the visualization, the
ranking of Amount Won remains the same as before because the WITHIN ALL
clause omits Vertical from the rankings.

Ranking remains the same when the Vertical attribute is removed from the visualization.

![Rank the same](https://www.gooddata.com/developers/cloud-native/doc/maql/rank-the-same.png)


## WITHIN (ALL OTHER EXCEPT ATTRIBUTE)

Ranks metric values within one or more subgroups defined by the
attribute specified in the metric (or any other attributes in the same
dataset as the attribute specified in the metric), but **overrides** all
other visualization attributes.

\`\`\`
SELECT RANK ({metric/{amount_won}) DESC WITHIN (ALL OTHER EXCEPT {attribute/vertical})
\`\`\`

If Vertical and Region attributes are included in the visualization, the above
metric ranks Amount Won sequentially by Vertical, but not by Region.

![WITHIN (ALL Vertical), Vertical removed from the visualization](https://www.gooddata.com/developers/cloud-native/doc/maql/rank-within-removed.png )

## WITHIN (CURRENT)

Ranks metric values within current visualization's dimensionality, as
specified by the visualization's attributes, where every row of the visualization is
handled as a separate group and thus each value is ranked \'1\'. 

\`\`\`
SELECT RANK ({metric/{amount_won}) DESC WITHIN (CURRENT)
\`\`\`

![WITHIN (CURRENT)](https://www.gooddata.com/developers/cloud-native/doc/maql/rank-within-current.png )

An exception to the above would occur if you used WITHIN (CURRENT) with
the PERCENT_RANK function. That combination would return the percentage
of metric values that are less than the current value, which is
necessarily zero in a single-value \"group.\"`;
