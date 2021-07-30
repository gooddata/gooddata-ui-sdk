# Custom Wiremock extensions

To be able to run tests locally against a real backend, we need to modify some requests and responses.

-   Change request Origin and Referer header fields from localhost to the target backend - done by RequestHeadersTransformer
-   Remove domain field in cookies coming from the backend so that it's applied even on localhost; Remove X-GDC and Date headers - done by ResponseHeadersTransformer

In case you need to change and compile these extensions

-   install Java JDK 8
-   download https://repo1.maven.org/maven2/com/github/tomakehurst/wiremock-jre8-standalone/2.27.2/wiremock-jre8-standalone-2.27.2.jar to this directory
-   run `./build.sh`
