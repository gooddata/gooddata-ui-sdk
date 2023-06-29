/**
 * Rules suggested by Dependency Cruiser - keeping all of them as defaults for everyone to use
 */
const DefaultRules = [
    {
        name: "no-circular",
        severity: "error",
        comment:
            "This dependency is part of a circular relationship. You might want to revise " +
            "your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ",
        from: {},
        to: {
            circular: true,
        },
    },
    {
        name: "no-orphans",
        severity: "info",
        comment:
            "This is an orphan module - it's likely not used (anymore?). Either use it or remove it. If it's " +
            "logical this module is an orphan (i.e. it's a config file), add an exception for it in your " +
            "dependency-cruiser configuration.",
        from: {
            orphan: true,
            pathNot: "\\.d\\.ts$",
        },
        to: {},
    },
    {
        name: "no-deprecated-core",
        comment:
            "A module depends on a node core module that has been deprecated. Find an alternative - these are " +
            "bound to exist - node doesn't deprecate lightly.",
        severity: "warn",
        from: {},
        to: {
            dependencyTypes: ["core"],
            path: "^(punycode|domain|constants|sys|_linklist|_stream_wrap)$",
        },
    },
    {
        name: "not-to-deprecated",
        comment:
            "This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later " +
            "version of that module, or find an alternative. Deprecated modules are a security risk.",
        severity: "warn",
        from: {},
        to: {
            dependencyTypes: ["deprecated"],
        },
    },
    {
        name: "no-non-package-json",
        severity: "error",
        comment:
            "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
            "That's problematic as the package either (1) won't be available on live (2 - worse) will be " +
            "available on live with an non-guaranteed version. Fix it by adding the package to the dependencies " +
            "in your package.json.",
        from: {},
        to: {
            dependencyTypes: ["npm-no-pkg", "npm-unknown"],
        },
    },
    {
        name: "not-to-unresolvable",
        comment:
            "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
            "module: add it to your package.json. In all other cases you likely already know what to do.",
        severity: "error",
        from: {},
        to: {
            couldNotResolve: true,
        },
    },
    {
        name: "no-duplicate-dep-types",
        comment:
            "Likely this module depends on an external ('npm') package that occurs more than once " +
            "in your package.json i.e. bot as a devDependencies and in dependencies. This will cause " +
            "maintenance problems later on.",
        severity: "warn",
        from: {},
        to: {
            pathNot: ["react"], // react is often both peer and dev dependency (for tests) and that is ok
            moreThanOneDependencyType: true,
        },
    },

    /* rules you might want to tweak for your specific situation: */
    {
        name: "not-to-test",
        comment:
            "This module depends on code within a folder that should only contain tests. As tests don't " +
            "implement functionality this is odd. Either you're writing a test outside the test folder " +
            "or there's something in the test folder that isn't a test.",
        severity: "error",
        from: {
            pathNot: "^test",
        },
        to: {
            path: "^test",
        },
    },
    {
        name: "not-to-spec",
        comment:
            "This module depends on a spec (test) file. The sole responsibility of a spec file is to test code. " +
            "If there's something in a spec that's of use to other modules, it doesn't have that single " +
            "responsibility anymore. Factor it out into (e.g.) a separate utility/ helper or a mock.",
        severity: "error",
        from: {},
        to: {
            path: "\\.spec\\.(js|ts|ls|coffee|litcoffee|coffee\\.md)$",
        },
    },
    {
        name: "not-to-dev-dep",
        severity: "error",
        comment:
            "This module depends on an npm package from the 'devDependencies' section of your " +
            "package.json. It looks like something that ships to production, though. To prevent problems " +
            "with npm packages that aren't there on production declare it (only!) in the 'dependencies'" +
            "section of your package.json. If this module is development only - add it to the " +
            "from.pathNot re of the not-to-dev-dep rule in the dependency-cruiser configuration",
        from: {
            path: "^(src|app|lib)",
            pathNot: "\\.spec\\.(js|ts|ls|coffee|litcoffee|coffee\\.md)$",
        },
        to: {
            pathNot: ["react"], // react is often both peer and dev dependency (for tests) and this triggers false positives
            dependencyTypes: ["npm-dev"],
        },
    },
    {
        name: "optional-deps-used",
        severity: "info",
        comment:
            "This module depends on an npm package that is declared as an optional dependency " +
            "in your package.json. As this makes sense in limited situations only, it's flagged here. " +
            "If you're using an optional dependency here by design - add an exception to your" +
            "depdency-cruiser configuration.",
        from: {},
        to: {
            dependencyTypes: ["npm-optional"],
        },
    },
    {
        name: "peer-deps-used",
        comment:
            "This module depends on an npm package that is declared as a peer dependency " +
            "in your package.json. This makes sense if your package is e.g. a plugin, but in " +
            "other cases - maybe not so much. If the use of a peer dependency is intentional " +
            "add an exception to your dependency-cruiser configuration.",
        severity: "warn",
        from: {},
        to: {
            pathNot: ["react"], // react is often peer dependency and we are aware of that
            dependencyTypes: ["npm-peer"],
        },
    },
    {
        name: "not-to-whole-lodash",
        comment:
            "This module depends on the whole lodash. Please use individual imports - eg." +
            ' `import isEqual from "lodash/isEqual";` instead of `import { isEqual } from "lodash";`' +
            "This helps to keep the resulting bundles smaller for the users",
        severity: "error",
        from: {},
        to: { path: "lodash/lodash.js", dependencyTypes: ["npm"] },
    },
    noLodashGet(),
    {
        name: "not-to-whole-date-fns",
        comment:
            "This module depends on the whole date-fns. Please use individual imports - eg." +
            ' `import format from "date-fns/format";` instead of `import { format } from "date-fns";`' +
            "This helps to keep the resulting bundles smaller for the users",
        severity: "error",
        from: {},
        to: { path: "date-fns/index.js", dependencyTypes: ["npm"] },
    },
];

const DefaultOptions = {
    /*
     * Explicitly do not follow & exclude dependencies to:
     *
     * - node_modules, mocks, test code - obvious
     * - other libraries in monorepo, which the dep cruiser will see as "../<lib>"
     */
    doNotFollow: {
        path: "((.*(node_modules|__mocks__|test|tests).*)|../(api-|sdk-|util/).*)",
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-bundled", "npm-no-pkg"],
    },

    exclude: {
        path: "((.*(__mocks__|test|tests).*)|../(api-|sdk-|util/).*)",
        //, dynamic: true
    },

    /* pattern specifying which files to include (regular expression)
       dependency-cruiser will skip everything not matching this pattern
    */
    // , includeOnly : ''

    /* list of module systems to cruise */
    // , moduleSystems: ['amd', 'cjs', 'es6', 'tsd']

    /* prefix for links in html and svg output (e.g. https://github.com/you/yourrepo/blob/develop/) */
    // , prefix: ''

    /* if true detect dependencies that only exist before typescript-to-javascript compilation */
    tsPreCompilationDeps: true,

    /* if true combines the package.jsons found from the module up to the base
       folder the cruise is initiated from. Useful for how (some) mono-repos
       manage dependencies & dependency definitions.
     */
    // , combinedDependencies: false

    /* if true leave symlinks untouched, otherwise use the realpath */
    // , preserveSymlinks: false

    /* Typescript project file ('tsconfig.json') to use for
       (1) compilation and
       (2) resolution (e.g. with the paths property)

       The (optional) fileName attribute specifies which file to take (relative to
       dependency-cruiser's current working directory). When not provided
       defaults to './tsconfig.json'.
     */
    tsConfig: {
        fileName: "./tsconfig.json",
    },

    /* Webpack configuration to use to get resolve options from.

      The (optional) fileName attribute specifies which file to take (relative to dependency-cruiser's
      current working directory. When not provided defaults to './webpack.conf.js'.

      The (optional) `env` and `args` attributes contain the parameters to be passed if
      your webpack config is a function and takes them (see webpack documentation
      for details)
     */
    // , webpackConfig: {
    //    fileName: './webpack.conf.js'
    //    , env: {}
    //    , args: {}
    // }

    /* How to resolve external modules - use "yarn-pnp" if you're using yarn's Plug'n'Play.
       otherwise leave it out (or set to the default, which is 'node_modules')
    */
    // , externalModuleResolutionStrategy: 'node_modules'
    enhancedResolveOptions: {
        mainFields:["main","types"]
    }
};

const DontImportRootIndex = {
    name: "global-index-import",
    comment:
        "Code inside the package must not depend on package's main index. Rationale: introduces circular dependencies.",
    severity: "error",
    from: {},
    to: {
        path: "src/index.ts",
    },
};

const AvoidNonStandardImports = {
    name: "non-standard-import",
    comment:
        "This module imports file with non-standard file extension." +
        "Import static assets to TypeScript files is not allowed.",
    severity: "error",
    from: {},
    to: {
        pathNot: "^.*.(tsx?|jsx?|json)$",
    },
};

const DefaultSdkRules = [DontImportRootIndex];
const PublicLibraryRules = [AvoidNonStandardImports];

/**
 * Creates dep cruiser rule which will ensure that code in particular directory does not import code from anywhere
 * else apart from its own directory tree.
 *
 */
function isolatedSubmodule(module, dir) {
    return {
        name: `${module}-isolated`,
        comment: `${module} in ${dir} should be isolated - it must only import code from its own directory subtree, external packages or from "locales.ts" file.`,
        severity: "error",
        from: {
            path: dir,
        },
        to: {
            pathNot: `^(${dir})|(src/locales.ts)`,
            dependencyTypes: ["local"],
        },
    };
}

/**
 * Creates dep cruiser rule which will ensure that code in particular directory will only import files from its
 * subtree, the explicitly specified dependencies through their index, and external packages.
 *
 * @param module module name
 * @param dir directory with module source code
 * @param deps array of directories with code that the module depends on; by default, when a directory dep
 *  is provided, the rule assumes it is another module with its own index.ts; this is most often desired. however
 *  some directories are not necessarily modules nor they will be and creating their own index is overkill. for
 *  those situations, specify directory as 'src/something/*' and the rule will be more permissive, allowing imports
 *  from anywhere in that directory (including subdirs)
 * @returns {{severity: string, name: string, comment: string, from: {path: *}, to: {pathNot: string}}}
 */
function moduleWithDependencies(module, dir, deps) {
    const allowedDeps = [dir].concat(
        deps.map((dep) => {
            if (dep.endsWith("/*")) {
                return `${dep.slice(0, -2)}/.*$`;
            }
            // for single file dependencies, return them as-is
            if (dep.match(/\.tsx?$/)) {
                return dep;
            }
            return `${dep}/index\.ts(x)?$`;
        }),
    );

    return {
        name: `${module}-dependencies`,
        comment: `${module} in ${dir} must only depend on itself, code in ${deps.join(
            ", ",
        )} (through their index), external packages and "locales.ts" file.`,
        severity: "error",
        from: {
            path: dir,
        },
        to: {
            pathNot: `^(${allowedDeps.join("|")})|(src/locales.ts)`,
            dependencyTypes: ["local"],
        },
    };
}

/**
 * Creates dep cruiser rule which will ensure that code in particular package will not import lodash/get.
 * Optionally, you can specify exceptions where the lodash/get will be allowed (if there is no workaround there).
 * @param {RegExp|String|RegExp[]|String[]} exceptions exceptions where importing the lodash/get will be allowed
 * @returns
 */
function noLodashGet(exceptions) {
    const from = exceptions ? { pathNot: exceptions } : {};
    return {
        name: "not-to-lodash-get",
        comment:
            "This module depends on the lodash/get function. Please use the ?. and ?? operators instead." +
            "This helps with keeping the type information sane and makes refactors easier (less magic strings)",
        severity: "error",
        from,
        to: { path: "lodash/get.js", dependencyTypes: ["npm"] },
    };
}

module.exports = {
    DefaultRules,
    DefaultOptions,
    DefaultSdkRules,
    PublicLibraryRules,
    isolatedSubmodule,
    moduleWithDependencies,
    noLodashGet,
};
