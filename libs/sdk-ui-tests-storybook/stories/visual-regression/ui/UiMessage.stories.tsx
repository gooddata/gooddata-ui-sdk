// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiMessageProps, UiMessage, type UiMessageVariant } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiMessage",
};

const VARIANTS: UiMessageVariant[] = ["info", "success", "warning", "error"];

const DETAIL = "Additional detail text shown when expanded.";

const rowStyle = { display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 12 };
const fillCellStyle = { width: 300 };

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            {children}
        </>
    );
}

function VariantRows(props: Omit<IUiMessageProps, "children" | "variant">) {
    return (
        <>
            {VARIANTS.map((variant) => (
                <div key={variant} style={rowStyle}>
                    <div style={fillCellStyle}>
                        <UiMessage {...props} variant={variant} width="fill">
                            Title
                        </UiMessage>
                    </div>
                    <UiMessage {...props} variant={variant} width="hug">
                        Title
                    </UiMessage>
                    <div style={fillCellStyle}>
                        <UiMessage {...props} variant={variant} width="fill" detail={DETAIL}>
                            Title
                        </UiMessage>
                    </div>
                    <div style={fillCellStyle}>
                        <UiMessage {...props} variant={variant} width="fill" detail={DETAIL} isExpanded>
                            Title
                        </UiMessage>
                    </div>
                </div>
            ))}
        </>
    );
}

function UiMessageExamples() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="library-component screenshot-target">
                <Section title="Medium">
                    <VariantRows size="medium" />
                </Section>
                <Section title="Small">
                    <VariantRows size="small" />
                </Section>
                <Section title="With icon">
                    <VariantRows showIcon />
                </Section>
                <Section title="Dismissible">
                    <VariantRows onClose={action("onClose")} />
                </Section>
                <Section title="Dismissible, small, with icon">
                    <VariantRows size="small" showIcon onClose={action("onClose")} />
                </Section>
                <Section title="Hug with detail">
                    {VARIANTS.map((variant) => (
                        <div key={variant} style={rowStyle}>
                            <UiMessage variant={variant} detail={DETAIL}>
                                Title
                            </UiMessage>
                            <UiMessage variant={variant} detail={DETAIL} isExpanded>
                                Title
                            </UiMessage>
                            <UiMessage
                                variant={variant}
                                size="small"
                                showIcon
                                detail={DETAIL}
                                isExpanded
                                onClose={action("onClose")}
                            >
                                Title
                            </UiMessage>
                        </div>
                    ))}
                </Section>
                <Section title="Long text">
                    <div style={rowStyle}>
                        <UiMessage variant="info" onClose={action("onClose")}>
                            Documents made in the previous version of Publisher are not listed here. Open them
                            from the previous version.
                        </UiMessage>
                        <div style={{ width: 400 }}>
                            <UiMessage variant="warning" width="fill" showIcon detail={DETAIL} isExpanded>
                                Some of the visualizations could not be loaded because their data source is no
                                longer available.
                            </UiMessage>
                        </div>
                    </div>
                </Section>
            </div>
        </IntlProvider>
    );
}

export function FullFeatured() {
    return <UiMessageExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiMessageExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
