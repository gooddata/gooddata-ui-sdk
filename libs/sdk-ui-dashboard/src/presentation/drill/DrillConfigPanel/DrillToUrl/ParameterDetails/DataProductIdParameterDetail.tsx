// (C) 2020-2022 GoodData Corporation
import React from "react";

// import { AppState } from "../../../../../../modules/Core/typings/state";
// import { getWorkspaceDataProductId } from "../../../../../../modules/Bootstrap";

import { ParameterDetail } from "./ParameterDetail";
import { useIntl } from "react-intl";

interface IdentifierDetailProps {
    title: string;
}

export const DataProductIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const intl = useIntl();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={[] /*TODO select productId*/}
        />
    );
};

// const mapStateToProps = (appState: AppState): IIdentifierDetailStateProps => ({
//     value: getWorkspaceDataProductId(appState),
// });
//
// export const DataProductIdParameterDetail = connect(mapStateToProps)(
//     injectIntl(DataProductIdParameterDetailComponent),
// );
