import React, { useState } from "react";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
    console.log("Submitting with Email:", email); // Add this
    console.log("Submitting with Password:", pass)
        e.preventDefault();
        if (!email || !pass) {
            setError("يرجى إدخال البريد وكلمة المرور");
            return;
        }
        setError("");
        console.log('Sending login request to:', '/api/Auth/login');
        fetch("/api/Auth/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, password: pass})
        })
        .then(async res => {
            console.log('Login response status:', res.status);
            if (!res.ok) {
                // Try to get the error message from the response
                const errorText = await res.text();
                console.error('Server response:', errorText);
                throw new Error(errorText || 'Login failed');
            }
            return res.json();
        })
        .then(data => {
            console.log('Login successful, token received');
            localStorage.setItem("auth_token", data.token);
            console.log(data)
            onLogin();
        })
        .catch(err => {
            console.error("Login error:", err);
            setError(err.message || "Login failed. Please check your credentials and network connection.");
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-govbg px-2">
            <form
                className="gov-card max-w-lg w-full fade-in"
                onSubmit={handleLogin}
                style={{ direction: "rtl" }}
            >
                <div className="gov-title text-center mb-2">تسجيل الدخول</div>
                <label className="gov-label">البريد الإلكتروني</label>
                <input
                    className="gov-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                />
                <label className="gov-label">كلمة المرور</label>
                <input
                    className="gov-input"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    type="password"
                    placeholder="أدخل كلمة السر"
                />
                {error && <div className="text-red text-sm">{error}</div>}
                <button className="gov-btn w-full mt-2" type="submit">
                    دخول
                </button>
            </form>
        </div>
    );
}