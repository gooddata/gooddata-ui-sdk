// (C) 2021-2026 GoodData Corporation

export const content = `# FOR PreviousPeriod
The FOR PreviousPeriod function is similar to FOR Previous functions
unless the adaptable functions adapt to the context of the visualization by
hand.

Even though the metric is defined as FOR PreviousPeriod({attribute/quarter}),
for example, the function returns values from the previous month, as
month is the most granular date attribute in this visualization.

## Syntax

\`\`\`
SELECT … FOR PreviousPeriod(…,…)
SELECT metric FOR PreviousPeriod(time_attribute)
\`\`\`

## Examples

\`\`\`
SELECT {metric/payment} FOR PreviousPeriod({attribute/quarter})
SELECT {metric/payment} FOR PreviousPeriod({attribute/quarter}, 2)
\`\`\`

For differences between FOR Previous and FOR PreviousPeriod,
see [Functions For Referring to Past Time Periods](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/time/functions-for-referring-to-past-time-periods/).`;
