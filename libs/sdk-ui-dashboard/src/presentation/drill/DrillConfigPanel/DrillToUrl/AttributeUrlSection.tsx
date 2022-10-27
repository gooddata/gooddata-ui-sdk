// (C) 2020-2022 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import {
    areObjRefsEqual,
    isDrillToAttributeUrl,
    ObjRef,
    objRefToString,
    IDrillToAttributeUrlTarget,
} from "@gooddata/sdk-model";

import { AttributeUrlSectionItem } from "./AttributeUrlSectionItem";
import { DropdownSectionHeader } from "./DropdownSectionHeader";
import { IImplicitDrillWithPredicates } from "../../../../model";

interface IAttributeUrlSectionOwnProps {
    attributeDisplayForms: IImplicitDrillWithPredicates[];
    onSelect: (insightAttributeDisplayForm: ObjRef, drillToAttributeDisplayForm: ObjRef) => void;
    closeDropdown: (e: React.SyntheticEvent) => void;
    selected: ObjRef | false;
    loading?: boolean;
}

type AttributeUrlSectionProps = IAttributeUrlSectionOwnProps;

export const AttributeUrlSection: React.FC<AttributeUrlSectionProps> = (props) => {
    const { attributeDisplayForms, loading = false, selected, closeDropdown, onSelect } = props;

    const onClickHandler = useCallback(
        (event: React.SyntheticEvent, target: IDrillToAttributeUrlTarget) => {
            onSelect(target.displayForm, target.hyperlinkDisplayForm);
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
                    {attributeDisplayForms.map((item) => {
                        if (!isDrillToAttributeUrl(item.drillDefinition)) {
                            return null;
                        }
                        const target = item.drillDefinition.target;
                        return (
                            <AttributeUrlSectionItem
                                key={objRefToString(target.displayForm)}
                                item={item.drillDefinition}
                                isSelected={areObjRefsEqual(
                                    target.hyperlinkDisplayForm,
                                    selected || undefined,
                                )}
                                onClickHandler={(e) => onClickHandler(e, target)}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
};
