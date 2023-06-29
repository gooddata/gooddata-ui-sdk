// (C) 2020-2023 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";

import { AttributeUrlSectionItem } from "./AttributeUrlSectionItem.js";
import { DropdownSectionHeader } from "./DropdownSectionHeader.js";
import { IAttributeWithDisplayForm } from "./types.js";

interface IAttributeUrlSectionOwnProps {
    attributeDisplayForms: IAttributeWithDisplayForm[];
    onSelect: (insightAttributeDisplayForm: ObjRef, drillToAttributeDisplayForm: ObjRef) => void;
    selected: ObjRef | false;
    loading?: boolean;
}

type AttributeUrlSectionProps = IAttributeUrlSectionOwnProps;

export const AttributeUrlSection: React.FC<AttributeUrlSectionProps> = (props) => {
    const { attributeDisplayForms, loading = false, selected, onSelect } = props;

    const onClickHandler = useCallback(
        (target: IAttributeWithDisplayForm) => {
            onSelect(target.attributeDisplayFormRef, target.displayForm.ref);
        },
        [onSelect],
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
                            onClickHandler={onClickHandler}
                        />
                    ))}
                </div>
            )}
        </>
    );
};
