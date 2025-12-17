// (C) 2019-2025 GoodData Corporation
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type ElementsQueryOptionsElementsSpecification,
    type IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttributeElement,
    type IAttributeFilter,
    type IMeasure,
    type IRelativeDateFilter,
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
            uris: ["/gdc/md/referenceworkspace/obj/1086/elements?id=460488"],
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
    uris: [
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165678",
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165847",
    ],
});

const emptyPositiveAttributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
    uris: [],
});

const negativeAttributeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, {
    uris: [
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165678",
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165847",
    ],
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
    uris: [
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165678",
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165847",
    ],
});

export const emptyPositiveAttributeFilterDefaultDF = newPositiveAttributeFilter(ReferenceMd.Product.Default, {
    uris: [],
});

export const negativeAttributeFilterDefaultDF = newNegativeAttributeFilter(ReferenceMd.Product.Default, {
    uris: [
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165678",
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165847",
    ],
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
