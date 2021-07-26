import React from "react";
import Helmet from "react-helmet";
import cx from "classnames";

import Header from "./Header/Header";
import Footer from "./Footer";

import styles from "./Page.module.scss";

interface IPageProps {
    className?: string;
    mainClassName?: string;
    title?: string;
}

const Page: React.FC<IPageProps> = ({
    children,
    className = null,
    mainClassName = null,
    title = "GoodData App",
}) => {
    return (
        <div className={cx(styles.Page, className)}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <Header />
            <main className={cx(styles.Main, mainClassName, "s-page")}>{children}</main>
            <Footer />
        </div>
    );
};

export default Page;
