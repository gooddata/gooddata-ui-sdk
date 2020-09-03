#! /bin/bash
fswatch -r src/ | (while read;
do
 echo "Running prepublish.."
 npm run prepublishOnly
 cp -r ./dist ~/gd/gdc-analytical-designer/node_modules/\@gooddata/sdk-ui-charts
 echo "Done!\n"
done)
