// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { ConfigurationParentItems } from "./ConfigurationParentItems";
import { areObjRefsEqual, ObjRef, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { IAttributeFilterParent, IAttributeFiltersMetaState } from "../types";
import { useItems } from "../useItemsHook";
import { ConfigurationDisplayForms } from "./ConfigurationDisplayForms";
import { IConfigurationParentItem } from "./ConfigurationParentItem";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import xorWith from "lodash/xorWith";

interface IAttributeFilterDropdownConfigurationOwnProps {
    attributeFilterRef: ObjRef;
    closeHandler: () => void;
    onChange: () => void;
}

interface IAttributeFilterDropdownConfigurationStateProps {
    projectId: string;
    attributeFilterAttributeRef: ObjRef;
    attributeFilterTitle: string;
    attributeFilterStateParents: IAttributeFilterParent[];
    allAttributeFilters: IAttributeFiltersMetaState;
    childAttributeFilterRefs: ReadonlyArray<ObjRef>;
    isDependentFiltersEnabled: boolean;
    isDisplayFormSelectionEnabled: boolean;
    displayForms: IAttributeDisplayFormMetadataObject[];
}

interface IAttributeFilterDropdownConfigurationDispatchProps {
    /**
     * todo specify payload types
     */
    attributeFilterParentsChanged: (payload: any) => void;
    attributeFilterDisplayFormChanged: (payload: any) => void;
}

export type IAttributeFilterDropdownConfigurationProps = IAttributeFilterDropdownConfigurationOwnProps &
    IAttributeFilterDropdownConfigurationStateProps &
    IAttributeFilterDropdownConfigurationDispatchProps;

const getArrayDifference = (array1: any[], array2: any[]) => xorWith(array1, array2, isEqual);

const mapAsSelectedAttributeFilterParents = (items: IConfigurationParentItem[]): IAttributeFilterParent[] =>
    items
        .filter(({ isSelected }) => isSelected)
        .map(({ ref, selectedConnectingAttributeRef }) => ({
            parentRef: ref,
            connectingAttributeRef: selectedConnectingAttributeRef,
        }));

const isParentFilterConfigurationChanged = (
    items: IConfigurationParentItem[],
    attributeFilterStateParents: IAttributeFilterParent[],
) => {
    if (!items.length) {
        return false;
    }

    const selectedItems = items
        .filter(({ isSelected }) => isSelected)
        .map(({ ref, selectedConnectingAttributeRef }) => ({
            parentRef: ref,
            connectingAttributeRef: selectedConnectingAttributeRef,
        }));

    return !isEmpty(getArrayDifference(selectedItems, attributeFilterStateParents));
};

const isFilterDisplayFormChanged = (currentDisplayForm: ObjRef, originalDisplayForm: ObjRef) =>
    !areObjRefsEqual(currentDisplayForm, originalDisplayForm);

const DropdownConfiguration: React.FC<IAttributeFilterDropdownConfigurationProps> = (props) => {
    const {
        isDependentFiltersEnabled,
        allAttributeFilters,
        attributeFilterTitle,
        isDisplayFormSelectionEnabled,
        attributeFilterRef,
        displayForms,
        closeHandler,
        attributeFilterStateParents,
        attributeFilterParentsChanged,
        attributeFilterDisplayFormChanged,
        onChange,
    } = props;

    const intl = useIntl();
    const [items, setItems] = useItems();
    const [currentDisplayFormRef, setCurrentDisplayFormRef] = useState(attributeFilterRef);

    const onDisplayFormChange = (selectedDisplayFormRef: ObjRef) =>
        setCurrentDisplayFormRef(selectedDisplayFormRef);

    const onSaveHandler = useCallback(() => {
        if (isParentFilterConfigurationChanged(items, attributeFilterStateParents)) {
            attributeFilterParentsChanged({
                filterRef: attributeFilterRef,
                parents: mapAsSelectedAttributeFilterParents(items),
            });
        }

        if (isFilterDisplayFormChanged(currentDisplayFormRef, attributeFilterRef)) {
            attributeFilterDisplayFormChanged({
                filterRef: attributeFilterRef,
                displayFormRef: currentDisplayFormRef,
            });
        }

        onChange();
        closeHandler();
    }, [
        items,
        attributeFilterParentsChanged,
        attributeFilterStateParents,
        attributeFilterRef,
        closeHandler,
        onChange,
        currentDisplayFormRef,
        attributeFilterDisplayFormChanged,
    ]);

    const isSaveButtonEnabled =
        isParentFilterConfigurationChanged(items, attributeFilterStateParents) ||
        isFilterDisplayFormChanged(currentDisplayFormRef, attributeFilterRef);

    return (
        <div className="s-attribute-filter-dropdown-configuration attribute-filter-dropdown-configuration">
            <div className="configuration-panel-header">
                <Typography tagName="h3" className="configuration-panel-header-title">
                    <FormattedMessage id="attributesDropdown.configuration" />
                </Typography>
            </div>
            <ConfigurationParentItems
                isDependentFiltersEnabled={isDependentFiltersEnabled}
                numberOfAttributeFilters={Object.keys(allAttributeFilters).length}
                attributeFilterTitle={attributeFilterTitle}
                items={items}
                setItems={setItems}
            />
            <ConfigurationDisplayForms
                isDisplayFormSelectionEnabled={isDisplayFormSelectionEnabled}
                displayForms={displayForms}
                selectedDisplayForm={currentDisplayFormRef}
                onChange={onDisplayFormChange}
            />
            <div className="gd-dialog-footer dropdown-footer">
                <Button
                    className="gd-button-secondary s-attribute-filter-dropdown-configuration-cancel-button"
                    value={intl.formatMessage({ id: "cancel" })}
                    disabled={false}
                    onClick={() => closeHandler()}
                />
                <Button
                    className="gd-button-action s-attribute-filter-dropdown-configuration-save-button"
                    value={intl.formatMessage({ id: "attributesDropdown.save" })}
                    disabled={!isSaveButtonEnabled}
                    onClick={onSaveHandler}
                />
            </div>
        </div>
    );
};

export default DropdownConfiguration;
