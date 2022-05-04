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
    getDefaultEmbedCodeOptions,
    getHeightWithUnitsForEmbedCode,
    IOptionsByReference,
    IAlignPoint,
} from "@gooddata/sdk-ui-kit";
import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { FullVisualizationCatalog } from "../../VisualizationCatalog";
import { insightViewCodeGenerator } from "../../../utils/embeddingInsightViewCodeGenerator/insightViewCodeGenerator";

const INSIGHT_VIEW_PROPERTIES_LINK =
    "https://sdk.gooddata.com/gooddata-ui/docs/visualization_component.html#properties";

/**
 * @internal
 */
export interface IEmbedInsightDialogProps {
    codeType: InsightCodeType;
    insight: IInsight;
    locale?: string;
    backend?: IAnalyticalBackend;
    integrationDocLink?: string;
    settings?: IUserWorkspaceSettings;
    colorPalette?: IColorPalette;

    onClose: () => void;
    onCopyCode: (code: string) => void;
}

/**
 * @internal
 */
export const EmbedInsightDialog: React.VFC<IEmbedInsightDialogProps> = (props) => {
    const {
        locale,
        insight,
        backend,
        settings,
        colorPalette,
        codeType,
        integrationDocLink,
        onClose,
        onCopyCode,
    } = props;
    const [codeLang, setCodeLang] = useState<CodeLanguageType>("ts");
    const [codeOption, setCodeOption] = useState<CodeOptionType>(getDefaultEmbedCodeOptions(codeType));

    useEffect(() => {
        setCodeOption(getDefaultEmbedCodeOptions(codeType));
    }, [codeType]);

    const onLanguageChange = useCallback((codeLanguage: CodeLanguageType) => {
        setCodeLang(codeLanguage);
    }, []);

    const code = useMemo(() => {
        if (codeOption.type === "definition") {
            return generateCodeByDefinition(codeOption, insight, settings, backend, colorPalette, codeLang);
        }

        return generateCodeByReference(codeOption, insight, settings, backend, colorPalette, codeLang);
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
                    integrationDocLink={integrationDocLink}
                    onClose={onClose}
                    onCopyCode={onCopyCode}
                    onCodeLanguageChange={onLanguageChange}
                    onCodeOptionChange={onCodeOptionChange}
                />
            </ModalOverlay>
        </IntlWrapper>
    );
};

const getLinkToPropertiesDocumentation = (
    codeType: InsightCodeType,
    insight: IInsight,
): string | undefined => {
    if (codeType === "definition") {
        const meta = FullVisualizationCatalog.forInsight(insight).getMeta();
        if (meta?.documentationUrl) {
            return `${meta?.documentationUrl}#properties`;
        }
    }

    return INSIGHT_VIEW_PROPERTIES_LINK;
};

const generateCodeByReference = (
    codeOption: IOptionsByReference,
    insight: IInsight,
    settings: IUserWorkspaceSettings,
    backend: IAnalyticalBackend,
    colorPalette: IColorPalette,
    codeLang: CodeLanguageType,
) => {
    const height = getHeightWithUnitsForEmbedCode(codeOption);
    return insightViewCodeGenerator(insight, {
        context: {
            settings: settings,
            backend: backend,
            colorPalette: colorPalette,
        },
        language: codeLang,
        height: height,
        omitChartProps: codeOption.displayTitle ? [] : ["showTitle"],
    });
};

const generateCodeByDefinition = (
    codeOption: IOptionsByDefinition,
    insight: IInsight,
    settings: IUserWorkspaceSettings,
    backend: IAnalyticalBackend,
    colorPalette: IColorPalette,
    codeLang: CodeLanguageType,
) => {
    const height = getHeightWithUnitsForEmbedCode(codeOption);

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

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "cc cc" }];

const ModalOverlay: React.FC = (props) => {
    const { children } = props;
    return (
        <Overlay alignPoints={BUBBLE_ALIGN_POINTS} isModal positionType="fixed">
            {children}
        </Overlay>
    );
};
