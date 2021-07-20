import React, { useState, useEffect, useCallback } from "react";
import throttle from "lodash/throttle";

import { useAuth } from "../../contexts/Auth";
import { AuthStatus } from "../../contexts/Auth/state";
// uncomment the next line to use WorkspacePicker
// import WorkspacePicker from "../controls/WorkspacePicker";

import Logo from "./Logo";
import Links from "./Links";
import Aside from "./Aside";

import styles from "./Header.module.scss";

const VerticalDelimiter: React.FC = ({ ...restProps }) => (
    <div className={styles.VerticalDelimiter} {...restProps} />
);

// a wrapper for items visible to authenticated users only (e.g. WorkspacePicker)
const ProtectedItems: React.FC = ({ children }) => {
    const { authStatus } = useAuth();
    if (authStatus !== AuthStatus.AUTHORIZED) return null;
    return <>{children || null}</>;
};

const BurgerMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={styles.BurgerMenu}>
            <button
                className={styles.BurgerToggle}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                ☰
            </button>
            {isOpen && (
                <div className={styles.BurgerContent}>
                    <Links />
                    <ProtectedItems>
                        {/* Uncomment these lines to add a workspace picker into the burger menu */}
                        {/* <div className={styles.Centered}>
                            <WorkspacePicker />
                        </div> */}
                    </ProtectedItems>
                </div>
            )}
        </div>
    );
};

const Header: React.FC = () => {
    const [windowWidth, setWindowWidth] = useState(window ? window.innerWidth : null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleResize = useCallback(
        throttle(() => {
            if (window) {
                setWindowWidth(window.innerWidth);
            }
        }, 200),
        [],
    );

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize]);

    // You need to set this manually to the smallest window width that can still fit all menu items
    const isTooSmall = windowWidth && windowWidth < 666;
    return (
        <nav className={styles.Header}>
            {isTooSmall ? (
                <>
                    <BurgerMenu />
                    <Logo />
                </>
            ) : (
                <>
                    <ProtectedItems>
                        {/* Uncomment these lines to add a workspace picker into the menu */}
                        {/* <div className={`${styles.Centered} ${styles.Link}`}>
                            <WorkspacePicker />
                        </div> */}
                    </ProtectedItems>
                    <Logo />
                    <VerticalDelimiter />
                    <Links />
                </>
            )}
            <Aside />
        </nav>
    );
};

export default Header;
