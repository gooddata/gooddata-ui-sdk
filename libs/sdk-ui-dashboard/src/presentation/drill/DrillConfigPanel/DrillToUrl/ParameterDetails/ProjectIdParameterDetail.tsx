// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { ParameterDetail } from "./ParameterDetail.js";

interface IIdentifierDetailProps {
    title: string;
}

export function ProjectIdParameterDetail({ title }: IIdentifierDetailProps) {
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
}
