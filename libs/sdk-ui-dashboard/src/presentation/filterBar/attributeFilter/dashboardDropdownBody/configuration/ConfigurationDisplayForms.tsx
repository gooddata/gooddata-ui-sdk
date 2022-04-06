// (C) 2021-2022 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import { ObjRef, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { DisplayFormDropdown } from "../displayFormDropdown/DisplayFormDropdown";

export interface IConfigurationDisplayFormsProps {
    isDisplayFormSelectionEnabled: boolean;
    displayForms: IAttributeDisplayFormMetadataObject[];
    selectedDisplayForm: ObjRef;
    onChange: (displayForm: ObjRef) => void;
}

export const ConfigurationDisplayForms: React.FC<IConfigurationDisplayFormsProps> = ({
    isDisplayFormSelectionEnabled,
    displayForms,
    selectedDisplayForm,
    onChange,
}) => {
    if (!isDisplayFormSelectionEnabled || displayForms.length <= 1) {
        return null;
    }

    return (
        <div className="s-display-form-configuration">
            <div className="configuration-category">
                <Typography tagName="h3">
                    <FormattedMessage id="attributesDropdown.displayValuesAs" />
                </Typography>
            </div>
            <div className="configuration-panel-body">
                <DisplayFormDropdown
                    selectedDisplayForm={selectedDisplayForm}
                    displayForms={displayForms}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};
