// (C) 2021 GoodData Corporation
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    attributeDisplayFormRef,
    IAbsoluteDateFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { resolveFilterValues } from "../filterValuesResolver";

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

    it("should return resolved attribute filters elements by ref", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "referenceworkspace";
        const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
        const attributeFilter: IPositiveAttributeFilter = newPositiveAttributeFilter(testAttributeRef, {
            uris: ["/gdc/md/referenceworkspace/obj/1054/elements?id=165678"],
        });
        const result = await resolveFilterValues([attributeFilter], backend, workspace);
        expect(result).toMatchSnapshot();
    });

    it("should return resolved attribute filter elements by value", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "referenceworkspace";
        const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
        const attributeFilter: IPositiveAttributeFilter = newPositiveAttributeFilter(testAttributeRef, {
            values: ["Educationly"],
        });
        const result = await resolveFilterValues([attributeFilter], backend, workspace);
        expect(result).toMatchSnapshot();
    });

    it("should resolved multiple attribute filters", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "referenceworkspace";
        const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
        const testAttributeRef2 = attributeDisplayFormRef(ReferenceLdm.Department);
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
        const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
        const allAttributeFilter: INegativeAttributeFilter = newNegativeAttributeFilter(testAttributeRef, {
            values: [],
        });

        const result = await resolveFilterValues([allAttributeFilter], backend, workspace);
        expect(result).toMatchSnapshot();
    });
});
