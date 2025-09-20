// (C) 2023-2025 GoodData Corporation
import { useCallback, useEffect, useState } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import { ICatalogAttributeHierarchy, ObjRef } from "@gooddata/sdk-model";
import { messages, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    EmptyParamCallback,
    IAttributeData,
    ICatalogAttributeData,
    SaveOrUpdateCallback,
    SetLoadingCallback,
} from "./types.js";
import { convertToCatalogAttributeData, convertToCatalogAttributeDataByRefs } from "./utils.js";

interface IUseBackendProvideDataProps {
    title: string;
    attributes: IAttributeData[];
    editingAttributeHierarchy: ICatalogAttributeHierarchy;
    setLoading: SetLoadingCallback;
    onSaveOrUpdateSuccess?: SaveOrUpdateCallback;
    onDeleteSuccess?: EmptyParamCallback;
    onCreateHierarchyClicked?: () => void;
    onClose: EmptyParamCallback;
}

export const useBackendProvider = (params: IUseBackendProvideDataProps) => {
    const {
        title,
        attributes,
        editingAttributeHierarchy,
        setLoading,
        onSaveOrUpdateSuccess,
        onClose,
        onDeleteSuccess,
        onCreateHierarchyClicked,
    } = params;
    const { formatMessage } = useIntl();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { addSuccess, addError } = useToastMessage();

    const [catalogAttributesMap, setCatalogAttributesMap] = useState<Map<string, ICatalogAttributeData>>(
        new Map<string, ICatalogAttributeData>(),
    );

    const getValidAttributes = useCallback(
        async (rowIndex: number) => {
            const attribute = attributes[rowIndex - 1] ?? attributes[rowIndex + 1];
            if (attribute) {
                return backend
                    .workspace(workspace)
                    .attributeHierarchies()
                    .getValidDescendants([attribute.ref])
                    .then((refs) => {
                        const validAttributes = convertToCatalogAttributeDataByRefs(
                            catalogAttributesMap,
                            refs,
                        );
                        return Promise.resolve(validAttributes);
                    });
            } else {
                return Array.from(catalogAttributesMap.values());
            }
        },
        [attributes, backend, catalogAttributesMap, workspace],
    );

    const handleCreateAttributeHierarchy = (savingTitle: string, attributeRefs: ObjRef[]) => {
        backend
            .workspace(workspace)
            .attributeHierarchies()
            .createAttributeHierarchy(savingTitle, attributeRefs)
            .then((attributeHierarchy) => {
                if (onSaveOrUpdateSuccess) {
                    onSaveOrUpdateSuccess(attributeHierarchy);
                }
                setLoading(false);
                addSuccess(messages["hierarchyCreateSuccessMessage"]);
                onClose();
            })
            .catch(() => {
                addError(messages["hierarchyCreateFailedMessage"]);
                setLoading(false);
            });
    };

    const handleUpdateAttributeHierarchy = (savingTitle: string, attributeRefs: ObjRef[]) => {
        backend
            .workspace(workspace)
            .attributeHierarchies()
            .updateAttributeHierarchy({
                ...editingAttributeHierarchy,
                attributeHierarchy: {
                    ...editingAttributeHierarchy.attributeHierarchy,
                    title: savingTitle,
                    attributes: attributeRefs,
                },
            })
            .then((attributeHierarchy) => {
                if (onSaveOrUpdateSuccess) {
                    onSaveOrUpdateSuccess(attributeHierarchy);
                }
                setLoading(false);
                addSuccess(messages["hierarchyUpdateSuccessMessage"]);
                onClose();
            })
            .catch(() => {
                addError(messages["hierarchyUpdateFailedMessage"]);
                setLoading(false);
            });
    };

    const onSaveAttributeHierarchy = () => {
        setLoading(true);
        const savingTitle = title || formatMessage(messages["hierarchyUntitled"]);
        // There maybe some attributes that are not completed, so we need to filter them out
        const attributeRefs = attributes
            .filter((attribute) => attribute.completed)
            .map((attribute) => attribute.ref);

        if (editingAttributeHierarchy) {
            handleUpdateAttributeHierarchy(savingTitle, attributeRefs);
        } else {
            handleCreateAttributeHierarchy(savingTitle, attributeRefs);
        }
        if (onCreateHierarchyClicked) {
            onCreateHierarchyClicked();
        }
    };

    const onDeleteAttributeHierarchy = () => {
        setLoading(true);
        backend
            .workspace(workspace)
            .attributeHierarchies()
            .deleteAttributeHierarchy(editingAttributeHierarchy.attributeHierarchy.id)
            .then(() => {
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
                addSuccess(messages["hierarchyDeleteSuccessMessage"]);
                onClose();
            })
            .catch(() => {
                addError(messages["hierarchyDeleteFailedMessage"]);
                setLoading(false);
            });
    };

    // Prepare all catalog attributes
    useEffect(() => {
        if (isEmpty(catalogAttributesMap)) {
            backend
                .workspace(workspace)
                .catalog()
                .forTypes(["attribute", "dateDataset"])
                .load()
                .then((catalog) => {
                    setCatalogAttributesMap(
                        convertToCatalogAttributeData(catalog.attributes(), catalog.dateDatasets()),
                    );
                    setLoading(false);
                });
        }
    }, [workspace, backend, catalogAttributesMap, setLoading]);

    return {
        catalogAttributesMap,
        onSaveAttributeHierarchy,
        onDeleteAttributeHierarchy,
        getValidAttributes,
    };
};
