// (C) 2022 GoodData Corporation
import { IntlWrapper } from "@gooddata/sdk-ui";
import React, { useMemo } from "react";
import { IColorPalette, IInsight } from "@gooddata/sdk-model";
import { EmbedInsightDialogBase, InsightCodeType, Overlay } from "@gooddata/sdk-ui-kit";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { FullVisualizationCatalog } from "../../VisualizationCatalog";

/**
 * @internal
 */
export interface IEmbedInsightDialogProps {
    codeType: InsightCodeType;
    insight: IInsight;
    locale?: string;
    backend?: IAnalyticalBackend;
    settings?: IUserWorkspaceSettings;
    colorPalette?: IColorPalette;

    onClose: () => void;
    onCopyCode: () => void;
}

/**
 * @internal
 */
export const EmbedInsightDialog: React.VFC<IEmbedInsightDialogProps> = (props) => {
    const { locale, insight, backend, settings, colorPalette, onClose, onCopyCode } = props;

    const code = useMemo(() => {
        const descriptor = FullVisualizationCatalog.forInsight(insight);
        return descriptor.getEmbeddingCode?.(insight, {
            context: {
                settings: settings, //TODO need setting locale from userSettings or from dialog?
                backend: backend,
                colorPalette: colorPalette,
            },
            language: "ts",
        });
    }, []);
    return (
        <IntlWrapper locale={locale}>
            <ModalOverlay>
                <EmbedInsightDialogBase
                    code={code}
                    codeType={"definition"}
                    onClose={onClose}
                    onCopyCode={onCopyCode}
                />
            </ModalOverlay>
        </IntlWrapper>
    );
};

const ModalOverlay: React.FC = (props) => {
    const { children } = props;
    return (
        <Overlay
            alignPoints={[
                {
                    align: "cc cc",
                },
            ]}
            isModal
            positionType="fixed"
        >
            {children}
        </Overlay>
    );
};
