// (C) 2019-2022 GoodData Corporation
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    ElementsQueryOptionsElementsSpecification,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeFilter,
    idRef,
    newPositiveAttributeFilter,
    attributeIdentifier,
    IMeasure,
    measureIdentifier,
    IRelativeDateFilter,
    newRelativeDateFilter,
    newNegativeAttributeFilter,
    IAttributeElement,
} from "@gooddata/sdk-model";

import { IAttributeFilterHandlerOptions, newAttributeFilterHandler } from "../factory.js";

export const particularAttributeElements: ElementsQueryOptionsElementsSpecification = {
    uris: [
        "/gdc/md/referenceworkspace/obj/1054/elements?id=460491",
        "/gdc/md/referenceworkspace/obj/1054/elements?id=166497",
    ],
};

export const anotherParticularAttributeElements: ElementsQueryOptionsElementsSpecification = {
    uris: ["/gdc/md/referenceworkspace/obj/1054/elements?id=166339"],
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
    newRelativeDateFilter(ReferenceMd.DateDatasets.Snapshot.Date.identifier, "GDC.time.date", 0, -1),
];

const backend = recordedBackend(ReferenceRecordings.Recordings, {
    attributeElementsFiltering: {
        attributeFilters: {
            [attributeIdentifier(ReferenceMd.Product.Name)]: (_element, index) => {
                return (index + 1) % 2 === 0;
            },
        },
        measures: {
            [measureIdentifier(ReferenceMd.Amount)]: (_element, index) => {
                return (index + 1) % 3 === 0;
            },
        },
        dateFilters: {
            [ReferenceMd.DateDatasets.Snapshot.Date.identifier]: (_element, index) => {
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

const staticElements = createDummyElements((index) => {
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
    let filter: IAttributeFilter;
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
