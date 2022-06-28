// (C) 2021-2022 GoodData Corporation
import {
    idRef,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";
import { recordedBackend, objRefsToStringKey } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    AttributeFilterParentsValidationResult,
    validateAttributeFilterParents,
} from "../parentFiltersValidation";
import { DashboardContext } from "../../../../../types/commonTypes";
import { SimpleDashboardIdentifier } from "../../../../../tests/fixtures/SimpleDashboard.fixtures";
import { newDisplayFormMap, ObjRefMap } from "../../../../../../_staging/metadata/objRefMap";

describe("validateAttributeFilterParents", () => {
    function getAttributeFilter(displayFormId: string): IDashboardAttributeFilter {
        return {
            attributeFilter: {
                displayForm: idRef(displayFormId, "displayForm"),
                attributeElements: { uris: [] },
                negativeSelection: false,
                localIdentifier: displayFormId,
            },
        };
    }

    function getDisplayFormsMap(): ObjRefMap<IAttributeDisplayFormMetadataObject> {
        return newDisplayFormMap([
            {
                type: "displayForm",
                attribute: { uri: "df2" },
                title: "df2 title",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                ref: idRef("df2", "displayForm"),
                id: "df2",
                uri: "df2",
            },
            {
                type: "displayForm",
                attribute: { uri: "df1" },
                title: "df1 title",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                ref: idRef("df1", "displayForm"),
                id: "df1",
                uri: "df1",
            },
        ]);
    }

    it("should reject when there are some parents that are not present in the filters", async () => {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings),
            dashboardRef: idRef(SimpleDashboardIdentifier),
            workspace: "referenceworkspace",
        };

        const changingFilter = getAttributeFilter("df1");
        const parents: IDashboardAttributeFilterParent[] = [
            {
                filterLocalIdentifier: "df2",
                over: {
                    attributes: [],
                },
            },
            {
                filterLocalIdentifier: "NON EXISTENT",
                over: {
                    attributes: [],
                },
            },
        ];

        const allFilters = [getAttributeFilter("df1"), getAttributeFilter("df2")];

        const expected: AttributeFilterParentsValidationResult = "EXTRANEOUS_PARENT";
        const actual = await validateAttributeFilterParents(
            ctx,
            changingFilter,
            parents,
            allFilters,
            getDisplayFormsMap(),
        );
        expect(actual).toBe(expected);
    });

    it("should reject when there are parents that are NOT valid as ancestors", async () => {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings, {
                getCommonAttributesResponses: {
                    [objRefsToStringKey([idRef("df1"), idRef("df2")])]: [idRef("parent")],
                },
            }),
            dashboardRef: idRef(SimpleDashboardIdentifier),
            workspace: "referenceworkspace",
        };

        const changingFilter = getAttributeFilter("df1");
        const parents: IDashboardAttributeFilterParent[] = [
            {
                filterLocalIdentifier: "df2",
                over: {
                    attributes: [idRef("DIFFERENT PARENT")],
                },
            },
        ];

        const allFilters = [getAttributeFilter("df1"), getAttributeFilter("df2")];

        const expected: AttributeFilterParentsValidationResult = "INVALID_CONNECTION";
        const actual = await validateAttributeFilterParents(
            ctx,
            changingFilter,
            parents,
            allFilters,
            getDisplayFormsMap(),
        );
        expect(actual).toBe(expected);
    });

    it("should allow when there are parents that are valid as ancestors", async () => {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings, {
                getCommonAttributesResponses: {
                    [objRefsToStringKey([idRef("df1"), idRef("df2")])]: [
                        idRef("parent"),
                        idRef("unrelatedParent"),
                    ],
                },
            }),
            dashboardRef: idRef(SimpleDashboardIdentifier),
            workspace: "referenceworkspace",
        };

        const changingFilter = getAttributeFilter("df1");
        const parents: IDashboardAttributeFilterParent[] = [
            {
                filterLocalIdentifier: "df2",
                over: {
                    attributes: [idRef("parent")],
                },
            },
        ];

        const allFilters = [getAttributeFilter("df1"), getAttributeFilter("df2")];

        const expected: AttributeFilterParentsValidationResult = "VALID";
        const actual = await validateAttributeFilterParents(
            ctx,
            changingFilter,
            parents,
            allFilters,
            getDisplayFormsMap(),
        );
        expect(actual).toBe(expected);
    });
});
