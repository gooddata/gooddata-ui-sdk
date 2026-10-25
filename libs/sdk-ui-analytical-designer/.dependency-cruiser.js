// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
} from "../../common/config/dep-cruiser/default.config.js";

export default {
    forbidden: [
        {
            name: "no-state-path-modules",
            severity: "error",
            comment:
                "AD's state is addressed by PROPERTY off the typed root (store/types.ts#IAppState), " +
                "never by path. `constants/state_paths.ts` and the twelve domain `*_paths.ts` modules " +
                "were deleted at row 12.4 of docs/MIGRATION_AD_REDUX_TOOLKIT.md (§4.8.4 bans " +
                "path-addressed Redux access). Put the value in the owning domain's state type and " +
                "read it through that domain's selector.",
            from: { path: "^src" },
            to: { path: "^src/(constants/state_paths|.*_paths)\\.ts$" },
        },
        {
            name: "no-root-state-shim",
            severity: "error",
            comment:
                "`utils/state_access.ts` — the dual-mode root path shim — was deleted at row 12.4. " +
                "Deep addressing INSIDE a domain value is a different concern and lives in " +
                "`utils/value_access.ts`; the root itself is addressed by property.",
            from: { path: "^src" },
            to: { path: "^src/utils/state_access\\.ts$" },
        },
        {
            name: "no-root-state-in-value-modules",
            severity: "error",
            comment:
                "A value-level module (*_state / *_types / *_helpers / *_operations) must not name " +
                "the ROOT state type: a pure helper takes typed domain values plus explicit " +
                "arguments, and its signature is its documentation (§4.8.2). It is also what keeps " +
                "the reducer-module import graph acyclic (the 11.5/11.6 cycles). The two operation " +
                "input readers that legitimately read the root are excluded by name.",
            from: {
                path: "^src/.*_(state|types|helpers|operations)\\.ts$",
                pathNot: [
                    "^src/reducers/initial_state\\.ts$",
                    "^src/store/buckets/buckets_operation_inputs\\.ts$",
                    "^src/store/_infra/time_travel_state\\.ts$",
                    "(^|/)test/",
                ],
            },
            to: { path: "^src/store/types\\.ts$" },
        },
        {
            name: "reducer-owns-one-slice",
            severity: "error",
            comment:
                "A reducer/slice module must not import another domain's selectors: it owns ONE " +
                "slice, receives only that slice, calls no selectors and orchestrates nothing " +
                "(§4.8.1). Cross-domain composition is explicit in a saga.",
            from: {
                path: "^src/.*_(reducer|slice|slices)\\.ts$",
                pathNot: ["(^|/)test/"],
            },
            to: { path: "^src/(selectors|store/.*)/.*_selectors?\\.ts$" },
        },
        // Override not-to-dev-dep to allow DEBUG-only imports in Root.tsx and create_store.ts
        ...DefaultRules.filter((r) => r.name !== "not-to-dev-dep"),
        ...DefaultSdkRules,
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
                pathNot: [
                    "\\.spec\\.(js|ts|ls|coffee|litcoffee|coffee\\.md)$",
                    "src/Root\\.tsx$",
                    "src/create_store\\.ts$",
                ],
            },
            to: {
                pathNot: ["react"],
                dependencyTypes: ["npm-dev"],
            },
        },
    ],
    options: {
        ...DefaultOptions,
        doNotFollow: {
            ...DefaultOptions.doNotFollow,
            // Also exclude gdc-* sibling libs from being followed
            path: "((.*(node_modules|__mocks__|test|tests).*)|../(api-|sdk-|util-|gdc-).*)",
        },
        exclude: {
            // Also exclude gdc-* sibling libs esm output
            path: "((.*(__mocks__|test|tests).*)|../(api-|sdk-|util-|gdc-).*)",
        },
    },
};
