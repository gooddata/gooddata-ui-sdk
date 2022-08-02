// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

// import { AppState } from "../../../../../../modules/Core/typings/state";
// import { getSelectedWidgetRef } from "../../../../../../modules/Core/services/DashboardService";
// import { getVisualizationWidgetIdentifierByWidgetRef } from "../../../../../../modules/Widgets";

import { ParameterDetail } from "./ParameterDetail";

interface IdentifierDetailProps {
    title: string;
}

export const WidgetIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const intl = useIntl();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={[] /*TODO: make widgets selectable*/}
        />
    );
};

// const mapStateToProps = (appState: AppState): IIdentifierDetailStateProps => ({
//     value: getVisualizationWidgetIdentifierByWidgetRef(appState, getSelectedWidgetRef(appState)),
// });
//
// export const WidgetIdParameterDetail = connect(mapStateToProps)(injectIntl(WidgetIdParameterDetailComponent));
