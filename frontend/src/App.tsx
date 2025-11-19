// src/App.tsx
import { useState } from 'react';
import { authClient } from './lib/auth-client';

export default function App() {
    const [isRegistering, setIsRegistering] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Only needed for Sign Up

    const handleAuth = async () => {
        if (isRegistering) {
            // --- SIGN UP LOGIC ---
            await authClient.signUp.email({
                email,
                password,
                name,
            }, {
                onSuccess: (ctx) => {
                    alert("🎉 Account created! Redirecting...");
                    // Ideally, you redirect to dashboard here
                },
                onError: (ctx) => {
                    alert("❌ Sign Up Failed: " + ctx.error.message);
                }
            });
        } else {
            // --- SIGN IN LOGIC ---
            await authClient.signIn.email({
                email,
                password,
            }, {
                onSuccess: () => {
                    alert("🎉 Logged in successfully!");
                    // Ideally, you redirect to dashboard here
                },
                onError: (ctx) => {
                    alert("❌ Login Failed: " + ctx.error.message);
                }
            });
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                border: '1px solid #ccc',
                padding: '40px',
                borderRadius: '8px',
                width: '300px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>

                {/* Name Field (Only show if registering) */}
                {isRegistering && (
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Name</label>
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>
                )}

                {/* Email Field */}
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email</label>
                    <input
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {/* Action Button */}
                <button
                    onClick={handleAuth}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {isRegistering ? 'Sign Up' : 'Sign In'}
                </button>

                {/* Toggle Switch */}
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    {isRegistering ? "Already have an account?" : "Don't have an account?"} <br/>
                    <span
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                    >
            {isRegistering ? 'Login here' : 'Create one'}
          </span>
                </p>

            </div>
        </div>
    );
}