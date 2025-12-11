import React, { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";

const Login = ({ setLoggedIn, switchToRegister }: any) => {
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<any>({});

    const handleLogin = async (values: any) => {
        setLoading(true);
        setFieldErrors({}); // Reset old errors

        try {
            const res = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorText = await res.text();

                // Map backend errors to form fields
                if (errorText.toLowerCase().includes("username")) {
                    setFieldErrors({
                        username: errorText
                    });
                } else if (errorText.toLowerCase().includes("password")) {
                    setFieldErrors({
                        password: errorText
                    });
                } else {
                    // fallback: attach to a general field (or both)
                    setFieldErrors({
                        username: errorText
                    });
                }

                setLoading(false);
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", values.username);

            setLoggedIn(true);
        } catch (err) {
            console.error(err);
            setFieldErrors({
                username: "Serverfehler – bitte später erneut versuchen."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card title="Login" style={{ width: 300 }}>
                <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item
                        label="Username"
                        name="username"
                        validateStatus={fieldErrors.username ? "error" : ""}
                        help={fieldErrors.username}
                        rules={[{ required: true, message: "Bitte Username eingeben" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        validateStatus={fieldErrors.password ? "error" : ""}
                        help={fieldErrors.password}
                        rules={[{ required: true, message: "Bitte Passwort eingeben" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Login
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: "center", marginTop: 10 }}>
                        <Typography.Text type="secondary">Don't have an account? </Typography.Text>
                        <a onClick={switchToRegister}>Register for free now!</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
