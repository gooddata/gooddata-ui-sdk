// (C) 2020-2025 GoodData Corporation

import { ParameterDetail } from "./ParameterDetail.js";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useIntl } from "react-intl";

interface IdentifierDetailProps {
    title: string;
}

export function ProjectIdParameterDetail({ title }: IdentifierDetailProps) {
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
