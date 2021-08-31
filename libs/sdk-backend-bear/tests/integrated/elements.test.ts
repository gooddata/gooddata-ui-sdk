// (C) 2020 GoodData Corporation

import { testBackend, testWorkspace } from "./backend";
import { ReferenceLdm, ReferenceRecordings, ReferenceLdmExt } from "@gooddata/reference-workspace";
import {
    attributeDisplayFormRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { IAttributeElement } from "@gooddata/sdk-backend-spi";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("bear elements", () => {
    describe("forDisplayForm", () => {
        it("should load attribute elements for existing display form", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceLdm.Account.Default))
                .withLimit(20)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should load attribute elements for existing display form with a parent filter", async () => {
            const wonAttributeElement = (
                ReferenceRecordings.Recordings.metadata.displayForms.df_label_stage_status
                    .elements as IAttributeElement[]
            ).find((el) => el.title === "Won");

            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceLdm.Account.Default))
                .withLimit(20)
                .withAttributeFilters([
                    {
                        attributeFilter: newPositiveAttributeFilter(ReferenceLdm.Status_1, {
                            // get only Won accounts
                            uris: [wonAttributeElement!.uri],
                        }),
                        overAttribute: ReferenceLdmExt.StageHistoryAttributeRef,
                    },
                ])
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should load attribute elements for existing display form with a limiting measure", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceLdm.Account.Default))
                .withLimit(20)
                .withMeasures([ReferenceLdm.Amount])
                .query();

            expect(result).toMatchSnapshot();
        });
    });

    describe("forFilter", () => {
        const testAttributeElement = (
            ReferenceRecordings.Recordings.metadata.displayForms.df_label_product_id_name
                .elements as IAttributeElement[]
        ).find((el) => el.title === "Educationly");
        const testAttributeElementUri = testAttributeElement!.uri.replace(
            "referenceworkspace",
            testWorkspace(),
        );
        it("should load attribute filter elements for provided positive attribute filter", async () => {
            const attributeFilter = newPositiveAttributeFilter(ReferenceLdm.Product.Name, {
                uris: [testAttributeElementUri],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(attributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should load attribute filter elements for provided negative attribute filter", async () => {
            const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
            const attributeFilter = newNegativeAttributeFilter(testAttributeRef, {
                uris: [testAttributeElementUri],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(attributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should load no attribute filter elements for provided ALL attribute filter", async () => {
            const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
            const allAttributeFilter = newNegativeAttributeFilter(testAttributeRef, {
                uris: [],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(allAttributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should return attribute filter elements for provided attribute filter with elements by value", async () => {
            const testAttributeRef = attributeDisplayFormRef(ReferenceLdm.Product.Name);
            const attributeFilter = newNegativeAttributeFilter(testAttributeRef, {
                values: ["Educationly"],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(attributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });
    });
});
