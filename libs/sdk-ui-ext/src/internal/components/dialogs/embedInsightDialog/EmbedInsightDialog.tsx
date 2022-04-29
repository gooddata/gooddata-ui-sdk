// (C) 2022 GoodData Corporation
import { IntlWrapper } from "@gooddata/sdk-ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IColorPalette, IInsight } from "@gooddata/sdk-model";
import {
    CodeOptionType,
    CodeLanguageType,
    EmbedInsightDialogBase,
    InsightCodeType,
    IOptionsByDefinition,
    Overlay,
    getDefaultOptions,
    getHeightWithUnits,
} from "@gooddata/sdk-ui-kit";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { FullVisualizationCatalog } from "../../VisualizationCatalog";

const InsightViewPropertiesLink =
    "https://sdk.gooddata.com/gooddata-ui/docs/visualization_component.html#properties";

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
    const { locale, insight, backend, settings, colorPalette, codeType, onClose, onCopyCode } = props;
    const [codeLang, setCodeLang] = useState<CodeLanguageType>("ts");
    const [codeOption, setCodeOption] = useState<CodeOptionType>(getDefaultOptions(codeType));

    useEffect(() => {
        setCodeOption(getDefaultOptions(codeType));
    }, [codeType]);

    const onLanguageChange = useCallback((codeLanguage: CodeLanguageType) => {
        setCodeLang(codeLanguage);
    }, []);

    const code = useMemo(() => {
        if (codeOption.type === "definition") {
            return generateCodeByDefinition(codeOption, insight, settings, backend, colorPalette, codeLang);
        }

        return "This is insightView code";
    }, [codeOption, insight, settings, backend, colorPalette, codeLang]);

    const onCodeOptionChange = useCallback((codeOpt: IOptionsByDefinition) => {
        setCodeOption(codeOpt);
    }, []);

    const documentationLink = useMemo(
        () => getLinkToPropertiesDocumentation(codeType, insight),
        [codeType, insight],
    );

    return (
        <IntlWrapper locale={locale}>
            <ModalOverlay>
                <EmbedInsightDialogBase
                    code={code}
                    codeLanguage={codeLang}
                    codeOption={codeOption}
                    propertiesLink={documentationLink}
                    onClose={onClose}
                    onCopyCode={onCopyCode}
                    onCodeLanguageChange={onLanguageChange}
                    onCodeOptionChange={onCodeOptionChange}
                />
            </ModalOverlay>
        </IntlWrapper>
    );
};

const getLinkToPropertiesDocumentation = (codeType: InsightCodeType, insight: IInsight) => {
    if (codeType === "definition") {
        const meta = FullVisualizationCatalog.forInsight(insight).getMeta();
        return meta.documentationUrl;
    }

    return InsightViewPropertiesLink;
};

const generateCodeByDefinition = (
    codeOption: IOptionsByDefinition,
    insight: IInsight,
    settings: IUserWorkspaceSettings,
    backend: IAnalyticalBackend,
    colorPalette: IColorPalette,
    codeLang: CodeLanguageType,
) => {
    const height = getHeightWithUnits(codeOption);

    const descriptor = FullVisualizationCatalog.forInsight(insight);
    return descriptor.getEmbeddingCode?.(insight, {
        context: {
            settings: settings,
            backend: backend,
            colorPalette: colorPalette,
        },
        language: codeLang,
        height: height,
        omitChartProps: codeOption.includeConfiguration ? [] : ["config"],
    });
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
