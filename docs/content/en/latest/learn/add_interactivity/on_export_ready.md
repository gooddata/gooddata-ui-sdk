---
title: OnExportReady
sidebar_label: OnExportReady
copyright: (C) 2007-2020 GoodData Corporation
id: on_export_ready
---

The `onExportReady` parameter returns the `getExportedData` function that allows you to export data from an existing insight into CSV or XLSX. The `getExportedData` function accepts one parameter (the `exportConfig` object), and returns the URI of the exported file.

The `onExportReady` parameter is available in all visual components except for the KPI, the AFM components, and the AttributeFilter component.

## exportConfig

The `exportConfig` object includes the following properties:
* **format** (optional, string) specifies the format of the exported data. Can be set to `csv` (default) or `xlsx`.
* **includeFilterContext** (only when `format` is set to `xlsx`; optional, boolean) specifies whether the applied filters should be added (`true`) or should not be added (`false`; default) to the exported XLSX file.
* **mergeHeaders** (only when `format` is set to `xlsx`; optional, boolean) specifies whether repeating header cells should be merged (`true`; default) or should not be merged (`false`).
* **title** (optional, string) is the title of the exported data.

## Structure

```jsx
import { InsightView } from "@gooddata/sdk-ui-ext";

<InsightView
    insight="<visualization-identifier>"
    onExportReady={(getExportedData) => { /* hold onto function and call to do export as needed */ }}
/>
```

## Example

```jsx
import { InsightView } from "@gooddata/sdk-ui-ext";

export class Example extends React.Component {
    constructor(props) {
        super(props);
        this.doExport = this.doExport.bind(this);
        this.onExportReady = this.onExportReady.bind(this);
    }

    onExportReady(getExportedData) {
        this.getExportedData = getExportedData;
    }

    async doExport() {
        try {
            const result = await this.getExportedData({
                format: "xlsx",
                includeFilterContext: true,
                mergeHeaders: true,
                title: "CustomTitle"
            });
            console.log("Export successfully: ", result.uri);
        } catch (error) {
            console.log("Export error: ", error);
        }
    }

    render() {
        return (
            <div style={{ height: 367 }}>
                <InsightView
                    insight="<visualization-identifier>"
                    onExportReady={this.onExportReady}
                />
                <button className="button button-secondary" onClick={this.doExport}>Export</button>
            </div>
        );
    }
}
```