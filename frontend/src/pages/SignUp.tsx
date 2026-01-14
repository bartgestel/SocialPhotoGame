import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import BlobsImage2 from "../assets/app_assets/blobs2.png";
import BlobsImage from "../assets/app_assets/blobs.png";

export default function SignUp() {
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Pre-fill email if passed from landing page
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await authClient.signUp.email({
            email,
            password,
            name,
        });

        if (result.error) {
            setError(result.error.message || 'Sign up failed');
            setLoading(false);
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="min-h-screen bg-tertiary">
            {/* Mobile Layout */}
            <div className="lg:hidden min-h-screen bg-tertiary flex flex-col items-center justify-center px-6 py-8">
                <div className="w-full max-w-md space-y-6">
                    {/* Create Account Heading */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-4xl font-medium text-secondary">
                            Create Account
                        </h1>
                        <p className="text-sm text-secondary/70">
                            Join us to start sharing your special moments
                        </p>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name Input */}
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
                        />

                        {/* Email Input */}
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
                        />

                        {/* Password Input */}
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create password"
                            minLength={8}
                            className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
                        />

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-actionButton text-white rounded-2xl font-medium hover:opacity-90 transition-opacity shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-secondary mt-6">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate("/signin")}
                            className="text-actionButton hover:underline font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block min-h-screen bg-tertiary relative overflow-hidden">
                {/* Decorative Blobs - Bottom Left */}
                <img 
                    src={BlobsImage2} 
                    alt="" 
                    className="fixed bottom-[-50px] left-[-50px] w-[30%] h-auto pointer-events-none opacity-90"
                    style={{ maxHeight: '60vh' }}
                />
                
                {/* Decorative Blobs - Bottom Right */}
                <img 
                    src={BlobsImage} 
                    alt="" 
                    className="fixed bottom-[-50px] right-[-50px] w-[30%] h-auto pointer-events-none opacity-90"
                    style={{ maxHeight: '60vh' }}
                />

                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
                    <div className="max-w-lg w-full text-center space-y-8">
                        {/* Create Account Heading */}
                        <h1 className="text-6xl font-medium text-secondary mb-6">
                            Create Account
                        </h1>

                        <p className="text-base text-secondary mb-8">
                            Join us to start sharing your special moments
                        </p>

                        {/* Sign Up Form */}
                        <form onSubmit={handleSignUp} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Name Input */}
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                            />

                            {/* Email Input */}
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                            />

                            {/* Password Input */}
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create password"
                                minLength={8}
                                className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                            />

                            {/* Sign Up Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-8 py-3 bg-actionButton text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <p className="text-sm text-secondary mt-4">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate("/signin")}
                                className="text-actionButton hover:underline font-medium"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

