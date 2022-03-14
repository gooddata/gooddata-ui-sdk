#!/bin/sh
rm -rf gooddata-extensions.jar
mkdir bin
javac -Xlint -cp  wiremock-jre8-standalone-2.27.2.jar -d bin src/org/gooddata/extensions/*.java
cd bin
jar cf gooddata-extensions.jar org
mv gooddata-extensions.jar ..
cd ..
rm -rf bin