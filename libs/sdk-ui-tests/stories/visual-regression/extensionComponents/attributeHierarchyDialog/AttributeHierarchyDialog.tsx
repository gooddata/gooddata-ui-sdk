// (C) 2023 GoodData Corporation
/* eslint-disable sonarjs/no-identical-functions */
import React from "react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { AttributeHierarchyDialog } from "@gooddata/sdk-ui-ext";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/attribute_hierarchies.css";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { ExtensionComponents } from "../../../_infra/storyGroups.js";
import { attributeRefs, editingAttributeHierarchy, regionRef } from "./AtttributeHierarchyDialog.fixture.js";

const getValidDescendants = (refs: ObjRef[]): ObjRef[] => {
    const ref = refs?.[0];
    if (ref) {
        return attributeRefs.filter((it) => !areObjRefsEqual(it, ref));
    }

    return [];
};

const withProvider = (AttributeHierarchyDialogExample: React.FunctionComponent) => {
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings, { getValidDescendants });

    return (
        <div className="screenshot-target">
            <InternalIntlWrapper>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={workspace}>
                        <AttributeHierarchyDialogExample />
                    </WorkspaceProvider>
                </BackendProvider>
            </InternalIntlWrapper>
        </div>
    );
};

const InitialWithAttribute = () =>
    withProvider(() => <AttributeHierarchyDialog initialAttributeRef={regionRef} />);

const InitialWithEditingAttributeHierarchy = () =>
    withProvider(() => <AttributeHierarchyDialog editingAttributeHierarchy={editingAttributeHierarchy} />);

storiesOf(`${ExtensionComponents}/AttributeHierarchyDialog`)
    .add("create-attribute-hierarchy", () => <InitialWithAttribute />, {
        screenshots: {
            initDialog: {
                postInteractionWait: 200,
            },
            emptyHierarchy: {
                clickSelector: ".s-attribute-item-delete-action",
                postInteractionWait: 200,
            },
            attributeDropdown: {
                clickSelectors: [
                    ".s-attribute-item-delete-action",
                    ".s-attribute-hierarchy-add-attribute-action button",
                ],
                postInteractionWait: 200,
            },
        },
    })
    .add("edit-attribute-hierarchy", () => <InitialWithEditingAttributeHierarchy />, {
        screenshots: {
            initDialog: {
                postInteractionWait: 200,
            },
            attributeItemActionMenu: {
                clickSelector:
                    ".public_fixedDataTableRow_main[aria-rowindex='3'] .s-attribute-item-add-action",
                postInteractionWait: 200,
            },
            addItemAbove: {
                clickSelectors: [
                    ".public_fixedDataTableRow_main[aria-rowindex='4'] .s-attribute-item-add-action",
                    ".s-attribute-hierarchy-add-action-menu .s-add-above",
                ],
                postInteractionWait: 200,
            },
            addItemAboveAndChose: {
                clickSelectors: [
                    ".public_fixedDataTableRow_main[aria-rowindex='4'] .s-attribute-item-add-action",
                    ".s-attribute-hierarchy-add-action-menu .s-add-above",
                    ".s-attribute-hierarchy-attribute-dropdown-item",
                ],
                postInteractionWait: 200,
            },
            addItemBelow: {
                clickSelectors: [
                    ".public_fixedDataTableRow_main[aria-rowindex='4'] .s-attribute-item-add-action",
                    ".s-attribute-hierarchy-add-action-menu .s-add-below",
                ],
                postInteractionWait: 200,
            },
            addItemBelowAndChose: {
                clickSelectors: [
                    ".public_fixedDataTableRow_main[aria-rowindex='4'] .s-attribute-item-add-action",
                    ".s-attribute-hierarchy-add-action-menu .s-add-below",
                    ".s-attribute-hierarchy-attribute-dropdown-item",
                ],
                postInteractionWait: 200,
            },
            attributeDropdownDateTab: {
                clickSelectors: [
                    ".public_fixedDataTableRow_main[aria-rowindex='4'] .s-attribute-item-add-action",
                    ".s-attribute-hierarchy-add-action-menu .s-add-below",
                    ".s-attribute-hierarchy-attribute-dropdown-tabs .s-dateattribute",
                ],
                postInteractionWait: 200,
            },
            confirmationDialog: {
                clickSelector: ".s-attribute-hierarchy-delete-button",
                postInteractionWait: 200,
            },
        },
    });
