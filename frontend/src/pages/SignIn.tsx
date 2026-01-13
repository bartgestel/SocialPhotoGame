import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import BlobsImage2 from "../assets/app_assets/blobs2.png";
import BlobsImage from "../assets/app_assets/blobs.png";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await authClient.signIn.email({
            email,
            password,
        });

        if (result.error) {
            setError(result.error.message || 'Sign in failed');
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
                    {/* Welcome Back Heading */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-4xl font-medium text-secondary">
                            Welcome back
                        </h1>
                        <p className="text-sm text-secondary/70">
                            Sign in to continue sharing your special moments
                        </p>
                    </div>

                    {/* Sign In Form */}
                    <form onSubmit={handleSignIn} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm">
                                {error}
                            </div>
                        )}

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
                            placeholder="Your password"
                            className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
                        />

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-actionButton text-white rounded-2xl font-medium hover:opacity-90 transition-opacity shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-secondary mt-6">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate("/signup")}
                            className="text-actionButton hover:underline font-medium"
                        >
                            Sign up
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
                        {/* Welcome Back Heading */}
                        <h1 className="text-6xl font-medium text-secondary mb-6">
                            Welcome back
                        </h1>

                        <p className="text-base text-secondary mb-8">
                            Sign in to continue sharing your special moments
                        </p>

                        {/* Sign In Form */}
                        <form onSubmit={handleSignIn} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full text-sm">
                                    {error}
                                </div>
                            )}

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
                                placeholder="Your password"
                                className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                            />

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-8 py-3 bg-actionButton text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <p className="text-sm text-secondary mt-4">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate("/signup")}
                                className="text-actionButton hover:underline font-medium"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

