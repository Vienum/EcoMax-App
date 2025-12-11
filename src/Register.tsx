import { useState } from "react";
import { Form, Input, Button, Card, Typography, Steps, message, DatePicker, Select, Row, Col } from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Register = ({ switchToLogin, setLoggedIn }: any) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [countries] = useState([
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
        "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
        "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
        "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
        "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
        "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
        "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
        "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
        "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
        "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
        "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
        "Kiribati", "North Korea", "South Korea", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
        "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
        "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
        "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
        "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
        "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
        "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
        "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
        "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
        "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
        "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland",
        "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago",
        "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
        "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
        "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ]);

    const steps = [
        { title: "Account", icon: <UserOutlined /> },
        { title: "Address", icon: <HomeOutlined /> },
    ];

    const nextStep = async () => {
        try {
            // Validate only the fields for the current step
            if (currentStep === 0) {
                await form.validateFields(["userName", "email", "password", "confirmPassword"]);
                setCurrentStep(1);
            } else if (currentStep === 1) {
                await form.validateFields([
                    "fullName",
                    "birthday",
                    "country",
                    "city",
                    "street",
                    "houseNumber",
                    "zipCode",
                    "peopleInHousehold",
                ]);
            }
        } catch (error) {
            message.error("Please fill in all required fields correctly");
        }
    };

    const previousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            // Validate ALL fields, not just current step
            const values = await form.validateFields([
                "userName", "email", "password", "confirmPassword",
                "fullName", "birthday", "country", "city",
                "street", "houseNumber", "zipCode",
                "peopleInHousehold"
            ]);

            console.log("Registration data:", values);

            // Format the data for your backend
            const registrationData = {
                userName: values.userName,
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : '',
                country: values.country,
                city: values.city,
                street: values.street,
                houseNumber: values.houseNumber,
                zipCode: values.zipCode,
            };

            console.log("Sending to backend:", registrationData);

            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            message.success("Registration successful! Logging you in...");

            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_id', data.user_id);

            // Auto-login: set the user as logged in
            if (setLoggedIn) {
                setLoggedIn(true);
            } else {
                // Fallback: redirect to login if setLoggedIn prop is not available
                setTimeout(() => {
                    switchToLogin();
                }, 1000);
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            message.error(error.message || "Registration failed. Please try again.");
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <Form.Item
                            name="userName"
                            label="Username"
                            rules={[
                                { required: true, message: "Please enter your username" },
                                { min: 3, message: "Username must be at least 3 characters" },
                            ]}
                        >
                            <Input placeholder="Enter username" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: "Please enter your password" },
                                { min: 6, message: "Password must be at least 6 characters" },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Repeat Password"
                            dependencies={["password"]}
                            rules={[
                                { required: true, message: "Please confirm your password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Repeat password" />
                        </Form.Item>
                    </>
                );

            case 1:
                return (
                    <>
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="fullName"
                                    label="Full Name"
                                    rules={[{ required: true, message: "Please enter your full name" }]}
                                >
                                    <Input placeholder="Enter full name" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="peopleInHousehold"
                                    label="People in Household"
                                    rules={[{ required: true, message: "Please enter number of household members" }]}
                                >
                                    <Input type="number" min={1} placeholder="e.g. 3" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="birthday"
                            label="Birthday"
                            rules={[{ required: true, message: "Please select your birthday" }]}
                        >
                            <DatePicker style={{ width: "100%" }} placeholder="Select birthday" />
                        </Form.Item>

                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{ required: true, message: "Please select your country" }]}
                        >
                            <Select
                                showSearch
                                placeholder="Search and select country"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={countries.map(country => ({
                                    value: country,
                                    label: country
                                }))}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="city"
                                    label="City"
                                    rules={[{ required: true, message: "Please enter your city" }]}
                                >
                                    <Input placeholder="Enter city" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="zipCode"
                                    label="ZIP Code"
                                    rules={[{ required: true, message: "Please enter your ZIP code" }]}
                                >
                                    <Input placeholder="ZIP code" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={18}>
                                <Form.Item
                                    name="street"
                                    label="Street"
                                    rules={[{ required: true, message: "Please enter your street" }]}
                                >
                                    <Input placeholder="Enter street name" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="houseNumber"
                                    label="Nr."
                                    rules={[{ required: true, message: "Required" }]}
                                >
                                    <Input placeholder="No." />
                                </Form.Item>
                            </Col>
                        </Row>

                    </>
                );

            case 2:
                return (
                    <>

                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                padding: "20px",
            }}
        >
            <Card title="Create Account" style={{ width: "100%", maxWidth: 600 }}>
                <Steps current={currentStep} items={steps} style={{ marginBottom: 30 }} />

                <Form form={form} layout="vertical">
                    {renderStepContent()}

                    <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
                        <div style={{ display: "flex", gap: 10 }}>
                            {currentStep > 0 && (
                                <Button onClick={previousStep} style={{ flex: 1 }}>
                                    Previous
                                </Button>
                            )}
                            {currentStep < steps.length - 1 ? (
                                <Button type="primary" onClick={nextStep} style={{ flex: 1 }}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="primary" onClick={handleSubmit} block>
                                    Complete Registration
                                </Button>
                            )}
                        </div>
                    </Form.Item>

                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <Text type="secondary">Already have an account? </Text>
                        <a onClick={switchToLogin}>Login here</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;