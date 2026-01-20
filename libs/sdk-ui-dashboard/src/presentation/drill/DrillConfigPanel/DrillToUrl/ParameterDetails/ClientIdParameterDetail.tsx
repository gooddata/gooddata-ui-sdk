// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";

import { ParameterDetail } from "./ParameterDetail.js";

interface IIdentifierDetailProps {
    title: string;
}

export function ClientIdParameterDetail({ title }: IIdentifierDetailProps) {
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
}
