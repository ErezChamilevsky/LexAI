import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LandingPage = ({ onLoginSuccess }) => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-pink-50 to-purple-50">
            {/* Hero Section */}
            <div className="max-w-2xl animate-fade-in flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl">
                    <Globe size={40} />
                </div>

                <h1 className="text-5xl font-black text-slate-800 mb-6 leading-tight">
                    Master any language with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">AI Intelligence.</span>
                </h1>

                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                    Personalized tutoring, real-time corrections, and interactive challenges designed to make you fluent faster.
                </p>

                {/* Real Google Login Button */}
                <div className="transform hover:scale-105 transition-transform">
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            console.log("Google Login Success");
                            onLoginSuccess(credentialResponse.credential);
                        }}
                        onError={() => console.log('Login Failed')}
                        useOneTap={false}
                        flow="implicit"
                        shape="pill"
                        theme="filled_black"
                        text="continue_with"
                    />
                </div>
            </div>

            {/* Feature Preview Mini-Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full max-w-4xl opacity-70">
                {['Smart Chat', 'Reading Tests', 'Speaking Drills'].map((feat, i) => (
                    <div key={i} className="bg-white/40 border border-white p-4 rounded-2xl backdrop-blur-sm">
                        <span className="font-bold text-slate-800">{feat}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LandingPage;