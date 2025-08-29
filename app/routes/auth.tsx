import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "../lib/puter";
import type { Route } from "./+types/auth";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ScoreMyResume | Authentication" },
    { name: "description", content: "Log in to your account" },
  ];
}

const AuthPage = () => {
  const { auth, isLoading } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated && next) {
      navigate(next);
    }
  }, [auth.isAuthenticated, next]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center gap-6 text-center mb-8">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Authentication
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
              <p className="text-slate-600">Sign in to continue your job search journey</p>
            </div>

            <div className="py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full absolute top-0 animate-spin"></div>
                  </div>
                  <p className="text-slate-600 font-medium">Signing you in...</p>
                </div>
              ) : (
                <>
                  {auth.isAuthenticated ? (
                    <div className="flex flex-col gap-6">
                      <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p>You are already signed in. Redirecting you shortly...</p>
                      </div>
                      <button
                        className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-2"
                        onClick={auth.signOut}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center gap-2 group"
                        onClick={auth.signIn}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Sign In to Continue
                      </button>

                      <div className="relative flex items-center pt-4">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-500 text-sm">Why sign in?</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-slate-700">Secure storage for your resumes</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-slate-700">AI-powered feedback on your applications</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-slate-700">Track all your job applications in one place</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50/70 border-t border-slate-100/50 p-5 text-center">
            <p className="text-sm text-slate-500">
              By signing in, you agree to our <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms</a> and <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;