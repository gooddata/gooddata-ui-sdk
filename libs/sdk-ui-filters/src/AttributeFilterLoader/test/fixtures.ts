// (C) 2019-2022 GoodData Corporation
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    IAttributeFilter,
    idRef,
    newPositiveAttributeFilter,
    attributeIdentifier,
    IMeasure,
    measureIdentifier,
    IRelativeDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { newAttributeFilterHandler } from "../factory";

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

const negativeAttributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
    uris: [
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165678",
        "/gdc/md/referenceworkspace/obj/1054/elements?id=165847",
    ],
});

const nonExistingAttributeFilter = newPositiveAttributeFilter("non-existing-displayForm", {
    uris: [],
});

export const newTestAttributeFilterHandler = (useCase: "positive" | "negative" | "nonExisting") => {
    let filter: IAttributeFilter;
    if (useCase === "positive") {
        filter = positiveAttributeFilter;
    } else if (useCase === "negative") {
        filter = negativeAttributeFilter;
    } else if (useCase === "nonExisting") {
        filter = nonExistingAttributeFilter;
    }

    return newAttributeFilterHandler(backend, workspace, filter, {
        selectionMode: "multi",
    });
};
