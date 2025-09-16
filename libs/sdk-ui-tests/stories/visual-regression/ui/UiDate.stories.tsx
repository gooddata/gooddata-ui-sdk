// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { IntlProvider } from "react-intl";

import { UiDate } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

function UiDateExamples() {
    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <h3>Relative date, default settings</h3>
                <Example title="Basic date, relative, now">
                    <div>
                        <UiDate date={new Date()} />
                    </div>
                </Example>
                <Example title="Basic date, relative, 1 minute ago">
                    <div>
                        <UiDate date={new Date().getTime() - 1000 * 60} />
                    </div>
                </Example>
                <Example title="Basic date, relative, 1 hour ago">
                    <div>
                        <UiDate date={new Date().getTime() - 1000 * 60 * 60} />
                    </div>
                </Example>
                <Example title="Basic date, relative, 1 day ago">
                    <div>
                        <UiDate date={new Date().getTime() - 1000 * 60 * 60 * 24 + 5000} />
                    </div>
                </Example>
                <Example title="Basic date, relative, 1 week ago">
                    <div>
                        <UiDate date={new Date().getTime() - 1000 * 60 * 60 * 24 * 7} />
                    </div>
                </Example>

                <h3>Relative date disabled</h3>
                <Example title="Basic date, relative disabled, 1 minute ago">
                    <div>
                        <UiDate date={new Date().getTime() - 1000 * 60} allowRelative={false} />
                    </div>
                </Example>

                <h3>Relative date, small threshold 10s</h3>
                <Example title="Basic date, relative, 1 sec ago, small threshold">
                    <div>
                        <UiDate date={new Date().getTime() - 1000} relativeThresholdMs={10000} />
                    </div>
                </Example>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiDate",
};

export function Default() {
    return <UiDateExamples />;
}
Default.parameters = { kind: "default" };

export const Themed = () => wrapWithTheme(<UiDateExamples />);
Themed.parameters = { kind: "themed" };
