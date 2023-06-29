// (C) 2020-2022 GoodData Corporation
import React from "react";
import { ParameterDetail } from "./ParameterDetail.js";
import { useIntl } from "react-intl";
import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";

interface IdentifierDetailProps {
    title: string;
}

export const ClientIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const intl = useIntl();
    const { client } = useClientWorkspaceIdentifiers();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={client ? [client] : []}
        />
    );
};
