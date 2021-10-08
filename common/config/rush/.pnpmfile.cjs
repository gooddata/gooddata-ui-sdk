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

const TYPESCRIPT_VERSION = "4.0.2";

/**
 * This hook is invoked during installation before a package's dependencies
 * are selected.
 * The `packageJson` parameter is the deserialized package.json
 * contents for the package that is about to be installed.
 * The `context` parameter provides a log() function.
 * The return value is the updated object.
 */
function readPackage(packageJson, context) {
  if (packageJson.name === '@microsoft/api-extractor') {
    // context.log('Overwriting api-extract typescript version to ' + TYPESCRIPT_VERSION);
    packageJson.dependencies['typescript'] = TYPESCRIPT_VERSION;
  }

  // bump node-forge dependency of heroku-exec-utils to a safer version to fix audit (heroku-exec-utils does not use any of the functions missing in node-forge 0.10.0)
  if (packageJson.name === 'heroku-exec-util') {
    packageJson.dependencies['node-forge'] = "0.10.0";
  }

  // bump urijs dependency of @heroku-cli/plugin-apps-v5 to a safer version (it is a patch upgrade, should be safe)
  if (packageJson.name === '@heroku-cli/plugin-apps-v5' || packageJson.name === '@heroku-cli/plugin-apps') {
    packageJson.dependencies['urijs'] = "1.19.7";
  }

  return packageJson;
}
