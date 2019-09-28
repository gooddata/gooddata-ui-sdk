"use strict";

/**
 * When using the PNPM package manager, you can use pnpmfile.js to workaround
 * dependencies that have mistakes in their package.json file.  (This feature is
 * functionally similar to Yarn's "resolutions".)
 *
 * For details, see the PNPM documentation:
 * https://pnpm.js.org/docs/en/hooks.html
 *
 * IMPORTANT: SINCE THIS FILE CONTAINS EXECUTABLE CODE, MODIFYING IT IS LIKELY TO INVALIDATE
 * ANY CACHED DEPENDENCY ANALYSIS.  After any modification to pnpmfile.js, it's recommended to run
 * "rush update --full" so that PNPM will recalculate all version selections.
 */
module.exports = {
  hooks: {
    readPackage
  }
};

const TYPESCRIPT_VERSION = "3.6.3";

/**
 * This hook is invoked during installation before a package's dependencies
 * are selected.
 * The `packageJson` parameter is the deserialized package.json
 * contents for the package that is about to be installed.
 * The `context` parameter provides a log() function.
 * The return value is the updated object.
 */
function readPackage(packageJson, context) {

  // // The karma types have a missing dependency on typings from the log4js package.
  // if (packageJson.name === '@types/karma') {
  //  context.log('Fixed up dependencies for @types/karma');
  //  packageJson.dependencies['log4js'] = '0.6.38';
  // }

  if (packageJson.name === "@gooddata/goodstrap") {
    /*
     * js code produced by goodstrap build requires small functions from babel-runtime/helpers; yet the
     * babel-runtime is only a dev dependency.
     *
     * see here: https://babeljs.io/docs/en/6.26.3/babel-plugin-transform-runtime#installation
     *
     * correcting the status
     */
    context.log("Fixed up dependencies for @gooddata/goodstrap@" + packageJson.version +
        " ; switching babel-runtime to prod dependency; version: " + packageJson.devDependencies["babel-runtime"]);

    packageJson.dependencies["babel-runtime"] = packageJson.devDependencies["babel-runtime"];
  }

  return packageJson;
}
