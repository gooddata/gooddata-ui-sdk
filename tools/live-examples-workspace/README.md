# LDM and recordings from workspace backing the Examples application

This project contains LDM and recordings captured from the GoodData workspace which is backing the `sdk-examples`. It
is a complement to the reference workspace; it contains additional types of objects and data and can be used for
testing the Geo Pushpin chart.

## Working with example workspace LDM

This is stored in [src/ldm](src/ldm) and consists of two files:

-   The auto-generated `full.ts` - this is created by running `npm run refresh-ldm` script

    Note: the script has an existing workspace hardcoded; it runs against live examples project hosted on the
    `developer.na.gooddata.com`. You can register to this project via the live examples site.

## License

(C) 2017-2020 GoodData Corporation

This project is under commercial license. See [LICENSE](LICENSE).
