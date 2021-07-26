import React from "react";
import { Link } from "react-router-dom";

import Page from "../components/Page";

import styles from "./Welcome.module.scss";

import kpiUri from "../media/kpi.png";
import successUri from "../media/success.svg";

const Code: React.FC = ({ children, ...restProps }) => (
    <code className={styles.code} {...restProps}>
        {children}
    </code>
);
const Pre: React.FC = ({ children, ...restProps }) => (
    <pre className={styles.pre} {...restProps}>
        {children}
    </pre>
);

const Welcome: React.FC = () => {
    return (
        <Page>
            <div className={styles.Lead}>
                <h1>
                    <img src={successUri} alt="" />
                    <br />
                    Congratulations!
                    <br />
                    Your GoodData-powered app is created.
                </h1>
            </div>

            <h2>Your new GoodData-powered app is ready!</h2>
            <p>
                Now, let’s take one more step and set up your home dashboard with a test headline report
                widget. This will help verify that everything is set up correctly.
            </p>

            <ol>
                <li>
                    <p>
                        In <Code>/src/constants.ts</Code>, check that <Code>backend</Code> is set to your
                        domain URI. For example, <Code>https://secure.gooddata.com</Code> or{" "}
                        <Code>https://developer.na.gooddata.com</Code>.
                    </p>
                </li>
                <li>
                    <p>
                        In the root of the boilerplate, run <Code>yarn refresh-md</Code>, the terminal then
                        will prompt you to enter <Code>Username/Password</Code> and <Code>workspace</Code>
                        selection.
                        <br />
                        After that, the script will create a file <Code>/src/md/full.ts</Code> which will
                        contain all <Code>MD</Code> objects, metrics and insights that are in the selected
                        <Code>workspace</Code>.
                        <br />
                        You will be able to utilize those generated objects. To read more about generating MD
                        objects, refer to <Code>npm run refresh-md</Code> section in <Code>README.md</Code>
                        file.
                        <br />
                        The script will also print out a workspace ID for the project used for the generating.
                        You can use this value in <Code>/src/constants.ts</Code> to set the{" "}
                        <Code>workspace</Code> property.
                    </p>
                </li>
                <li>
                    In <Code>Home.tsx</Code>, replace <Code>Place your content here</Code> with actual code.
                    <p>
                        For example, <Code> {`<InsightView insight={Md.Insights.Headline}/>`}</Code>. We
                        access the <Code>Headline</Code> identifier through the generated <Code>MD</Code>
                        objects.
                        <br />
                        The main benefit of utilizing the generated MD objects is that you have the access to
                        all MD objects, metrics and insights in the workspace that you selected.
                    </p>
                </li>
                <li>
                    <p>
                        In <Code>/src/routes/AppRouter.tsx</Code>, find the line that says{" "}
                        <Code>DELETE THIS LINE</Code>, and delete it.
                        <br />
                        This removes the redirect to this help page and sets up the default landing page
                        dashboard for your app.
                    </p>
                </li>
                <li>
                    Log in to your app at <Link to="/login">/login</Link>.
                </li>

                <li>
                    <p>
                        Check the headline report on the <Link to="/">Home route</Link>.
                    </p>
                    <p className={styles.imageFrame}>
                        <img src={kpiUri} alt="KPI example" />
                    </p>
                    <p>
                        Most likely, the value of your headline report would be different. As long as you do
                        not see an error, you are good to go. If you do see an error, please use one of the{" "}
                        <a href="https://sdk.gooddata.com/gooddata-ui/docs/support_options.html">
                            GoodData.UI support options
                        </a>
                        .
                    </p>
                </li>
            </ol>
            <p>Now, you are ready to play around with your app.</p>

            <h2>Things to try next</h2>

            <h3>Add a page (route)</h3>
            <ol>
                <li>
                    Duplicate a route in <Code>/src/routes</Code>.
                </li>
                <li>
                    Add the new route to <Code>/src/routes/AppRouter.tsx</Code>.
                </li>
            </ol>

            <h3>Add a link to the navigation / menu</h3>
            <p>
                Add a new <Code>{`<NavLink>`}</Code> component to{" "}
                <Code>/src/components/Header/Links.tsx</Code>.
            </p>

            <h3>Add the multi-tenant functionality and the optional workspace picker</h3>
            <ul>
                <li>
                    The <Code>Workspace</Code> context object in <Code>/src/contexts/Workspace.tsx</Code>{" "}
                    stores the actual workspace ID and provides it to the rest of the app. It also stores it
                    in URL query string so that the app can be easily embedded or linked with a particular
                    workspace pre-selected. If no workspace ID is found in the URL, <Code>workspace</Code>{" "}
                    from <Code>/src/constants.ts</Code> is used as the default value.
                </li>
                <li>
                    The <Code>WorkspaceList</Code> context object in{" "}
                    <Code>/src/contexts/WorkspaceList.tsx</Code> provides a list of all workspaces available
                    for a logged-in user. To allow users to select a workspace within the app, use the
                    WorkspacePicker component in <Code>/src/components/controls/WorkspacePicker.tsx</Code>.
                </li>
                <li>
                    To filter workspaces available for the user by workspace name, use{" "}
                    <Code>workspaceFilter</Code> in <Code>/src/constants.ts</Code>.
                </li>
            </ul>

            <h3>Add an example from the Examples Gallery</h3>
            <p>
                Explore the <a href="https://gdui-examples.herokuapp.com/">Examples Gallery</a> and try out
                some code snippets.
            </p>

            <h3>
                Deploy your app to <a href="https://www.heroku.com/">Heroku</a>
            </h3>
            <ol>
                <li>
                    <p>
                        Create a new Heroku app with the{" "}
                        <a href="https://elements.heroku.com/buildpacks/mars/create-react-app-buildpack">
                            create-react-app buildpack
                        </a>{" "}
                        (<Code>mars/create-react-app</Code>).
                    </p>
                    <Pre>{`heroku create $APP_NAME --buildpack mars/create-react-app`}</Pre>
                </li>
                <li>
                    <p>Commit your changes.</p>
                    <Pre>{`git add .
git commit -m "Setup Heroku deployment"`}</Pre>
                </li>
                <li>
                    Send a request to <a href="https://support.gooddata.com/">GoodData Support</a> to allow
                    cross-domain requests for your domains.
                    <br />
                    In the request, include the domain of your app (for example,{" "}
                    <Code>gooddata-examples.herokuapp.com</Code>) and the target GoodData domain (for example,{" "}
                    <Code>developer.na.gooddata.com</Code>).
                    <br />
                    <b>NOTE:</b> If cross-domain requests are not allowed, you will not be able to log in and
                    will see a cross-domain error message.
                </li>
                <li>
                    <p>Trigger deployment, and open your app in a browser.</p>
                    <Pre>{`git push heroku master
heroku open`}</Pre>
                </li>
            </ol>
        </Page>
    );
};

export default Welcome;
