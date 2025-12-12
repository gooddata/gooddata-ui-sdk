// (C) 2022-2025 GoodData Corporation
import { type IntlShape } from "react-intl";

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type ObjRef,
} from "@gooddata/sdk-model";

export interface IParametersPanelSectionsCommonProps {
    onAdd: (placeholder: string) => void;
    intl: IntlShape;
}

export interface IIdentifierParametersSectionProps extends IParametersPanelSectionsCommonProps {
    enableClientIdParameter: boolean;
    enableDataProductIdParameter: boolean;
    enableWidgetIdParameter: boolean;
    widgetRef: ObjRef;
}
export interface IAttributeWithDisplayForm {
    attribute: IAttributeMetadataObject;
    attributeDisplayFormRef: ObjRef;
    displayForm: IAttributeDisplayFormMetadataObject;
}
