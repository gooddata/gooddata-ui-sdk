// (C) 2021-2026 GoodData Corporation

export const content = `# Covariance Functions
Covariance functions return the statistical covariance - how much two
sets of values change together based on a sample of the population
(COVAR), or based on a biased population (COVARP).

Covariance measures how two sets of values vary together. This
elementary function is used as a building block for some of the
two-dimensional statistical functions used in linear regression, as it
describes collectively how the two sets of values vary around their mean
values.

-   \`COVAR (*numeric1*, *numeric2*)\`

    ![Equation -Covariance](https://www.gooddata.com/developers/cloud-native/doc/maql/covar.png)

    -   where *numeric1* and *numeric2* are facts or metrics
    -   Computes the product of variance from mean for each value of *x* and *y*. These values are summed and then divided by *n*.
    -   Use for sets of values that are only a sample of the total (biased) population.

-   \`COVARP (*numeric1*, *numeric2*)\`

    ![Equation - Covariance for Populations](https://www.gooddata.com/developers/cloud-native/doc/maql/covarp.png)

    -   where *numeric1* and *numeric2* are facts or metrics
    -   Use COVARP for calculating covariances when the numeric values are the entire population of values.
    -   Use for sets of values that include the entire (unbiased) population, use COVARP.

## Syntax

\`\`\`
SELECT COVAR(…)
SELECT COVAR(metric1, metric2)
SELECT COVAR(fact1, metric2)
SELECT COVAR(fact1, fact2)
SELECT COVARP(metric1, metric2)
SELECT COVARP(fact1, metric2)
SELECT COVARP(fact1, fact2)
\`\`\`

## Examples

\`\`\`
SELECT COVAR({metric/total_cost_of_inputs}, {metric/gross_margin})
SELECT COVARP({fact/height}, {fact/height})
\`\`\``;
