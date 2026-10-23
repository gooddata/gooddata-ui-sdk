// (C) 2021-2026 GoodData Corporation

export const content = `# BY ALL
The BY ALL keyword is used to override a specified attribute dimension.

For example, \`Date/Year(Lead Created)\`, \`Month/Year(Lead Created)\`, \`Quarter/Year
Lead Created)\` all represent attributes of varying granularity within the
same dimension. This effectively prohibits any attribute of that
dimension from breaking down the metric at hand.

## Syntax

\`\`\`
SELECT … BY ALL …
SELECT metric BY ALL attribute
SELECT metric BY ALL attribute1, ALL attribute2
\`\`\`

## Examples

\`\`\`
SELECT {metric/payment} BY ALL {label/date.quarter}
SELECT {metric/payment} / (SELECT {metric/payment} BY ALL {label/date.quarter})
SELECT {metric/payment} / (SELECT {metric/payment} BY ALL {label/date.quarter}, ALL {attribute/industry})
\`\`\`

In the example below, the number of leads is broken down by quarter in
column 3. But in column 4, the BY keyword has been used to set an
aggregation floor at the Year level, returning annual lead values for
2012 and 2013. Compare these values to those in the final column which
displays values of a metric: \`#Leads BY ALL Year\`.

These values represent the total number of leads across all time - the sum of all leads
recorded in the entire data set.

![The BY ALL Year clause serves to override all attributes from the attribute dimension to which Year belongs.](https://www.gooddata.com/developers/cloud-native/doc/maql/by-all-leads.png)

Also of interest in the example above is how the \`#Leads BY ALL DATE\`, \`#LEADS BY ALL MONTH\`, and \`#LEADS BY ALL YEAR\` metrics all return
identical values. This demonstrates that the granularity of the
attribute added to the BY ALL clause does not affect the values that are
returned. The attribute that follows BY ALL simply dictates that the
dimension to which it belongs should not be able to break down the
metric at hand. For this reason, even if the precise granularity of the
attribute used in the BY ALL clause doesn't matter, an attribute must
always be specified as a way of defining the dimension of interest.

As the BY ALL YEAR metric from the final column of the table above
shows, BY ALL overrides other date attributes in the visualization - keeping
them from affecting metric values in the final column. But this does not
mean those metric values are immune to being broken down by non-date
attributes as well. In the example below, note how the \`#Leads BY ALL
Year\` metric values **can** be broken down by an *Industry* attribute even
if they are not affected by date attributes. (\`#Leads BY ALL Year\` values
for each industry are aggregated across all time. Notice how the
industry figures are identical between Q4/2012 and Q1/2012.)

BY ALL YEAR only overrides the Year attribute. The metric can still be broken down by other visualization attributes like Industry.

![The BY ALL Year clause doesn't prevent slicing by other attributes](https://www.gooddata.com/developers/cloud-native/doc/maql/by-all-leads-industry.jpg)

In the example above, we could also add ALL Industry to the end of our
\`#Leads BY ALL Year\` metric syntax to override both the date attribute
and industry attribute dimensions.

![Both Year and Industry are overridden, so the metric is not broken down.](https://www.gooddata.com/developers/cloud-native/doc/maql/by-all-overridden.jpg)`;
