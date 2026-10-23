// (C) 2021-2026 GoodData Corporation

export const content = `# APPROXIMATE_COUNT
Use APPROXIMATE_COUNT to return the approximate number of unique values for an attribute. Because the returned value is a statistical estimate and not an exact figure, this function can increase the processing speed when analyzing large datasets. You can use APPROXIMATE_COUNT anywhere you can use COUNT. The smaller the amount of data to process, the more likely that the returned results of APPROXIMATE_COUNT will match the results of COUNT. 

 - APPROXIMATE_COUNT is available only for workspaces that use [Vertica](https://www.gooddata.com/developers/cloud-native/doc/hosted/connect-data/create-data-sources/vertica/) Data Sources.
 - APPROXIMATE_COUNT uses the Vertica default behavior for APPROXIMATE_COUNT_DISTINCT. It is not possible to use modifiers.
 - GoodData defaults to COUNT when APPROXIMATE_COUNT is unavailable in a workspace.

## Syntax

APPROXIMATE_COUNT uses the following syntax:


  |Form       |        Syntax            |                                           Example|
  |------------------ |------------------------------------------------------------| --------------------------------------------|
  |single parameter   |\`SELECT APPROXIMATE_COUNT(attribute)\`                                    |\`SELECT APPROXIMATE_COUNT({attribute/order_id})\`|
  |two parameters     |\`SELECT APPROXIMATE_COUNT(attribute, primary_key)\`                       |\`SELECT APPROXIMATE_COUNT({attribute/order_id}, {attribute/campaign_id})\`|
  |with USING         |\`SELECT APPROXIMATE_COUNT(attribute) USING primary_key\`   |\`SELECT APPROXIMATE_COUNT({attribute/order_id}) USING {attribute/campaign_id}\`|


### Single-Parameter Version

The single-parameter version of APPROXIMATE_COUNT dynamically gets the context of
where to count from the visualization it is used in.

### Two-Parameter Version

In the two-parameter version, the context where to count the attribute
is determined explicitly by the second parameter - the primary key of
the dataset.

The primary key is connection point between datasets. It connects the
APPROXIMATE_COUNT function's first parameter to the dataset in which the count is
to take place.

### Specifying APPROXIMATE_COUNT Context Resolution with USING

In a metric, USING provides a hint for which context should be used.
The context for the computation of APPROXIMATE COUNT may be ambiguous if there are
multiple fact datasets in your logical data model that relate to a counted attribute. 

The following image shows a model with the fact datasets \`Purchases\` and \`Sales\` and
has both datasets connected to the \`Store ID\` and \`Product ID\` attributes.

![model for count example](https://www.gooddata.com/developers/cloud-native/doc/maql/count-ldm-using.png)

To create a metric that resolves with a specific context, you can specify USING in your metric like in the following 
example: \`SELECT COUNT({label/inventory.productid}) USING {label/purchases.purchaseid}\`. 

With this example, the visualization will show the approximate number of uniquely purchased products per store 
because the attribute \`Purchase ID\` from the \`Purchases\` dataset is in the USING clause.

With the example model, if you build a visualization to display the approximate count of products per store with 
\`SELECT COUNT({label/inventory.productid})\` and slice it by Store without specifying USING, it is ambiguous whether 
the visualization is displaying the approximate number of unique products that have been purchased by store or the
approximate number of unique products that have been sold by the store.

The attribute in the USING clause can be any attribute which uniquely determines the correct context. For example, you
can also use an attribute from the \`Purchase Date\` dataset in the USING clause. This uses the \`Purchases\` dataset as 
the context because the \`Sales\` dataset has no relationships to \`Purchase Date\`: 
\`SELECT COUNT({label/inventory.productid}) USING {label/purchasedate.year}\``;
