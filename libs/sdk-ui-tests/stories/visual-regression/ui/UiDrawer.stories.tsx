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
    const [open8, setOpen8] = React.useState(false);
    const [open9, setOpen9] = React.useState(false);

    const refContainer = React.useRef<HTMLDivElement | null>(null);

    const [mode, setMode] = React.useState<"absolute" | "fixed">("absolute");

    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <div style={{ position: "absolute", top: "10px", right: "20px" }}>
                    <select onChange={(e) => setMode(e.target.value as "absolute" | "fixed")}>
                        <option value="absolute" selected>
                            absolute
                        </option>
                        <option value="fixed">fixed</option>
                    </select>
                </div>

                <div
                    ref={refContainer}
                    style={{
                        position: "absolute",
                        top: "40px",
                        left: "50%",
                        right: "50px",
                        bottom: "20px",
                        border: "1px solid gray",
                    }}
                />

                <h3>Drawer in container</h3>
                <Example title="Drawer in container">
                    <div>
                        <button onClick={() => setOpen9(!open9)}>Open</button>
                        <UiDrawer
                            open={open9}
                            mode={mode}
                            node={refContainer.current ?? undefined}
                            onEscapeKey={() => setOpen9(false)}
                            onClickOutside={() => setOpen9(false)}
                            onClickClose={() => setOpen9(false)}
                        >
                            <div style={{ width: "300px" }}>
                                Content 1<button onClick={() => setOpen9(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>

                <h3>Drawer with default settings</h3>
                <Example title="Right anchor">
                    <div>
                        <button onClick={() => setOpen1(!open1)}>Open</button>
                        <UiDrawer
                            open={open1}
                            mode={mode}
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
                            mode={mode}
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
                <Example title="No close button, left, changed transition">
                    <div>
                        <button onClick={() => setOpen8(!open8)}>Open</button>
                        <UiDrawer
                            open={open8}
                            anchor="left"
                            mode={mode}
                            onEscapeKey={() => setOpen8(false)}
                            onClickOutside={() => setOpen8(false)}
                            onClickClose={() => setOpen8(false)}
                            showCloseButton={false}
                            closeLabel="Close this dialog"
                            transition={{
                                delay: 500,
                                duration: 3000,
                                easing: "ease-out",
                            }}
                        >
                            <div style={{ width: "300px" }}>
                                Content
                                <button onClick={() => setOpen8(false)}>Close</button>
                            </div>
                        </UiDrawer>
                    </div>
                </Example>
                <Example title="No close button, right, changed transition">
                    <div>
                        <button onClick={() => setOpen3(!open3)}>Open</button>
                        <UiDrawer
                            open={open3}
                            anchor="right"
                            mode={mode}
                            onEscapeKey={() => setOpen3(false)}
                            onClickOutside={() => setOpen3(false)}
                            onClickClose={() => setOpen3(false)}
                            showCloseButton={false}
                            closeLabel="Close this dialog"
                            transition={{
                                delay: 500,
                                duration: 3000,
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
                            mode={mode}
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
                            mode={mode}
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
                            mode={mode}
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
                            mode={mode}
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
                                        mode={mode}
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
