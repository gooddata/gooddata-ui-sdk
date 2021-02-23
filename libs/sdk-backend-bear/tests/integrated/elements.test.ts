// (C) 2020 GoodData Corporation

import { testBackend, testWorkspace } from "./backend";
import { ReferenceLdm, ReferenceRecordings, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { attributeDisplayFormRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { IAttributeElement } from "@gooddata/sdk-backend-spi";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("bear elements", () => {
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
        const wonAttributeElement = (ReferenceRecordings.Recordings.metadata.displayForms
            .df_label_stage_status.elements as IAttributeElement[]).find((el) => el.title === "Won");

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
