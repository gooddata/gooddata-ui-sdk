// (C) 2020-2025 GoodData Corporation
import { ParameterDetail } from "./ParameterDetail.js";
import { useIntl } from "react-intl";
import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";

interface IdentifierDetailProps {
    title: string;
}

export function ClientIdParameterDetail({ title }: IdentifierDetailProps) {
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
