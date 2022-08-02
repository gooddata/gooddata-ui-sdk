// (C) 2020-2022 GoodData Corporation
import React from "react";

// import { AppState } from "../../../../../../modules/Core/typings/state";
// import { getWorkspaceClientId } from "../../../../../../modules/Bootstrap";

import { ParameterDetail } from "./ParameterDetail";
import { useIntl } from "react-intl";

interface IdentifierDetailProps {
    title: string;
}

export const ClientIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const intl = useIntl();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={[] /*TODO: select client*/}
        />
    );
};

// const mapStateToProps = (appState: AppState): IIdentifierDetailStateProps => ({
//     value: getWorkspaceClientId(appState),
// });
//
// export const ClientIdParameterDetail = connect(mapStateToProps)(injectIntl(ClientIdParameterDetailComponent));
