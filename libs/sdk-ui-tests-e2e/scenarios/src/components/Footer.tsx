import React from "react";

import styles from "./Footer.module.scss";

import githubUri from "../media/github-logo.png";
import stackOverflowUri from "../media/stack-overflow-logo.png";
import twitterUri from "../media/twitter-logo.png";
import npmUri from "../media/npm-logo.png";

interface ISocialItemProps {
    link: string;
    title: string;
    imageUri: string;
}

const SocialItem: React.FC<ISocialItemProps> = ({ link, title, imageUri }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className={styles.FooterLink}>
        <img src={imageUri} alt="" aria-hidden />
        {title}
    </a>
);

const Footer: React.FC = () => {
    return (
        <footer className={styles.Footer}>
            <section className={styles.FooterLinks}>
                <h3 className={styles.FooterLinksHeader}>Find more about GoodData.UI&nbsp;on</h3>
                <div className={styles.Social}>
                    <SocialItem
                        imageUri={githubUri}
                        link="https://github.com/gooddata/gooddata-react-components"
                        title="GitHub"
                    />
                    <SocialItem
                        imageUri={stackOverflowUri}
                        link="https://stackoverflow.com/questions/tagged/gooddata"
                        title="Stack Overflow"
                    />
                    <SocialItem
                        imageUri={twitterUri}
                        link="https://twitter.com/gooddata_dev"
                        title="Twitter"
                    />
                    <SocialItem
                        imageUri={npmUri}
                        link="https://www.npmjs.com/package/@gooddata/react-components"
                        title="NPM"
                    />
                </div>
            </section>
            <section className={styles.Copyright}>
                Copyright © 2007–<span>{new Date().getFullYear()}</span> GoodData Corporation. All Rights
                Reserved. Code licensed under a dual license
                <br />
                <a
                    href="https://github.com/gooddata/gooddata-react-components/blob/master/LICENSE"
                    className={styles.FooterLink}
                >
                    CC BY-NC 4.0 for trial experience and GoodData.UI EULA for commercial use.
                </a>
            </section>
        </footer>
    );
};

export default Footer;
