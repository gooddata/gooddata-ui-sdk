// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";

import { ParameterDetail } from "./ParameterDetail.js";

interface IIdentifierDetailProps {
    title: string;
}

export function DataProductIdParameterDetail({ title }: IIdentifierDetailProps) {
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
