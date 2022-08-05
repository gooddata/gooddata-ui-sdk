// (C) 2022 GoodData Corporation
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
