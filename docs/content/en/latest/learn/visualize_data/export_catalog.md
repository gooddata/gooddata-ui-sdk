---
title: Export Catalog
linkTitle: Export Catalog
copyright: (C) 2007-2018 GoodData Corporation
id: export_catalog
---

GoodData.UI visual components render data stored in your GoodData Cloud or GoodData.CN workspaces.
Your application specifies what data to render by referencing the Logical Data Model (LDM) objects: attributes,
display forms (also known as labels), facts, and measures.

To simplify this task, GoodData.UI offers the `@gooddata/catalog-export` tool. `@gooddata/catalog-export` exports a
list of catalog items and date datasets from a GoodData workspace into JavaScript or TypeScript code. The generated code
contains exported constant-per-LDM-object.

Using this generated code, you can create charts and execution definitions in a very efficient and natural way.

## Built-in integrations

### Accelerator Toolkit applications

The `@gooddata/catalog-export` tool is installed and integrated into all applications bootstrapped using the `@gooddata/app-toolkit` tool. A bootstrapped application's `package.json` contains the `refresh-md` script that you can call to start the `@gooddata/catalog-export` tool with arguments derived from your application configuration.

If you created your application using `@gooddata/app-toolkit`, you may be interested in additional
configuration options described further in this document.

### Dashboard plugins

The `@gooddata/catalog-export` tool is installed and integrated into all dashboard plugins bootstrapped using the `@gooddata/plugin-toolkit` tool.
A bootstrapped plugin project's `package.json` contains the `refresh-md` script that you can call to start the `@gooddata/catalog-export` tool with arguments derived from your plugin configuration.

In addition to that, you may be interested in additional configuration options and recommendations described further in this document.

## Installing @gooddata/catalog-export

Include `@gooddata/catalog-export` as a devDependency of your application. Launching it through `npx` is not supported. If you start the tool using `npx` and try to export the catalog into a JavaScript file, you will encounter errors.

To install the stable version, run one of the following commands **depending on your package manager**:

**yarn**

```bash
yarn add @gooddata/catalog-export --dev
```

**npm**

```bash
$ npm install @gooddata/catalog-export --save-dev
```

## Using @gooddata/catalog-export

`@gooddata/catalog-export` is a command-line tool designed to retrieve metadata from a workspace and convert it into TypeScript or JavaScript representation. This tool offers three operational modes - interactive, silent, and hybrid.

This is how it works:

1.  The program searches the `package.json` file for `gooddata` entry. If found, the program reads input parameters from this file.

        TypeScript or JavaScript output files are generated based on the filename extension specified in the output parameter.

        The configuration can contain some, or all, of the parameters that you would typically provide on the command line:

        ```json
        {
            ...
            "gooddata": {
                "hostname": "https://your.gooddata.hostname.com",
                "workspaceId": "your_gooddata_workspaceid",
                "catalogOutput": "desired_file_name.ts|js",
            },
            ...
        }
        ```

    {{% alert title="Hostname protocol" %}}

The hostname has to include the protocol (`http://` / `https://`), otherwise you will get a fairly generic `connection refused` error, when trying to connect.

{{% /alert %}}

2.  It is not possible to specify api token in `package.json` file, as it is typically saved in VCS (e.g. Git). Instead, credentials can be specified through environmental variables. We also load `.env` file if it's present in the same folder.

    ```ini
    TIGER_API_TOKEN=<your_token_for_the_tiger_server>
    ```

    **NOTE:** Make sure to never commit `.env` file to your version control system.

3.  The program also reads input parameters from the command line. To learn more about the available parameters, run the following command:

    `npx @gooddata/catalog-export --help`

    Parameters provided via the command line take precedence over the corresponding parameters in the `package.json` file.

4.  If all required parameters are entered, the program runs and exports the metadata from the workspace. If any parameter is missing, the program will prompt you to enter it.

    **IMPORTANT!** The program does not accept passwords via the command line. You can either put the password into `.env` or enter it interactively.

The tool uses Bearer token authentication when communicating with your GoodData Cloud instance or your GoodData.CN installation. For more information about how to obtain API tokens, see the [GoodData Cloud and GoodData.CN authentication page](../../integrate_and_authenticate/cn_and_cloud_authentication/).

### Subsequent catalog exports

The catalog export will overwrite the generated files. If you need to modify the generated constants or add new LDM objects, do so through a layer of indirection: in a different file adjacent to the generated code.

### Recommendations

-   Include `@gooddata/catalog-export` as a devDependency of your application and define an NPM script `refresh-md` to run the program.
-   Do not import the constants directly. Instead, wrap the constants into a namespace as follows:

    ```javascript
    import * as Md from "./md/generatedFile";
    export { Md };
    ```

-   Never modify the generated files.
-   If you need to modify the generated constants or add new LDM objects, do so through a layer of indirection: in a different file adjacent to the generated code. For examples, look at our reference-workspace LDM and package.

### Example

Attributes with multiple display forms (labels) are generated into a constant such as this:

```javascript
export const City = {
    /**
     * Display Form Title: city
     * Display Form ID: label.uscities.city
     */
    Default: newAttribute("label.uscities.city"),
    /**
     * Display Form Title: location
     * Display Form ID: label.uscities.city.location
     */
    Location: newAttribute("label.uscities.city.location"),
};
```

Attributes with a single display form (label) are generated into a constant such as this:

```javascript
/**
 * Attribute Title: Location Resort
 * Display Form ID: attr.restaurantlocation.locationresort
 */
export const LocationResort = newAttribute("label.restaurantlocation.locationresort");
```

MAQL metrics are generated into a constant such as this:

```javascript
/**
 * Metric Title: $ Total Sales
 * Metric ID: aa7ulGyKhIE5
 * Metric Type: MAQL Metric
 */
export const $TotalSales = newMeasure("aa7ulGyKhIE5");
/**
 * Metric Title: $ Franchise Fees
 * Metric ID: aaEGaXAEgB7U
 * Metric Type: MAQL Metric
 */
export const $FranchiseFees = newMeasure("aaEGaXAEgB7U");
/**
 * Metric Title: $ Franchise Fees (Ad Royalty)
 * Metric ID: aabHeqImaK0d
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesAdRoyalty = newMeasure("aabHeqImaK0d");
/**
 * Metric Title: $ Franchise Fees (Ongoing Royalty)
 * Metric ID: aaWGcgnsfxIg
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesOngoingRoyalty = newMeasure("aaWGcgnsfxIg");
```

For facts, `@gooddata/catalog-export` generates an object with keys for each supported aggregation:

```javascript
/**
 * Fact Title: Cost
 * Fact ID: fact.restaurantcostsfact.cost
 */
export const Cost = {
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: count
     */
    Count: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("count")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: avg
     */
    Avg: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: min
     */
    Min: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("min")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: max
     */
    Max: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("max")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: median
     */
    Median: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("median")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: runsum
     */
    Runsum: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("runsum")),
};
```

For date datasets, `@gooddata/catalog-export` includes one constant `DateDatasets`. The date dimension name is the property in the DateDatasets. Attributes with multiple display forms are generated as follows:

```javascript
/** Available Date Data Sets */
export const DateDatasets = {
  /**
   * Date Data Set Title: Date (Timeline)
   * Date Data Set ID: timeline.dataset.dt
   */
  Timeline: {
    ref: idRef("timeline.dataset.dt", "dataSet"),
    identifier: "timeline.dataset.dt"
    /**
     * Display Form Title: Short (Jan) (Timeline)
     * Display Form ID: timeline.abm81lMifn6q
     */
    Short: newAttribute("timeline.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Timeline)
     * Display Form ID: timeline.abs81lMifn6q
     */
    Long: newAttribute("timeline.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Timeline)
     * Display Form ID: timeline.abq81lMifn6q
     */
    Number: newAttribute("timeline.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Timeline)
     * Display Form ID: timeline.abo81lMifn6q
     */
    MQ: newAttribute("timeline.abo81lMifn6q"),
};
```

Date dataset attributes that do not have multiple display forms are generated as follows:

```javascript
/** Available Date Data Sets */
export const DateDatasets = {
    /**
     * Date Data Set Title: Date (Created)
     * Date Data Set ID: created.dataset.dt
     */
    Created: {
        ref: idRef("created.dataset.dt", "dataSet"),
        identifier: "created.dataset.dt",
        /**
         * Date Attribute: Year (Created)
         * Date Attribute ID: created.year
         */ Year: {
            ref: idRef("created.year", "attribute"),
            identifier: "created.year",
            /**
             * Display Form Title: Year (Created)
             * Display Form ID: created.aag81lMifn6q
             */ Default: newAttribute("created.aag81lMifn6q"),
        },
    },
};
```
