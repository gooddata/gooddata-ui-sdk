// (C) 2020 GoodData Corporation

import { testBackend, testWorkspace } from "./backend";
import { ReferenceMd, ReferenceRecordings, ReferenceMdExt } from "@gooddata/reference-workspace";
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
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
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
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
                .withLimit(20)
                .withAttributeFilters([
                    {
                        attributeFilter: newPositiveAttributeFilter(ReferenceMd.Status_1, {
                            // get only Won accounts
                            uris: [wonAttributeElement!.uri],
                        }),
                        overAttribute: ReferenceMdExt.StageHistoryAttributeRef,
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
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
                .withLimit(20)
                .withMeasures([ReferenceMd.Amount])
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
            const attributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, {
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
            const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);
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
            const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);
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
            const testAttributeRef = attributeDisplayFormRef(ReferenceMd.Product.Name);
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

        it("should return correct page for given displayForm", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
                .withLimit(2)
                .query();

            const page = await result.goTo(3);
            expect(page).toMatchSnapshot();
        });

        it("should return empty result for out-of-range page in initial request", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
                .withLimit(100)
                .withOffset(5000)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should return empty result for out-of-range page with goTo", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
                .withLimit(100)
                .query();

            const page = await result.goTo(100);
            expect(page).toMatchSnapshot();
        });

        it("should return empty result for out-of-range page with next", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(ReferenceMd.Account.Default))
                .withLimit(100)
                .withOffset(4840)
                .query();

            const page = await result.next();
            expect(page).toMatchSnapshot();
        });
    });
});
