// (C) 2020-2023 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";

import { AttributeUrlSectionItem } from "./AttributeUrlSectionItem";
import { DropdownSectionHeader } from "./DropdownSectionHeader";
import { IAttributeWithDisplayForm } from "./types";

interface IAttributeUrlSectionOwnProps {
    attributeDisplayForms: IAttributeWithDisplayForm[];
    onSelect: (insightAttributeDisplayForm: ObjRef, drillToAttributeDisplayForm: ObjRef) => void;
    closeDropdown: (e: React.SyntheticEvent) => void;
    selected: ObjRef | false;
    loading?: boolean;
}

type AttributeUrlSectionProps = IAttributeUrlSectionOwnProps;

export const AttributeUrlSection: React.FC<AttributeUrlSectionProps> = (props) => {
    const { attributeDisplayForms, loading = false, selected, closeDropdown, onSelect } = props;

    const onClickHandler = useCallback(
        (event: React.SyntheticEvent, target: IAttributeWithDisplayForm) => {
            onSelect(target.displayForm.ref, target.displayForm.ref);
            closeDropdown(event);
        },
        [onSelect, closeDropdown],
    );

    if (!loading && attributeDisplayForms.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownSectionHeader className="s-drill-to-attribute-url-section-title">
                <FormattedMessage id="configurationPanel.drillIntoUrl.attributeUrlSectionTitle" />
            </DropdownSectionHeader>
            {loading ? (
                <div className="gd-drill-to-url-section-loading s-drill-to-attribute-url-section-loading">
                    <div className="gd-spinner small" />
                </div>
            ) : (
                <div className="gd-drill-to-url-section-items">
                    {attributeDisplayForms.map((item) => (
                        <AttributeUrlSectionItem
                            key={objRefToString(item.displayForm.ref)}
                            item={item}
                            isSelected={areObjRefsEqual(item.displayForm.ref, selected || undefined)}
                            onClickHandler={(e) => onClickHandler(e, item)}
                        />
                    ))}
                </div>
            )}
        </>
    );
};
