// (C) 2020-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { ParameterDetail } from "./ParameterDetail.js";

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
