# GoodData.UI SDK - Pivot Table component

This project implements `PivotTable` React component which you can use in our React applications.

See the official SDK documentation for more information about the [PivotTable](https://sdk.gooddata.com/gooddata-ui/docs/next/pivot_table_component.html) component.

## Technical notes

-   The PivotTable is implemented using the community version of ag-grid library. The SDK adds layers of convenience to
    construct and populate the table using results computed by an analytical backend.

-   All Pivot Table and ag-grid styles are scoped under the `gd-table-component` namespace; if your application uses
    ag-grid as well, GoodData.UI styles will not conflict with styles in your application.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-pivot/LICENSE).
