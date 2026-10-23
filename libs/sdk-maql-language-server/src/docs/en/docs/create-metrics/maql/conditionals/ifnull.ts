// (C) 2021-2026 GoodData Corporation

export const content = `# IFNULL
IFNULL statement allows you to control replacement of missing values that are returned by an expression.

If a metric expression that is wrapped within an IFNULL statement ever returns a null value, the replacement number specified in the second parameter of the IFNULL function is inserted in place of the null value.

IFNULL is useful especially in cases where a sub-metric is referred to within another metric's definition. Wrapping the sub metric in an IFNULL statement keeps the encompassing metric from becoming null due to one of its components returning a null value. 

## Syntax

\`\`\`
SELECT IFNULL(…,…)
SELECT IFNULL(metric, replacement_value)
\`\`\`

## Examples

\`\`\`
SELECT IFNULL(SUM({fact/amount}), 0)
SELECT IFNULL(SUM({metric/fb_cost} + {metric/tw_cost}), 0)
SELECT IFNULL(SUM({fact/amount}) + 100, 1)
\`\`\`

Supported replacement values include constants, but not other metric expressions.

## IFNULL Best Practices

The IFNULL function is used to replace missing values in fact tables and to replace values when a computation generates a null value.

A null value is not the same thing as zero (0). A null value means one of the following:

-   no entry has been made
-   the value is unknown

The IFNULL function can be useful for handling or trapping values that are null, which can confuse your analysis.

However, the function should not be overused, as it can add significant computing time and consume workspace computational bandwidth.

Do not apply IFNULL to all of your functions or even your basic sum, average, and count functions. Instead, use IFNULL where the presence of null values is causing confusion or ambiguity in the visualizations you have created.

Wrapping a metric in the IFNULL statement enables operations where one of the values is null. The syntax for this statement looks like the following:

\`\`\`
SELECT IFNULL(metric_reference, replacement_value)
\`\`\`

The IFNULL function can be applied to facts, too.

\`\`\`
SELECT IFNULL(fact_name, replacement_value)
\`\`\`

**Example - Data with a missing line item**

An IFNULL does not mean that there is a blank or missing line item.

Suppose your data looks like the following:

  |Date      |   Sales Amounts|
  |------------| ---------------|
  |08/01/2013  | $3,000|
  |08/02/2013  | $5,700|
  |08/03/2013  | $2,000|
  |08/05/2013  | $4,400|

Wrapping the \`Sales Amount\` metric in an IFNULL function does not make data for 08/04/2013 appear because there isn't any data for that day.

The IFNULL function does not populate rows of data when the row does not exist. Instead, IFNULL forces a value to appear when the value is blank.

**Example - IFNULL and arithmetic operations**

The prime example of when to use IFNULL is when you are performing an arithmetic operation, and one of the values could potentially be null.

Suppose you have different types of transactions: payments, refunds, and partial refunds. You have two metrics to measure payments ( \`# Payments\` ) and refunds ( \`# Refunds\` ):

\`\`\`
SELECT COUNT({attribute/transaction_id}) WHERE {attribute/transaction_type} = "Sale"
SELECT COUNT({attribute/transaction_id}) WHERE {attribute/transaction_type} IN ("Full Refund", "Partial Refund")
\`\`\`

Now, suppose your daily analysis calculates the difference between the number of payments received and the refunds processed. The difference metric should look like the following:

\`\`\`
SELECT {metric/no_of_payments} - {metric/no_of_refunds}
\`\`\`

However, your enterprise does not process refunds every day. If no refunds are processed for a day, the above metric generates a null value, even if there are payments.

If one of the values within an expression is null, the entire expression is null. Use \`IFNULL\` to preserve the computation.

To solve this problem, you would wrap the expressions in the IFNULL function like the following:

\`\`\`
SELECT IFNULL({metric/no_of_payments},0) - IFNULL({metric/no_of_refunds},0)
\`\`\`
If a refund was not processed for the day, the calculation can still be performed.`;
