// (C) 2020-2022 GoodData Corporation
import React from "react";

import { ParameterDetail } from "./ParameterDetail.js";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useIntl } from "react-intl";

interface IdentifierDetailProps {
    title: string;
}

export const ProjectIdParameterDetail: React.FC<IdentifierDetailProps> = ({ title }) => {
    const value = useWorkspaceStrict();
    const intl = useIntl();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={[value]}
        />
    );
};
