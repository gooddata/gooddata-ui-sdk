// (C) 2021-2026 GoodData Corporation

export const content = `# Functions For Referring to Past Time Periods
The following MAQL functions allow you to create metrics showing a time
over time comparison (for example, month over month, or quarter over
quarter) of past time periods:

-   [FOR Previous](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/time/for-previous/)
-   [FOR PreviousPeriod](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/time/for-previous-period/)

## Differences Between FOR Previous and FOR PreviousPeriod

The difference between the Previous( ) and PreviousPeriod( ) functions
becomes clear when the date attribute in a visualization is more granular than the
date attribute specified within the function's parentheses.

FOR Previous( ) strictly follows the date attribute specified by the
metric author within the parentheses of the function.

On the other hand, FOR PreviousPeriod( ) adapts to the context of the
visualization. Regardless of the date attribute specified by the metric, the PreviousPeriod( ) function takes on the date attribute of the smallest granularity in the visualization.

In the following example, even though the metric in the final column has
been defined as \`FOR PreviousPeriod(quarter)\`, the function returns
values from the previous *month*, as month is the most granular date
attribute in this visualization.

The Previous( ) function strictly follows the date attribute specified within the function's parentheses. PreviousPeriod ( ) takes on the most granular date attribute that is contained within the visualization.

![PreviousPeriod](https://www.gooddata.com/developers/cloud-native/doc/maql/for-previous-period.png)

Even if PreviousPeriod( ) automatically takes on the granularity of the
smallest date attribute in a visualization, it is still important to specify a
date attribute within the PreviousPeriod( ) function as a way of
specifying the date dimension of interest. This is because workspaces
often have multiple date dimensions, such as Date(Lead Created),
Date(MQL Qualified), or Date(Snapshot).`;
