// (C) 2021-2026 GoodData Corporation

export const content = `# FOR Previous
By default, the FOR Previous function refers to values from one time
period ago. You can customize FOR Previous by adding a second parameter
to the function.

## Syntax

\`\`\`
SELECT … FOR Previous(…,…)
SELECT metric FOR Previous(time_attribute)
SELECT metric FOR Previous(time_attribute, #periods_ago)
\`\`\`

## Examples

\`\`\`
SELECT {metric/revenues} FOR Previous({attribute/quarter})
\`\`\`

You can customize FOR Previous() by adding a second parameter to the function. For
example, you may want to return a revenue value from three quarters ago
(see below).

\`\`\`
SELECT {metric/revenues} FOR Previous({attribute/quarter} , 3)
\`\`\`

For differences between FOR Previous and FOR PreviousPeriod,
see [Functions For Referring to Past Time Periods](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/time/functions-for-referring-to-past-time-periods/).`;
