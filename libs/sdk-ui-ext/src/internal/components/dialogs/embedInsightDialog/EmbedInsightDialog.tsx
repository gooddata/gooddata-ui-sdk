// (C) 2022 GoodData Corporation
import { IntlWrapper } from "@gooddata/sdk-ui";
import React, { useCallback, useMemo, useState } from "react";
import { IColorPalette, IInsight } from "@gooddata/sdk-model";
import {
    CodeLanguageType,
    EmbedInsightDialogBase,
    InsightCodeType,
    IOptionsByDefinition,
    Overlay,
} from "@gooddata/sdk-ui-kit";
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
    const [codeLang, setCodeLang] = useState<CodeLanguageType>("ts");
    const [codeOption, setCodeOption] = useState<IOptionsByDefinition>({
        includeConfiguration: true,
        customHeight: false,
        height: 400,
    });

    const onLanguageChange = useCallback((codeLanguage: CodeLanguageType) => {
        setCodeLang(codeLanguage);
    }, []);

    const code = useMemo(() => {
        const descriptor = FullVisualizationCatalog.forInsight(insight);
        return descriptor.getEmbeddingCode?.(insight, {
            context: {
                settings: settings, //TODO need setting locale from userSettings or from dialog?
                backend: backend,
                colorPalette: colorPalette,
            },
            language: codeLang,
            height: codeOption.customHeight ? codeOption.height : 400, //TODO Default from UI-Kit
            omitChartProps: codeOption.includeConfiguration ? [] : ["config"],
        });
    }, [codeLang, codeOption]);

    const onCodeOptionChange = useCallback((codeOpt: IOptionsByDefinition) => {
        setCodeOption(codeOpt);
    }, []);

    return (
        <IntlWrapper locale={locale}>
            <ModalOverlay>
                <EmbedInsightDialogBase
                    code={code}
                    codeType={"definition"}
                    codeLanguage={codeLang}
                    codeOption={codeOption}
                    onClose={onClose}
                    onCopyCode={onCopyCode}
                    onCodeLanguageChange={onLanguageChange}
                    onCodeOptionChange={onCodeOptionChange}
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
