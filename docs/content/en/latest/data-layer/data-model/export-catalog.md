---
legacy_path: learn/visualize_data/export_catalog
title: Export the catalog to code
category: Data layer / Data model
diataxis_type: howto
related_pages:
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/data-layer/data-model/measures
  - /docs/data-layer/data-model/attributes
  - /docs/getting-started/installation
  - /docs/data-layer/data-model/visualization-placeholders
type: docs
description: Install and configure @gooddata/catalog-export to generate JavaScript or TypeScript constants for the Logical Data Model objects in a workspace.
weight: 78
section: Data layer
subsection: Data model
aliases:
  - "../../learn/visualize_data/export_catalog/"
---

GoodData.UI visual components render data stored in your GoodData Cloud or GoodData.CN workspaces.
Your application specifies what data to render by referencing the logical data model (LDM) objects: attributes,
display forms (also known as labels), facts, and measures.

The `@gooddata/catalog-export` tool exports the catalog items and date datasets of a workspace into TypeScript or
JavaScript code. The generated code contains one exported constant per LDM object, plus the `Insights` and `Dashboards`
constants that map saved visualization and dashboard titles to their identifiers. You pass these constants to
components and execution definitions instead of writing object references by hand.

The tool runs at build time, so it fits a model that is fixed when you build the application. To read measures and attributes while the application runs, see [Load the workspace catalog at runtime](../workspace-catalog/).

## Built-in integrations

### Applications created with app-toolkit

The `@gooddata/catalog-export` tool is installed and integrated into all applications bootstrapped using the `@gooddata/app-toolkit` tool. A bootstrapped application's `package.json` contains the `refresh-md` script that you can call to start the `@gooddata/catalog-export` tool with the `gooddata` configuration from the same `package.json`.

If you created your application using `@gooddata/app-toolkit`, see the configuration options below.

### Dashboard plugins

The `@gooddata/catalog-export` tool is installed and integrated into all dashboard plugins bootstrapped using the `@gooddata/plugin-toolkit` tool.
A bootstrapped plugin project's `package.json` contains the `refresh-md` script that you can call to start the `@gooddata/catalog-export` tool with arguments derived from your plugin configuration.

## Install @gooddata/catalog-export

Include `@gooddata/catalog-export` as a devDependency of your application:

```bash
npm install @gooddata/catalog-export --save-dev
```

With yarn, run `yarn add @gooddata/catalog-export --dev`.

Don't run the tool with `npx @gooddata/catalog-export` without installing it first: exporting the catalog into a JavaScript file then fails.

## Run @gooddata/catalog-export

`@gooddata/catalog-export` is a command-line tool that retrieves metadata from a workspace and converts it into a TypeScript or JavaScript representation. It runs in interactive, silent, or hybrid mode:

1. The tool reads the `gooddata` entry from `package.json`, and a `.gdcatalogrc` JSON file with the same keys from the working directory (or the file you pass with `--config`). `.gdcatalogrc` takes precedence over `package.json`.

   The output is TypeScript or JavaScript depending on the file name extension of the output parameter. The default output file is `catalog.ts`.

   The configuration can contain some or all of the parameters that you would otherwise pass on the command line:

   ```json
   {
       "gooddata": {
           "hostname": "https://your.gooddata.hostname.com",
           "workspaceId": "your_gooddata_workspaceid",
           "catalogOutput": "catalog.ts"
       }
   }
   ```

   The hostname must include the protocol (`http://` or `https://`). Otherwise, the connection fails with a generic `connection refused` error.

1. The tool reads the API token only from the `TIGER_API_TOKEN` environment variable, never from the command line or the configuration files. It also loads a `.env` file from the working directory if there is one:

   ```bash
   TIGER_API_TOKEN=<your-api-token>
   ```

   Never commit the `.env` file to version control.

1. The tool also reads `--hostname`, `--workspace-id`, `--catalog-output`, `--config`, and `--accept-untrusted-ssl` from the command line. Command-line parameters take precedence over the configuration files. To list them, run the installed binary with `--help`:

   ```bash
   npx gdc-catalog-export --help
   ```

1. When all required parameters are set, the tool exports the metadata from the workspace. If the hostname, workspace, or output file is missing, the tool prompts you for it.

The tool authenticates with the API token as a Bearer token. To create a token, see [Create an API Access Token](https://www.gooddata.ai/docs/cloud/manage-organization/user-token/) in the GoodData Cloud docs, and for the authentication options in GoodData.UI, see [Authenticate to the backend](../../../integrations/authentication/).

### Subsequent catalog exports

The catalog export overwrites the generated files. Never modify them. To modify the generated constants or add new LDM objects, do it in a different file next to the generated code.

### Recommendations

- Include `@gooddata/catalog-export` as a devDependency of your application and define an npm script `refresh-md` to run it.
- Import the constants as a namespace instead of one by one:

  ```ts
  import * as Md from "./catalog.js";
  ```

## Generated code

Attributes with multiple display forms (labels) are generated into a constant such as this:

```ts
/**
 * Attribute Title: City
 * Attribute ID: attr.uscities.city
 */
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

```ts
/**
 * Attribute Title: Location Resort
 * Attribute ID: attr.restaurantlocation.locationresort
 */
export const LocationResort: IAttribute = newAttribute("label.restaurantlocation.locationresort");
```

Saved measures (MAQL metrics) are generated into a constant such as this:

```ts
/**
 * Metric Title: $ Total Sales
 * Metric ID: aa7ulGyKhIE5
 * Metric Type: MAQL Metric
 */
export const $TotalSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aa7ulGyKhIE5", "measure"));
/**
 * Metric Title: $ Franchise Fees
 * Metric ID: aaEGaXAEgB7U
 * Metric Type: MAQL Metric
 */
export const $FranchiseFees: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaEGaXAEgB7U", "measure"));
```

For facts, `@gooddata/catalog-export` generates an object with a key for each generated aggregation: `Sum`, `Avg`, `Min`, `Max`, `Median`, and `Runsum`. Build other aggregations, such as `count`, yourself with `newMeasure` and `m.aggregation("count")`.

```ts
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
    Sum: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: avg
     */
    Avg: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: min
     */
    Min: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: max
     */
    Max: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: median
     */
    Median: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: runsum
     */
    Runsum: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("runsum")),
};
```

For date datasets, `@gooddata/catalog-export` includes one constant `DateDatasets`. Each date dataset is a property of `DateDatasets` that holds the dataset's `ref` and `identifier` and one property per date attribute. Each date attribute holds its own `ref` and `identifier` and one `newAttribute` per display form:

```ts
/** Available Date Data Sets */
export const DateDatasets = {
    /**
     * Date Data Set Title: Date (Timeline)
     * Date Data Set ID: timeline.dataset.dt
     */
    Timeline: {
        ref: idRef("timeline.dataset.dt", "dataSet"),
        identifier: "timeline.dataset.dt",
        /**
         * Date Attribute: Month (Timeline)
         * Date Attribute ID: timeline.month
         */
        Month: {
            ref: idRef("timeline.month", "attribute"),
            identifier: "timeline.month",
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
        },
    },
};
```

A date attribute with a single display form gets a `Default` property:

```ts
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

