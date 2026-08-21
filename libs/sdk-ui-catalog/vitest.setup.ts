// (C) 2023-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/no-empty-object-type

import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

import { strictBarrel } from "@gooddata/util";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // @ts-expect-error This is correct
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Assertion<T = unknown> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

/**
 * The mocks below all fix the same problem: this library imports a handful of small things from very
 * large barrels, and a barrel import evaluates the whole package. Together they are the dominant cost
 * of the run's `import` phase. Each one hands over the REAL implementation, reached directly instead
 * of through the barrel, so behaviour is unchanged — this is a routing change, not a stub.
 *
 * The obvious alternative, handing these packages to vitest's dependency optimizer to be pre-bundled,
 * does not work here: with `resolve.preserveSymlinks` on, the optimizer cannot resolve the
 * second-level transitive dependencies of pnpm-linked packages and leaves them as bare externals.
 * Every CommonJS package among them (react-intl, hoist-non-react-statics, prop-types,
 * @babel/runtime/*, json-stable-stringify, ...) then dies at runtime on "Calling `require` for X in
 * an environment that doesn't expose the `require` function".
 *
 * They live here rather than in individual test files on purpose: with a non-isolated run every file
 * shares one module graph, so a `vi.mock` in one file could not apply to a graph the other files had
 * already evaluated. Registered in the setup, the whole run sees one consistent module.
 *
 * The deep modules are addressed by file path because these packages' `exports` maps expose only
 * their barrels.
 *
 * None of them can degrade silently: `strictBarrel` (`@gooddata/util`) wraps each stand-in so that
 * importing something it does not carry throws on the spot, naming the missing export.
 */

/**
 * `@gooddata/sdk-ui-ext/internal` pulls in every pluggable visualization; the only thing taken from
 * it is the translation layer (`src/localization/translations.ts`). sdk-ui is what ext's own
 * `resolveMessages` layers underneath its strings, so resolving these three exports from sdk-ui
 * keeps every sdk-ui message the rendered components ask for and drops only ext's own
 * `objectShare.*` namespace — which belongs to the share dialog below, that no test opens.
 */
vi.mock("@gooddata/sdk-ui-ext/internal", async () => {
    const { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, resolveMessages } = await import("@gooddata/sdk-ui");

    return strictBarrel("@gooddata/sdk-ui-ext/internal", {
        DEFAULT_LANGUAGE,
        DEFAULT_MESSAGES,
        resolveMessages,
    });
});

/**
 * Importing `@gooddata/sdk-ui-semantic-search` evaluates the whole search UI (CodeMirror, the tree
 * view, the item renderers) for the sake of one hook,
 * `useSemanticSearch` (`src/catalogItem/useCatalogItemSemanticSearch.ts`). The hook's own module is
 * cheap: react, sdk-model and sdk-ui, all already loaded. Keeping the real hook matters —
 * `useCatalogItemSemanticSearch.test.tsx` drives it through a backend stub and asserts on the
 * queries it issues.
 */
vi.mock("@gooddata/sdk-ui-semantic-search", async () => {
    const useSemanticSearch =
        await import("./node_modules/@gooddata/sdk-ui-semantic-search/esm/hooks/useSemanticSearch.js");

    return strictBarrel("@gooddata/sdk-ui-semantic-search", { ...useSemanticSearch });
});

/**
 * The `@gooddata/sdk-ui-ext` barrel is imported for three small share helpers plus the share dialog
 * behind the `lazy()` boundary in `CatalogItemShareDialog.tsx`. All four come from their own modules
 * here; the helpers' imports (sdk-model, sdk-backend-spi) are type-only or already loaded.
 */
vi.mock("@gooddata/sdk-ui-ext", async () => {
    const [accessSummary, accessErrors, controllerHelpers, objectShareDialog] = await Promise.all([
        import("./node_modules/@gooddata/sdk-ui-ext/esm/share/accessSummary.js"),
        import("./node_modules/@gooddata/sdk-ui-ext/esm/share/accessErrors.js"),
        import("./node_modules/@gooddata/sdk-ui-ext/esm/share/objectShareController.helpers.js"),
        import("./node_modules/@gooddata/sdk-ui-ext/esm/share/ObjectShareDialog.js"),
    ]);

    return strictBarrel("@gooddata/sdk-ui-ext", {
        accessListToSummary: accessSummary.accessListToSummary,
        isPermissionsNotAvailable: accessErrors.isPermissionsNotAvailable,
        sortShareableLabels: controllerHelpers.sortShareableLabels,
        ObjectShareDialog: objectShareDialog.ObjectShareDialog,
    });
});

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

// some tests need createRange function
document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = vi.fn();

    range.getClientRects = () => {
        return {
            item: () => null,
            length: 0,
            [Symbol.iterator]: vi.fn(),
        };
    };

    return range;
};

// Mock for ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
};

global.IntersectionObserver = class IntersectionObserver {
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
    takeRecords() {
        return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
};
