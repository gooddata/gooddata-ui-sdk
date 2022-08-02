// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

// import { AppState } from "../../../../../../modules/Core/typings/state";
// import { getSelectedWidgetRef } from "../../../../../../modules/Core/services/DashboardService";
// import { getVisualizationIdentifierByWidgetRef } from "../../../../../../modules/Widgets";

import { ParameterDetail } from "./ParameterDetail";

interface IdentifierDetailProps {
    title: string;
}

export const InsightIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
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
//     value: getVisualizationIdentifierByWidgetRef(appState, getSelectedWidgetRef(appState)),
// });
//
// export const InsightIdParameterDetail = connect(mapStateToProps)(
//     injectIntl(InsightIdParameterDetailComponent),
// );
