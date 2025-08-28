// (C) 2025 GoodData Corporation

import React from "react";

import { IntlProvider } from "react-intl";

import { UiDrawer } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

function Example({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

function UiDrawerExamples() {
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);
    const [open4, setOpen4] = React.useState(false);
    const [open5, setOpen5] = React.useState(false);
    const [open6, setOpen6] = React.useState(false);

    const ref7 = React.useRef<HTMLButtonElement | null>(null);
    const [open7, setOpen7] = React.useState(false);
    const [open7a, setOpen7a] = React.useState(false);

    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <h3>Drawer with default settings</h3>
                <Example title="Right anchor">
                    <div>
                        <button onClick={() => setOpen1(!open1)}>Open</button>
                        <UiDrawer
                            open={open1}
                            onEscapeKey={() => setOpen1(false)}
                            onClickOutside={() => setOpen1(false)}
                            onClickClose={() => setOpen1(false)}
                        >
                            <div style={{ width: "300px" }}>
                                Content
                                <button onClick={() => setOpen1(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>
                <Example title="Left anchor">
                    <div>
                        <button onClick={() => setOpen2(!open2)}>Open</button>
                        <UiDrawer
                            anchor="left"
                            open={open2}
                            onEscapeKey={() => setOpen2(false)}
                            onClickOutside={() => setOpen2(false)}
                            onClickClose={() => setOpen2(false)}
                        >
                            <div style={{ width: "300px" }}>
                                Content
                                <button onClick={() => setOpen2(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>

                <h3>Drawer with custom settings</h3>
                <Example title="No close button, changed transition">
                    <div>
                        <button onClick={() => setOpen3(!open3)}>Open</button>
                        <UiDrawer
                            open={open3}
                            onEscapeKey={() => setOpen3(false)}
                            onClickOutside={() => setOpen3(false)}
                            onClickClose={() => setOpen3(false)}
                            showCloseButton={false}
                            closeLabel="Close thjis dialog"
                            transition={{
                                delay: 500,
                                duration: 1000,
                                easing: "ease-out",
                            }}
                        >
                            <div style={{ width: "300px" }}>
                                Content
                                <button onClick={() => setOpen3(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>
                <Example title="Very long content">
                    <div>
                        <button onClick={() => setOpen4(!open4)}>Open</button>
                        <UiDrawer
                            open={open4}
                            onEscapeKey={() => setOpen4(false)}
                            onClickOutside={() => setOpen4(false)}
                            onClickClose={() => setOpen4(false)}
                        >
                            <div style={{ width: "300px" }}>
                                {new Array(10).fill(0).map((_, index) => (
                                    <div key={index}>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                        culpa qui officia deserunt mollit anim id est laborum.
                                    </div>
                                ))}
                                <button onClick={() => setOpen4(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>
                <Example title="Very long content, no close button">
                    <div>
                        <button onClick={() => setOpen5(!open5)}>Open</button>
                        <UiDrawer
                            open={open5}
                            showCloseButton={false}
                            onEscapeKey={() => setOpen5(false)}
                            onClickOutside={() => setOpen5(false)}
                            onClickClose={() => setOpen5(false)}
                        >
                            <div style={{ width: "300px" }}>
                                {new Array(10).fill(0).map((_, index) => (
                                    <div key={index}>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                        culpa qui officia deserunt mollit anim id est laborum.
                                    </div>
                                ))}
                                <button onClick={() => setOpen5(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>
                <Example title="Very wide content">
                    <div>
                        <button onClick={() => setOpen6(!open6)}>Open</button>
                        <UiDrawer
                            open={open6}
                            showCloseButton={false}
                            onEscapeKey={() => setOpen6(false)}
                            onClickOutside={() => setOpen6(false)}
                            onClickClose={() => setOpen6(false)}
                        >
                            <div style={{ width: "2000px" }}>
                                {new Array(10).fill(0).map((_, index) => (
                                    <div key={index}>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                        culpa qui officia deserunt mollit anim id est laborum.
                                    </div>
                                ))}
                                <button onClick={() => setOpen6(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>

                <h3>Drawer in drawer</h3>
                <Example title="Drawer in drawer">
                    <div>
                        <button onClick={() => setOpen7(!open7)}>Open</button>
                        <UiDrawer
                            open={open7}
                            onEscapeKey={() => setOpen7(false)}
                            onClickOutside={() => setOpen7(false)}
                            onClickClose={() => setOpen7(false)}
                        >
                            <div style={{ width: "300px" }}>
                                Content 1
                                <div>
                                    <button onClick={() => setOpen7a(!open7a)} ref={ref7}>
                                        Open
                                    </button>
                                    <UiDrawer
                                        open={open7a}
                                        anchor="left"
                                        onEscapeKey={() => {
                                            setOpen7a(false);
                                            ref7.current?.focus();
                                        }}
                                        onClickOutside={() => {
                                            setOpen7a(false);
                                            ref7.current?.focus();
                                        }}
                                        onClickClose={() => {
                                            setOpen7a(false);
                                            ref7.current?.focus();
                                        }}
                                    >
                                        <div style={{ width: "300px" }}>
                                            Content 2
                                            <button
                                                onClick={() => {
                                                    setOpen7a(false);
                                                    ref7.current?.focus();
                                                }}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </UiDrawer>
                                </div>
                                <button onClick={() => setOpen7(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiDrawer",
};

export function Default() {
    return <UiDrawerExamples />;
}
Default.parameters = { kind: "default" };

export const Themed = () => wrapWithTheme(<UiDrawerExamples />);
Themed.parameters = { kind: "themed" };
