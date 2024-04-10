---
title: "Filters"
linkTitle: "Filters"
weight: 60
no_list: true
---

When filtering, you want to remove specific values from the original data in a Visualization, so it shows only the relevant subset. Filtering allows you to narrow the scope of a visualization without changing the visualization itself.

You can create filters based on attribute values, metric values, or dates.

For example, if you have a visualization showing the **Top customer per region**:

![customers](gd-ui/top_customer_by_region.png)

You may want to display the data:

1. only for a specific period ([dateFilter](./date_filter/)):
    - last month
    - previous year
    - last two weeks

    ![gd_ui_date_filter](gd-ui/date_filter.png)

2. only for a specific customer ([attributeFilter](./attribute_filter_button_component/)):
    - Kitti Jinki
    - Aaron Clements
    - some combination of customers

    ![attribute_filter](gd-ui/attribute_filter_new.png)

3. only the top/least sold products ([rankingFilter](./ranking_filter/)):
    - top 10 customers by # of orders
    - bottom 10 customers but their ARR
    - top 3 customers by their ARR

    ![ranking filter](gd-ui/ranking_filter_combined.png)

4. only products within the custom range ([measureValueFilter](./measure_value_filter/)):
    - customers with ARR over 1000k $ 
    - customers with ARR less than 100k $ 
    - customers with ARR between 100k $ and 1000k $

    ![measure_value_filter](gd-ui/mvf_combined.png)