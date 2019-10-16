# Catalog Export

Catalog Export utility can assist you with obtaining vital metadata about GoodData Logical Data Model (LDM)
and User Data Model (UDM). This metadata is essential to specify what the different charts in GoodData.UI SDK
should render.

Please read the official documentation site for more information:
[Official documentation](https://sdk.gooddata.com/gooddata-ui/docs/gdc_catalog_export.html)

On top of what is officially documented, the Catalog Export tool can newly also generate TypeScript
code with constants initialized to valid instances of IAttribute(s) and IMeasure(s). We encourage you
to explore this functionality as it brings the LDM and UDM 'to your fingertips' without the need
to use `CatalogHelper` tool.

To export your workspace's metadata into a TypeScript code, simply specify that data should be
exported to a .ts file (for instance catalog.ts).

This functionality is currently in alpha stage - the layout of the generated TypeScript files MAY
change.
