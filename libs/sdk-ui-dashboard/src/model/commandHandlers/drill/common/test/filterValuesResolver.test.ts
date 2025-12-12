// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { decoratedBackend } from "@gooddata/sdk-backend-base";
import { dummyBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IElementsQueryFactory,
    type IWorkspaceAttributesService,
} from "@gooddata/sdk-backend-spi";
import {
    type IAbsoluteDateFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRelativeDateFilter,
    attributeDisplayFormRef,
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { resolveFilterValues } from "../filterValuesResolver.js";

describe("resolveFilterValues", () => {
    it("should return resolved absolute date limits", async () => {
        const absoluteDateFilter: IAbsoluteDateFilter = newAbsoluteDateFilter(
            uriRef("gdc/md/dfuri"),
            "2020-01-01",
            "2020-02-01",
        );
        const result = await resolveFilterValues([absoluteDateFilter]);
        expect(result).toMatchSnapshot();
    });

    it("should return resolved attribute filter elements by value", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "referenceworkspace";
        const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);
        const attributeFilter: IPositiveAttributeFilter = newPositiveAttributeFilter(testAttributeRef, {
            values: ["Educationly"],
        });
        const result = await resolveFilterValues([attributeFilter], backend, workspace);
        expect(result).toMatchSnapshot();
    });

    it("should resolved multiple attribute filters", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "referenceworkspace";
        const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);
        const testAttributeRef2 = attributeDisplayFormRef(ReferenceMd.Department.Default);
        const attributeFilter1: IPositiveAttributeFilter = newPositiveAttributeFilter(testAttributeRef, {
            values: ["Educationly"],
        });

        const attributeFilter2: IPositiveAttributeFilter = newPositiveAttributeFilter(testAttributeRef2, {
            values: ["Direct Sales"],
        });

        const result = await resolveFilterValues([attributeFilter1, attributeFilter2], backend, workspace);
        expect(result).toMatchSnapshot();
    });

    it("should resolved ALL attribute filter to empty values", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "referenceworkspace";
        const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);
        const allAttributeFilter: INegativeAttributeFilter = newNegativeAttributeFilter(testAttributeRef, {
            values: [],
        });

        const result = await resolveFilterValues([allAttributeFilter], backend, workspace);
        expect(result).toMatchSnapshot();
    });

    it("should resolve relative date filter", async () => {
        const workspace = "referenceworkspace";
        const dummy: IAnalyticalBackend = dummyBackend();
        const elementsQueryFactory = {
            forFilter: () => ({
                query: () => ({
                    limit: 50,
                    offset: 0,
                    totalCount: 4,
                    items: [
                        { title: "2021-08-01" },
                        { title: "2021-08-02" },
                        { title: "2021-08-03" },
                        { title: "2021-08-04" },
                    ],
                }),
            }),
        } as unknown as IElementsQueryFactory;

        const attributesDecorator = {
            elements: () => elementsQueryFactory,
        } as IWorkspaceAttributesService;

        const dateFilter: IRelativeDateFilter = {
            relativeDateFilter: {
                dataSet: {
                    identifier: "date.created",
                },
                granularity: "GDC.time.date",
                from: -5,
                to: -1,
            },
        };

        const backend = decoratedBackend(dummy, {
            attributes: () => attributesDecorator,
        });

        const result = await resolveFilterValues([dateFilter], backend, workspace);
        expect(result).toMatchSnapshot();
    });
});
