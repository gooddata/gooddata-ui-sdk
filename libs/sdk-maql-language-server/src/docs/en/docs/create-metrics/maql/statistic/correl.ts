// (C) 2021-2026 GoodData Corporation

export const content = `# CORREL
Correlation indicates the degree of association between two sets of
values. The CORREL function returns correlation coefficient that varies
between -1 and 1.

-   A value of 1 indicates that as X increases, Y always increases.
-   A value of -1 indicates that as X increases, Y always decreases.
-   A value of 0 indicates that there is no correlation; values for X
    cannot be used as predictors for values of Y.

Correlation coefficient is measured by calculating the covariance of the
two sets of values, which measures how they vary with each other. This
measure is then divided by the product of the standard deviations of
each set of values. See [Covariance Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/covariance-functions/) and [Standard Deviation Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/standard-deviation-functions/).

Correlation coefficient is a component calculation of the Least-Squares
method of linear regression. See [Least-Squares Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/least-squares-functions/).

CORREL function has the form \`CORREL (numeric1,numeric2)\` where
*numeric1* and *numeric2* are facts or metrics.

![Equation - Correlation Coefficient](https://www.gooddata.com/developers/cloud-native/doc/maql/correl.png)

When this equation is broken down into its component parts, it becomes
the following:

![Equation - Correlation Coefficient decomposed](https://www.gooddata.com/developers/cloud-native/doc/maql/correl-coef.png)

For CORREL to work, metrics and facts must be associated with the same
dataset or the same level of granularity.

## Syntax

\`\`\`
SELECT CORREL(…)
SELECT CORREL(metric1, metric2)
SELECT CORREL(metric1, fact2)
SELECT CORREL(fact1, fact2)
\`\`\`

## Examples

\`\`\`
SELECT CORREL({metric/production_volume}, {metric/rate_of_defects})
SELECT CORREL({metric/gross_tonnage}, {metric/gross_profit})
\`\`\``;
