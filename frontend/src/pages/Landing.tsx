import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import BlobsImage2 from "../assets/app_assets/blobs2.png";
import BlobsImage from "../assets/app_assets/blobs.png";

export default function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      setError(result.error.message || "Sign up failed");
      setLoading(false);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-tertiary">
      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-tertiary flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Heading */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-medium text-secondary">
              Welcome
            </h1>
            <p className="text-sm text-secondary/70 leading-relaxed">
              Share your special moments with friends and family in a fun and interactive way.
              Send surprise photos that can only be unlocked by playing a game.
            </p>
          </div>

          {/* Start Sending Section */}
          <div className="space-y-4">
            <p className="text-center text-base text-secondary font-medium">
              Start sending surprises
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              {/* Name Input */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
              />

              {/* Email Input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
              />

              {/* Password Input */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                required
                className="w-full px-5 py-3 bg-white rounded-2xl text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-card"
              />

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-actionButton text-white rounded-2xl font-medium hover:opacity-90 transition-opacity shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm text-secondary mt-6">
              Already have an account?{" "}
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

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen bg-tertiary relative overflow-hidden">
        {/* Decorative Blobs - Bottom Left */}
        <img 
          src={BlobsImage2} 
          alt="" 
          className="fixed bottom-[-50px] left-[-50px] w-[30%] h-auto pointer-events-none opacity-90"
          style={{ maxHeight: '60vh' }}
        />
        
        {/* Decorative Blobs - Bottom Right (Flipped) */}
        <img 
          src={BlobsImage} 
          alt="" 
          className="fixed bottom-[-50px] right-[-50px] w-[30%] h-auto pointer-events-none opacity-90"
          style={{ maxHeight: '60vh' }}
        />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 pb-32">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Welcome Heading */}
            <h1 className="text-6xl font-medium text-secondary mb-6">
              Welcome
            </h1>

            {/* Description Text */}
            <p className="text-base text-secondary leading-relaxed mb-8">
              Share your special moments with friends and family in a fun and interactive way. 
              Send surprise photos that can only be unlocked by playing a game. 
              Make every reveal an exciting experience and create lasting memories together.
            </p>

            {/* Start Sending Section */}
            <div className="space-y-4">
              <p className="text-base text-secondary font-medium">
                Start sending surprises
              </p>

              <form onSubmit={handleRegister} className="space-y-4 max-w-lg mx-auto">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full text-sm">
                    {error}
                  </div>
                )}

                {/* Name Input */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                />

                {/* Email Input */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                />

                {/* Password Input */}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                  className="w-full px-6 py-3 bg-white rounded-full text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-actionButton shadow-md"
                />

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3 bg-actionButton text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Register"}
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-sm text-secondary mt-4">
                Already have an account?{" "}
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
    </div>
  );
}

