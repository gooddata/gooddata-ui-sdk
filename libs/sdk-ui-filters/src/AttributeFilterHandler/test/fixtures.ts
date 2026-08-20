// (C) 2019-2026 GoodData Corporation

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type ElementsQueryOptionsElementsSpecification,
    type IAnalyticalBackend,
    type IElementsQuery,
    type IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttributeElement,
    type IAttributeFilter,
    type IMeasure,
    type IRelativeDateFilter,
    type ObjRef,
    attributeIdentifier,
    idRef,
    measureIdentifier,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { type IAttributeFilterHandlerOptions, newAttributeFilterHandler } from "../factory.js";

export const particularAttributeElements: ElementsQueryOptionsElementsSpecification = {
    values: ["TouchAll", "WonderKid"],
};

export const anotherParticularAttributeElements: ElementsQueryOptionsElementsSpecification = {
    values: ["PhoenixSoft"],
};

export const limitingAttributeFilters: IElementsQueryAttributeFilter[] = [
    {
        attributeFilter: newPositiveAttributeFilter(ReferenceMd.Product.Name, {
            uris: ["460488"],
        }),
        overAttribute: idRef("attr.opportunitysnapshot.id"),
    },
];

export const limitingMeasures: IMeasure[] = [ReferenceMd.Amount];

export const limitingDateFilters: IRelativeDateFilter[] = [
    newRelativeDateFilter(ReferenceMd.DateDatasets.Snapshot.SnapshotDate.identifier, "GDC.time.date", 0, -1),
];

const productNameAttrId = attributeIdentifier(ReferenceMd.Product.Name)!;
const amountMeasureId = measureIdentifier(ReferenceMd.Amount)!;
const snapshotDateId = ReferenceMd.DateDatasets.Snapshot.SnapshotDate.identifier;
const productDefaultId = attributeIdentifier(ReferenceMd.Product.Default)!;

const backend = recordedBackend(ReferenceRecordings.Recordings, {
    attributeElementsFiltering: {
        attributeFilters: {
            [productNameAttrId]: (_element: IAttributeElement, index: number) => {
                return (index + 1) % 2 === 0;
            },
            [productDefaultId]: (_element: IAttributeElement, index: number) => {
                return (index + 1) % 2 === 0;
            },
        },
        measures: {
            [amountMeasureId]: (_element: IAttributeElement, index: number) => {
                return (index + 1) % 3 === 0;
            },
        },
        dateFilters: {
            [snapshotDateId]: (_element: IAttributeElement, index: number) => {
                return (index + 1) % 4 === 0;
            },
        },
    },
});

const workspace = "testWorkspace";

const positiveAttributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
    uris: ["165678", "165847"],
});

const emptyPositiveAttributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
    uris: [],
});

const negativeAttributeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, {
    uris: ["165678", "165847"],
});

const nonExistingAttributeFilter = newPositiveAttributeFilter("non-existing-displayForm", {
    uris: [],
});

const createDummyElements = (
    createElement: (idx: number) => IAttributeElement,
    size: number,
): IAttributeElement[] =>
    new Array(size).fill(null).reduce((result: IAttributeElement[], _, index) => {
        result.push(createElement(index));
        return result;
    }, []);

export const staticElements = createDummyElements((index) => {
    return {
        title: `Element ${index}`,
        uri: `/element?id=${index}`,
    };
}, 100);

// This actually does not filter elements in mockingbirg
// It just triggers usage of the attributeElementsFiltering
export const hiddenElements = ["/hidden-element"];

export const newTestAttributeFilterHandler = (
    useCase: "positive" | "negative" | "nonExisting" | "static" | "hidden",
) => {
    let filter: IAttributeFilter = positiveAttributeFilter;
    const options: IAttributeFilterHandlerOptions = {
        selectionMode: "multi",
    };

    if (useCase === "positive") {
        filter = positiveAttributeFilter;
    } else if (useCase === "negative") {
        filter = negativeAttributeFilter;
    } else if (useCase === "nonExisting") {
        filter = nonExistingAttributeFilter;
    } else if (useCase === "static") {
        filter = emptyPositiveAttributeFilter;
        options.staticElements = staticElements;
    } else if (useCase === "hidden") {
        filter = positiveAttributeFilter;
        options.hiddenElements = hiddenElements;
    }

    return newAttributeFilterHandler(backend, workspace, filter, options);
};

export const positiveAttributeFilterDefaultDF = newPositiveAttributeFilter(ReferenceMd.Product.Default, {
    uris: ["165678", "165847"],
});

export const emptyPositiveAttributeFilterDefaultDF = newPositiveAttributeFilter(ReferenceMd.Product.Default, {
    uris: [],
});

export const negativeAttributeFilterDefaultDF = newNegativeAttributeFilter(ReferenceMd.Product.Default, {
    uris: ["165678", "165847"],
});

export const newTestAttributeFilterHandlerWithAttributeFilter = (
    attributeFilter: IAttributeFilter,
    advancedOptions?: { staticElements?: IAttributeElement[]; hiddenElements?: string[] },
) => {
    const options: IAttributeFilterHandlerOptions = {
        selectionMode: "multi",
        ...(advancedOptions ?? {}),
    };

    return newAttributeFilterHandler(backend, workspace, attributeFilter, options);
};

type TestFunction = (...args: unknown[]) => unknown;

const isFunction = (value: unknown): value is TestFunction => typeof value === "function";

const isElementsQuery = (value: unknown): value is IElementsQuery =>
    typeof value === "object" && value !== null && isFunction((value as { query?: unknown }).query);

/**
 * Facade of `target` with a single method replaced.
 *
 * A proxy is used instead of an object spread, because the backend services are class instances -
 * their methods live on the prototype and a spread would drop them.
 */
const withReplacedMethod = <T extends object, K extends keyof T & string>(
    target: T,
    method: K,
    replacement: T[K],
): T =>
    new Proxy(target, {
        get(proxiedTarget, property) {
            if (property === method) {
                return replacement;
            }

            const value = Reflect.get(proxiedTarget, property, proxiedTarget);
            return isFunction(value) ? value.bind(proxiedTarget) : value;
        },
    });

/**
 * Elements query that rejects with the queued errors, one error per query() call, and delegates to
 * the recorded implementation once the queue is empty.
 */
const withQueuedElementsLoadFailures = (elementsQuery: IElementsQuery, errors: unknown[]): IElementsQuery =>
    new Proxy(elementsQuery, {
        get(proxiedTarget, property) {
            const value = Reflect.get(proxiedTarget, property, proxiedTarget);

            if (!isFunction(value)) {
                return value;
            }

            if (property === "query") {
                return (...args: unknown[]) =>
                    errors.length > 0 ? Promise.reject(errors.shift()) : value.apply(proxiedTarget, args);
            }

            return (...args: unknown[]) => {
                const result = value.apply(proxiedTarget, args);
                // The builder methods return the query itself, so the result has to be wrapped again
                // to keep the interception in place for the rest of the chain.
                return isElementsQuery(result) ? withQueuedElementsLoadFailures(result, errors) : result;
            };
        },
    });

const backendWithQueuedElementsLoadFailures = (errors: unknown[]): IAnalyticalBackend =>
    withReplacedMethod(backend, "workspace", (workspaceId: string) => {
        const analyticalWorkspace = backend.workspace(workspaceId);

        return withReplacedMethod(analyticalWorkspace, "attributes", () => {
            const attributes = analyticalWorkspace.attributes();

            return withReplacedMethod(attributes, "elements", () => {
                const elements = attributes.elements();

                return withReplacedMethod(elements, "forDisplayForm", (ref: ObjRef) =>
                    withQueuedElementsLoadFailures(elements.forDisplayForm(ref), errors),
                );
            });
        });
    });

/**
 * Handler whose elements loads can be made to fail on demand.
 *
 * The failure is injected into the backend the handler talks to, so that the tests of the error
 * paths do not have to mock the internal loadElements module. A module mock cannot be relied on
 * here, because the test files share the module registry (see `isolate: false` in vitest.config.ts)
 * and the module is already evaluated unmocked by the time such a suite runs.
 */
export const newTestAttributeFilterHandlerWithElementsLoadFailures = (attributeFilter: IAttributeFilter) => {
    const errors: unknown[] = [];

    return {
        attributeFilterHandler: newAttributeFilterHandler(
            backendWithQueuedElementsLoadFailures(errors),
            workspace,
            attributeFilter,
            { selectionMode: "multi" },
        ),
        /**
         * Makes the next elements load reject with the provided error. Call it repeatedly to queue up
         * more failures, one per load - the equivalent of several mockRejectedValueOnce() calls.
         */
        failNextElementsLoad: (error: unknown) => {
            errors.push(error);
        },
    };
};
