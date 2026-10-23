// (C) 2021-2026 GoodData Corporation

export const content = `# CASE
CASE is a conditional statement that performs logical tests on a series
of conditions and returns values when a condition is met. The CASE
function returns a numeric result. You use CASE for complex conditional
expressions that contain two or more conditions.

CASE is followed by WHEN/THEN keywords to specify the conditions, then
by ELSE to specify the default return.

If no match is found, the default return expression (ELSE) is used. If
there is no default return and no values match, then \`null\` value is returned.
All CASE expressions conclude with the END keyword.

## CASE and Multidimensionality

Before proceeding to the CASE syntax samples, as a user you have to
understand that usage guidelines for CASE in the MAQL environment are based on multidimensionality. Understanding multidimensionality is crucial to
ensure your CASE metrics return correct results (see [MAQL and Multidimensionality](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/maql-and-multidimensionality/)).

-   CASE does not work with the base data level.
-   Instead, the condition is evaluated on the aggregation dimension.
-   All WHENs are evaluated independently but all based on a single
    dimension (the aggregation dimension mentioned in the previous
    point).

In most common scenarios you should follow this rule:

-   Always put the CASE statement inside (not outside) an aggregation (SUM) container.

See examples below.

## CASE Syntax

CASE can be used in the following two syntax forms:


| Form             |  Syntax         | Example|
|-----------------|------------------|--------------|
| No aggregation   |  \`SELECT CASE WHEN condition1 THEN outcome1, WHEN condition2 THEN outcome 2 ELSE outcome3 END\`        |       \`SELECT CASE WHEN {attribute/activity_type} IN ("email", "meeting") THEN 1, WHEN {attribute/activity_type} IN ("phone_call") THEN 2 ELSE 0 END\`|
|With aggregation   |\`SELECT SUM (SELECT CASE WHEN condition1 THEN outcome1, WHEN condition2 THEN outcome2 ELSE outcome3 END)\`  | \`SELECT SUM (SELECT CASE WHEN {attribute/activity_type} IN ("email", "meeting") THEN {fact/amount} ELSE {fact/loss} END)\` |

Using the aggregation container ensures that the CASE conditions are
computed on the correct dimension and returns relevant results.

## How to Use CASE Correctly

As noted above, we advise you to use CASE inside aggregation containers.

Here is an example of incorrect use of CASE in the following logical
data model. For the sake brevity, only one CASE condition is used.

![An example of incorrect use of CASE ](https://www.gooddata.com/developers/cloud-native/doc/maql/case.png)

If you want to slice the following metric with **Campaign Category**,
the visualization would not compute because the WHEN conditions are not
related to visualization dimensionality:

\`\`\`
SELECT CASE WHEN {fact/customer_state} IN ("AR", "NY") THEN SUM ({fact/price}) ELSE SUM({fact/price} * {fact/quantity}) END
\`\`\`

On the other hand, the same metric when sliced by attribute **Customer
ID** (instead of **Campaign Category**) is valid. That is because the
slicing attribute (**Customer ID**) is directly related to the CASE
condition attribute (Customer State).

If you need to slice by unrelated attribute, put the CASE statement
inside the SUM aggregation instead:

\`\`\`
SELECT SUM(SELECT CASE WHEN {attribute/customer_state} IN ("AR", "NY") THEN {fact/price} ELSE {fact/price} * {fact/quantity} END)
\`\`\``;
