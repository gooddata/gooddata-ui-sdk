// (C) 2021-2026 GoodData Corporation

export const content = `# Variance Functions
Returns the statistical variance - how far a set of values is spread out based on a sample of the population (VAR), or based on a biased population (VARP). Variance is non-negative, zero indicates that all values are identical.

Variance computation is used to build standard deviation and other statistical functions.

To measure spread, variance calculates the mean of all values in the
sample. For each input value in the set, the difference of the value
from the mean is computed, and this difference is squared. All of the
squares are added together, and then divided by a sample size factor,
depending on the function you are using.

-   Values for variance are non-negative. A value of 0 indicates that
    there is no variance among the values; all values are identical.
-   The square root of variance is the standard deviation. See [Standard Deviation Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/standard-deviation-functions/).
-   Covariance measures how two sets of values change together. See
    [Covariance Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/covariance-functions/).

The spread is measured for a sample of the (biased) population (VAR) or
for the entire (unbiased) population (VARP).

-   For a sample of the population, use the VAR function, which divides
    the sum of squares by the number of values in the same size (N-1):

    ![Equation - Variance](https://www.gooddata.com/developers/cloud-native/doc/maql/var.png)
    -   \`VAR (*numeric*)\`
        -   where *numeric* is a fact or metric
        -   Computes the sum of squared differences from the mean for
            *n* values divided by *n-1*

-   If the set of values is the entire population of values, use the
    VARP function, which divides the sum of squares by N:

    ![Equation - Variance for Populations](https://www.gooddata.com/developers/cloud-native/doc/maql/var.png)

    -   \`VARP (*numeric*)\`\`
        -   where *numeric* is a fact or metric
        -   Computes the sum of squared differences from the mean for
            *n* values divided by *n*\]

## Syntax

\`\`\`
SELECT VAR(…)
SELECT VAR(metric)
SELECT VARP(fact)
\`\`\`

## Examples

\`\`\`
SELECT VAR({metric/internal_rate_of_return})
SELECT VARP({metric/gross_weight})
\`\`\``;
