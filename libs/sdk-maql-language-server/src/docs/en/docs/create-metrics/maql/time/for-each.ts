// (C) 2021-2026 GoodData Corporation

export const content = `# FOR EACH
The **FOR EACH** clause allows you to display all attribute values in your visualization, even if they are missing.

If you want to display how many visits are planned for each particular month, the visualization normally shows you all months with at least one visit planned.

![Table](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins02.png)

If you use the **FOR EACH** for month of the year, the visualization will show you also the months that have no visits planned. 

![FOR Each in Metric](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins01.png)

When creating metrics with \`FOR EACH\`, remember that:

* The visualizations in Analytical Designer must be sliced with the same attributes that are used in the \`FOR EACH\` clauses to display the missing values. Otherwise, \`FOR EACH\` is ignored.

* If the visualization contains multiple metrics with \`FOR EACH\` applied, the visualization displays all attribute values. 

* When \`FOR EACH\` is applied, the visualization displays all attribute values between the first and the last metric values available. 
    
    ![Metrics in Separate Visualizations](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins04.png)

    If the visualization contains multiple metrics, it displays attribute values from all metrics.

     ![Metrics in One Visualizations](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins05.png)

You can also select the **show all values** option in your visualizations in Analytical Designer to display similar results. For details, see [FOR EACH versus Show All Values](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/time/for-each/#for-each-versus-show-all-values) and [Create Visualizations](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-visualizations/).

#### Day versus Day of Week

When With date attributes, the \`FOR EACH\` clause displays the following:

* For \`month\` and similar, the \`FOR EACH\` clause displays attribute values from the first to the last metric values available, including the missing values in between.
    ![Month](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins06.png)

* For \`month of year\` and similar date attributes, the \`FOR EACH\` clause display always all attribute values.
     ![Month of Year](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins07.png)



#### FOR EACH versus Show All Values

The \`FOR EACH\` clause and the \`Show all values\` option in Analytical Designer show similar results.

* \`FOR EACH\` displays attribute values between the first and the last metric values of each metric, including the missing values in between. 

    If any attribute value falls outside of such intervals for all metrics, it is not displayed.

    ![Metrics in Separate Visualizations](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins08.png)

* \`Show all values\` displays all attribute values regardless of the metric values available.

    ![Metrics in Separate Visualizations](https://www.gooddata.com/developers/cloud-native/doc/maql/outerjoins09.png)



## Syntax

\`\`\`
SELECT ... BY ... FOR EACH (attribute/label), (attribute/label), ...
\`\`\`

## Examples

Display the sum for all sold items every month. The \`FOR EACH\` clause displays also items and months with no sale.
\`\`\`
SELECT SUM(fact/sales) FOR EACH (attribute/saledate.month), (attribute/item)
\`\`\`

Display the moving average. The \`FOR EACH\` clause displays also the days without any change.
\`\`\`
SELECT RUNAVG({metric/value}) ROWS BETWEEN 6 PRECEDING AND CURRENT ROW FOR EACH(date.day)
\`\`\`

Display the moving average. The \`FOR EACH\` clause displays also the days without any change and shows missing values as zeros. 
\`\`\`
SELECT RUNAVG( IFNULL({metric/value},0)) ROWS BETWEEN 6 PRECEDING AND CURRENT ROW FOR EACH(date.day)
\`\`\`

Display the bottom 10 products with the lowest number of orders. The \`FOR EACH\` clause counts also the products with no orders.
\`\`\`
SELECT COUNT({label/order_id}) FOR EACH {label/product_name} WHERE BOTTOM(10) OF (COUNT({label/order_id}) )
\`\`\`

## Data Source Support for Dates

Some of the data sources may not fully support FOR EACH with **date attributes**:

* *Dremio*, *Drill*, *Redshift*, and *Synapse* do not support FOR EACH for date attributes.

* *SQL Server 2022 (16.x)*, *Azure SQL Database* and *Azure SQL Managed Instance* support date attributes only from the compatibility level 160.

Other data sources fully support FOR EACH for all attributes.

You can create metrics with FOR EACH even if your data source does not support it. If you add such metric to a visualization, Analytical Designer will display an error.
{{% /alert %}}`;
