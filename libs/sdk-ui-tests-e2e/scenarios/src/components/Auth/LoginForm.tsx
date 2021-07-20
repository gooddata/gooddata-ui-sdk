import React from "react";
import cx from "classnames";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { withFormik, FormikProps } from "formik";
import { string, object } from "yup";

import { backend } from "../../constants";
import CustomLoading from "../CustomLoading";
import Input from "../controls/Input";
import Label from "../controls/Label";
import Button from "../controls/Button";

import sharedStyles from "../../shared.module.scss";
import styles from "./LoginForm.module.scss";

export interface FormValues {
    email: string;
    password: string;
}

export interface MyFormProps extends FormValues, RouteComponentProps {
    login: (username: string, password: string) => Promise<void>;
    loginError?: string;
}

const LoginFormComponent: React.FC<MyFormProps & FormikProps<FormValues>> = (props) => {
    const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, loginError } =
        props;

    return (
        <>
            {loginError && <div className={styles.Error}>{loginError}</div>}
            <form onSubmit={handleSubmit} className={cx(styles.Login, "s-login-form")}>
                <div className={styles.LoginLogo}>
                    <img
                        src="https://secure.gooddata.com/images/logo-new.png"
                        alt="GoodData"
                        className={styles.LoginLogo}
                        style={{ height: 70 }}
                    />
                </div>
                <h2>
                    Please sign in to the{" "}
                    <a className={cx(sharedStyles.Link, sharedStyles.BreakWord)} href={backend}>
                        {backend.replace(/https?:\/\//, "")}
                    </a>{" "}
                    domain
                </h2>
                <div className={styles.InputBlock}>
                    <Label
                        className={styles.Label}
                        hasError={!!errors.email && touched.email}
                        htmlFor="email"
                    >
                        E-mail
                    </Label>
                    <Input
                        className={cx(styles.Input, "s-login-input-email")}
                        hasError={!!errors.email && touched.email}
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="e-mail"
                    />
                    {errors.email && touched.email && <div className={styles.Error}>{errors.email}</div>}
                </div>
                <div className={styles.InputBlock}>
                    <Label
                        className={styles.Label}
                        hasError={!!errors.password && touched.password}
                        htmlFor="password"
                    >
                        Password
                    </Label>
                    <Input
                        className={cx(styles.Input, "s-login-input-password")}
                        hasError={!!errors.password && touched.password}
                        type="password"
                        name="password"
                        id="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="password"
                    />
                    {errors.password && touched.password && (
                        <div className={styles.Error}>{errors.password}</div>
                    )}
                </div>
                <div className={styles.Action}>
                    <Button type="submit" className={styles.SubmitButton} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <CustomLoading inline height="auto" imageHeight="0.8em" />
                                &emsp;Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </div>
            </form>
        </>
    );
};

const formikConnector = withFormik<MyFormProps, FormValues>({
    mapPropsToValues: ({ email = "", password = "" }) => ({
        email,
        password,
    }),
    validationSchema: object().shape({
        email: string().email("Invalid e-mail address").required("E-mail is required"),
        password: string().required("Password is required"),
    }),
    handleSubmit: ({ email, password }, { props: { login, history }, setFieldError, setSubmitting }) => {
        return login(email, password).then(
            () => history.push("/"),
            (error) => {
                setSubmitting(false);
                if (error.response && error.response.status === 401) {
                    setFieldError("password", "E-mail or password is invalid");
                } else {
                    setFieldError("password", "Unknown error");
                }
            },
        );
    },
});

export default withRouter(formikConnector(LoginFormComponent));
