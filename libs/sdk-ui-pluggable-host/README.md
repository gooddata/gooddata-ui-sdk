# GoodData.UI SDK - Pluggable Host Runtime

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides the runtime for hosting GoodData pluggable applications: the application registry, the Module Federation loader, route resolution, platform context loading, and the default host UI chrome.

## Stability

The API surface is marked `@alpha` and may change between minor releases.

## Backend support

Currently only the GoodData Cloud (Tiger) backend is supported. The package depends on `@gooddata/sdk-backend-tiger` directly; running against a different backend is not supported. Lifting this behind the backend SPI is tracked as future work.

## License

(C) 2026 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-pluggable-host/LICENSE).
