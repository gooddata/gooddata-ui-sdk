// (C) 2020-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";

import { ParameterDetail } from "./ParameterDetail.js";

interface IdentifierDetailProps {
    title: string;
}

export function DataProductIdParameterDetail({ title }: IdentifierDetailProps) {
    const intl = useIntl();
    const { dataProduct } = useClientWorkspaceIdentifiers();

    return (
        <ParameterDetail
            title={title}
            typeName={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.identifierTypeLabel",
            })}
            useEllipsis={false}
            values={dataProduct ? [dataProduct] : []}
        />
    );
}
