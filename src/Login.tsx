import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";

const Login = ({ setLoggedIn }: any) => {
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values: any) => {
        setLoading(true);
        console.log(values)
        try {
            const res = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const text = await res.text();
                message.error(text); // Fehler vom Backend anzeigen
                setLoading(false);
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token); // JWT speichern
            message.success("Erfolgreich eingeloggt!");
            setLoggedIn(true); // z.B. Dashboard anzeigen
        } catch (err) {
            console.error(err);
            message.error("Serverfehler");
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
                        rules={[{ required: true, message: "Bitte Username eingeben" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Bitte Passwort eingeben" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
