// (C) 2026 GoodData Corporation

import { FormattedMessage, defineMessages } from "react-intl";

import { parameterIdentifierToPlaceholder } from "@gooddata/sdk-model/internal";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectEnableParameters } from "../../../../../model/store/config/configSelectors.js";
import { type IWidgetParameterValue } from "../../../../../model/store/tabs/parameters/parametersSelectors.js";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { ParameterDetail } from "../ParameterDetails/ParameterDetail.js";
import { type IParametersPanelSectionsCommonProps } from "../types.js";

import { Parameter } from "./Parameter.js";

export interface IParameterParametersSectionProps extends IParametersPanelSectionsCommonProps {
    dashboardParameters: IWidgetParameterValue[];
}

const parameterTypeMessages = defineMessages({
    NUMBER: { id: "configurationPanel.drillIntoUrl.editor.numberParameterTypeLabel" },
    STRING: { id: "configurationPanel.drillIntoUrl.editor.stringParameterTypeLabel" },
});

export function ParameterParametersSection({
    dashboardParameters,
    onAdd,
    intl,
}: IParameterParametersSectionProps) {
    const isEnabled = useDashboardSelector(selectEnableParameters);

    if (!isEnabled) {
        return null;
    }

    return (
        <>
            <DropdownSectionHeader>
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parameterParametersSectionLabel" />
            </DropdownSectionHeader>
            {dashboardParameters.length === 0 ? (
                <div className="gd-drill-to-url-section-empty s-drill-to-url-parameters-empty">
                    <FormattedMessage id="configurationPanel.drillIntoUrl.editor.parameterParametersSectionEmpty" />
                </div>
            ) : (
                dashboardParameters.map(({ identifier, parameterType, title, value }) => (
                    <Parameter
                        key={identifier}
                        name={title}
                        detailContent={
                            <ParameterDetail
                                title={title}
                                identifier={identifier}
                                typeName={intl.formatMessage(parameterTypeMessages[parameterType])}
                                values={value === undefined ? [] : [String(value)]}
                            />
                        }
                        iconClassName="gd-icon-sharp"
                        onAdd={() => onAdd(parameterIdentifierToPlaceholder(identifier))}
                        intl={intl}
                    />
                ))
            )}
        </>
    );
}
