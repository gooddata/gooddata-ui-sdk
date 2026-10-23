// (C) 2021-2026 GoodData Corporation

export const content = `# MAQL and Multidimensionality
Multidimensionality is a fundamental principle of GoodData's MAQL (Multi-Dimension Analytical Query Language).

Multidimensional modeling works with the concepts of facts and dimensions meaning that MAQL metrics are context aware.

Metrics are sliced by dimension context that does not need to be specified in the MAQL expressions themselves. This multidimensional capability is one of the features that sets MAQL apart from SQL.

## Examples of Multidimensionality

In this section, we will use several examples to show you how MAQL works with dimensionality.

### Example 1

In this example, we created a SUM metric to display *amount sold* of a particular product.

\`\`\`
SELECT SUM({fact/amount})
\`\`\`

You can apply additional *dimensions* (in this case *Product* and *Year*) to this simple metric to break down the metric:


  |Metric       | Dimensionality |  What it returns (business meaning)|
  |-------------| ---------------- |--------------------------------------------|
  |Amount Sold   |(empty)        |  total all-time sales (1 row)|
  |Amount Sold   |Product        |  all-time sales for each sold product|
  |Amount Sold   |Product, Year   | sales for each existing year and product combination|

### Example 2

\`\`\`
SELECT SUM({fact/amount}) WHERE SUM({fact/amount}) > 25
\`\`\`

The dimensionality of the result and dimensionality of the filter are the same and defined by the dimensionality of the visualization.


  |Metric            |Dimensionality   |What it returns (business meaning)|
  |----------------- |---------------- |---------------------------------------------|
  |Amount Sold 25+   |(empty)          |Total sales of everything every  time (if the total is \>25).|
  |Amount Sold 25+   |Product          |Total sales of each product if sales for that product is \>25.|
  |Amount Sold 25+   |Product, Year    |Sales of each product each year if at least 25 pieces of that product were sold within that year.|

### Example 3

\`\`\`
SELECT SUM({fact/amount}) 
    WHERE (SELECT SUM({fact/quantity}) BY {attribute/product} ALL OTHER) > 25
\`\`\`

The dimensionality of the main (result) metric is different from dimensionality of the filtering metric. The dimensionality of the filtering metric is locked to Product.


  |Metric            |Dimensionality   |What it returns (business meaning)|
  |----------------- |---------------- |---------------------------------------------|
  |Amount Sold 25+   |(empty)          |Total sales of products with more than 25 sold items.|
  |Amount Sold 25+  | Product          |Total sales of each product with more than 25 sold items.|
  |Amount Sold 25+  | Product, Year    |Sales of each product and year for products with more than 25 sold items.|`;
