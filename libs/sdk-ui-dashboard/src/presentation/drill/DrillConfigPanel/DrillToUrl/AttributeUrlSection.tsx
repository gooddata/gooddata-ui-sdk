// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { areObjRefsEqual, isDrillToAttributeUrl, ObjRef, objRefToString } from "@gooddata/sdk-model";

import { AttributeUrlSectionItem } from "./AttributeUrlSectionItem";
import { DropdownSectionHeader } from "./DropdownSectionHeader";
import { IImplicitDrillWithPredicates } from "../../../../model";

interface IAttributeUrlSectionOwnProps {
    attributeDisplayForms: IImplicitDrillWithPredicates[];
    onSelect: (insightAttributeDisplayForm: ObjRef, drillToAttributeDisplayForm: ObjRef) => void;
    closeDropdown: (e: React.SyntheticEvent) => void;
    loading: boolean;
    selected: ObjRef | false;
}

type AttributeUrlSectionProps = IAttributeUrlSectionOwnProps;

export const AttributeUrlSection: React.FC<AttributeUrlSectionProps> = (props) => {
    const { attributeDisplayForms, loading, selected } = props;

    // const onClickHandler = useCallback(
    //     (
    //         event: React.SyntheticEvent,
    //         insightAttributeDisplayFormRef: ObjRef,
    //         drillToAttributeDisplayFormRef: ObjRef,
    //     ) => {
    //         onSelect(insightAttributeDisplayFormRef, drillToAttributeDisplayFormRef);
    //         closeDropdown(event);
    //     },
    //     [onSelect, closeDropdown],
    // );

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
                        return (
                            <AttributeUrlSectionItem
                                key={objRefToString(item.drillDefinition.target.displayForm)}
                                item={item.drillDefinition}
                                isSelected={areObjRefsEqual(
                                    item.drillDefinition.target.hyperlinkDisplayForm,
                                    selected || undefined,
                                )}
                                onClickHandler={
                                    () => {
                                        /**/
                                    }
                                    // onClickHandler(
                                    //     e,
                                    //     item.ref,
                                    //     item.ref, // TODO
                                    // )
                                }
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
};
