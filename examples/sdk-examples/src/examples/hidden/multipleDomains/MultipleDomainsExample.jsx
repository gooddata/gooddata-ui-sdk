// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import { Kpi } from "@gooddata/sdk-ui";
import { factory } from "@gooddata/api-client-bear";
import { Md } from "../../../md";

export class MultipleDomainsExample extends Component {
    constructor() {
        super();
        this.state = {
            sdk2Config: { workspace: "", measureId: "" },
            sdk2LoginError: "",
            sdk2: false,
        };
        this.setSdk2 = this.setSdk2.bind(this);
    }

    setSdk2(e) {
        const formRef = e.target;
        const inputs = formRef.querySelectorAll("[name]");
        const inputsByName = keyBy(inputs, "name");
        const formValues = mapValues(inputsByName, "value");

        const sdk2 = factory({ domain: formValues.domain });
        sdk2.user
            .login(formValues.sdk2Username, formValues.sdk2Password)
            .then(() => {
                this.setState({ sdk2LoginError: "" });
                this.setState({ sdk2, sdk2Config: formValues });
            })
            .catch((error) => {
                this.setState({ sdk2LoginError: error.toString() });
                console.log(error);
            });

        e.preventDefault();
        return false;
    }

    render() {
        const { sdk2Config, sdk2, sdk2LoginError } = this.state;

        return (
            <div>
                <h2>Default SDK:</h2>
                KPI: <Kpi measure={Md.$TotalSales.measure.definition} />
                <hr className="separator" />
                <h2>Second SDK:</h2>
                KPI: <Kpi workspace={sdk2Config.workspace} measure={sdk2Config.measureId} sdk={sdk2} />
                <h3>Login to second SDK first:</h3>
                <div className="gd-message warning contrast">
                    <div className="gd-message-text">
                        Webapp must enable CORS for this origin. <br />
                        <strong>localhost can&apos;t be set</strong>, run examples on 127.0.0.1 instead.
                        <br />
                        <br />
                        ie.{" "}
                        <a href="https://stg3-webapp-mgmt-console.na.intgdc.com/#/management/cors">
                            staging3
                        </a>{" "}
                        is configured for https://127.0.0.1:8999
                    </div>
                </div>
                <form action="?" method="get" onSubmit={this.setSdk2}>
                    <table>
                        <tbody>
                            <tr>
                                <td>Domain: </td>
                                <td>
                                    <input type="text" name="domain" defaultValue="staging3.intgdc.com" />
                                </td>
                            </tr>
                            <tr>
                                <td>Username: </td>
                                <td>
                                    <input type="text" name="sdk2Username" />
                                </td>
                            </tr>
                            <tr>
                                <td>Password: </td>
                                <td>
                                    <input type="password" name="sdk2Password" />
                                </td>
                            </tr>
                            <tr>
                                <td>KPI project id: </td>
                                <td>
                                    <input
                                        type="text"
                                        name="workspace"
                                        defaultValue="kytra720hke4d84e8ozohoz7uycn53mi"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>KPI measure id: </td>
                                <td>
                                    <input type="text" name="measureId" defaultValue="aa7ulGyKhIE5" />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ position: "relative" }}>
                        <input type="submit" className="gd-button-action" value="Login to second SDK" />
                        {sdk2LoginError ? (
                            <div className="gd-message error" style={{ top: "1em", left: "1em" }}>
                                <div className="gd-message-text">{sdk2LoginError}</div>
                            </div>
                        ) : null}
                    </div>
                </form>
                <p>
                    <strong>Example ids:</strong>
                    <br />
                    stg3 - projectid: kytra720hke4d84e8ozohoz7uycn53mi measureid: aa7ulGyKhIE5
                    <br />
                    giraffes.intgdc.com - projectid: WalkMeDemo measureid: aaeFKXFYiCc0
                </p>
                <p>
                    <strong style={{ marginTop: "2em" }}>Local proxy with CORS</strong>
                    <br />
                    If you don&apos;t want to setup GDC webapp, you may use local proxy (grizzly) with{" "}
                    <a href="https://github.com/gooddata/grunt-grizzly/pull/42">this configuration</a>.
                </p>
            </div>
        );
    }
}
