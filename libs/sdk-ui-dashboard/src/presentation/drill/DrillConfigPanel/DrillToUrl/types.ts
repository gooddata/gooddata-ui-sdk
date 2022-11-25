// (C) 2022 GoodData Corporation
import { IAttributeDisplayFormMetadataObject, IAttributeMetadataObject } from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";

export interface IParametersPanelSectionsCommonProps {
    onAdd: (placeholder: string) => void;
    intl: IntlShape;
}

export interface IIdentifierParametersSectionProps extends IParametersPanelSectionsCommonProps {
    enableClientIdParameter: boolean;
    enableDataProductIdParameter: boolean;
    enableWidgetIdParameter: boolean;
}

export type IAttributeWithDisplayForm = {
    attribute: IAttributeMetadataObject;
    displayForm: IAttributeDisplayFormMetadataObject;
};
