// (C) 2021-2026 GoodData Corporation

export const content = `# Using Ranking Filters
In this article, you will learn how to use the MAQL's TOP and BOTTOM ranking filters.

So far we have discussed two types of filters:

-   Attribute filters in expressions such as the original definition of
    Revenue:

    \`\`\`
    SELECT {metric/revenue} WHERE {label/order_status} NOT IN ("Cancelled", "Returned")
    \`\`\`

-   Numeric filters defined using submetrics such as

    \`\`\`
    SELECT {metric/revenue} WHERE (SELECT {metric/revenue} BY {label/product_id}) > 100000
    \`\`\`

What if you want to compute only the revenue for the top 10 highest
selling products? Or top 10%?

This is why MAQL includes the TOP keyword (and the corresponding
BOTTOM).

Let's try to create a few metrics to see these keywords in action:

**Revenue / Top 10**

\`\`\`
SELECT {metric/revenue} WHERE TOP(10) OF ({metric/revenue})
\`\`\`

Let's put this metric into a table together with the original Revenue
metric and slice it by Product. While the Revenue metrics shows Revenue
for each product, the cells in the \`Revenue / Top 10\` column are empty
except for the top highest numbers. However, if you replace the Product
attribute with Customer, the Top 10 metric gives us non-zero numbers for
the top 10 customers.

![top 10 example](https://www.gooddata.com/developers/cloud-native/doc/maql/top-10-example.gif)

That is flexible but not exactly what you want to achieve. If you
want to compute Revenue from the top 10 highest selling products, you
have to express that you care only about top Products somewhere in our
metric. you can achieve that using the submetric aggregated by Product
using the BY keyword. Let's define our Revenue / Top 10 Products as

\`\`\`
SELECT {metric/revenue} WHERE (SELECT {metric/revenue} / Top 10 BY {label/product_id}) > 0
\`\`\`

Alternatively, if you do not see any use for having the separate \`Revenue /
Top 10\` metric, you can delete it and define your \`Revenue / Top 10 Products\`
as

\`\`\`
SELECT {metric/revenue}
WHERE (SELECT (SELECT {metric/revenue} WHERE TOP(10) OF ({metric/revenue})) BY {label/product_id}) > 0
\`\`\`

Do you care about the top 10% rather than about just the top 10? Just
add the percent sign:

\`\`\`
SELECT {metric/revenue}
WHERE (SELECT (SELECT {metric/revenue} WHERE TOP(10%) OF ({metric/revenue})) BY {label/product_id}) > 0
\`\`\`

We will leave the BOTTOM keyword up to the kind reader as homework and
focus on yet another feature of the ranking metrics.`;
