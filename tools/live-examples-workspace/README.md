# LDM and recordings from workspace backing the Examples application

[![npm version](https://img.shields.io/npm/v/@gooddata/live-examples-workspace)](https://www.npmjs.com/@gooddata/live-examples-workspace)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/live-examples-workspace)](https://npmcharts.com/compare/@gooddata/live-examples-workspace?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This project contains LDM and recordings captured from the GoodData workspace which is backing the `sdk-examples`. It
is a complement to the reference workspace; it contains additional types of objects and data and can be used for
testing the Geo Pushpin chart.

## Working with example workspace LDM

This is stored in [src/md](src/md) and consists of two files:

-   The auto-generated `full.ts` - this is created by running `npm run refresh-md` script

    Note: the script has an existing workspace hardcoded; it runs against live examples project hosted on the
    `developer.na.gooddata.com`. You can register to this project via the live examples site.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/live-examples-workspace/LICENSE).
