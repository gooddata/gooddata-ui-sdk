# LDM and recordings from workspace used to test new backend features

[![npm version](https://img.shields.io/npm/v/@gooddata/experimental-workspace)](https://www.npmjs.com/@gooddata/experimental-workspace)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/experimental-workspace)](https://npmcharts.com/compare/@gooddata/experimental-workspace?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This project contains LDM and recordings captured from the GoodData workspace on staging where we deploy new
backend functionality. The experimental workspace is useful during development and testing of integration with
the new backend functionality before it lands on the production and can be tested on top of the reference
workspace.

## Working with experimental workspace LDM

This is stored in [src/md](src/md) and consists of two files:

-   The auto-generated `full.ts` - this is created by running `npm run refresh-md` script

    Note: the script has an existing workspace from `staging3.intgdc.com` hardcoded. This is not available
    outside of GoodData.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/experimental-workspace/LICENSE).
