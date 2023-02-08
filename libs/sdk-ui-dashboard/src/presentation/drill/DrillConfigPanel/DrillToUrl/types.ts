// (C) 2022-2023 GoodData Corporation
import { IAttributeDisplayFormMetadataObject, IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
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
export interface IAttributeWithDisplayForm {
    attribute: IAttributeMetadataObject;
    attributeDisplayFormRef: ObjRef;
    displayForm: IAttributeDisplayFormMetadataObject;
}
