import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import Navbar from "../components/Navbar";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ScoreMyResume" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, navigate]);

  // Load resumes
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const resumes = (await kv.list("resume:*", true)) as KVItem[];
        const parsedResumes = resumes.map((resume) => {
          const data = JSON.parse(resume.value);
          return data as Resume;
        });
        setResumes(parsedResumes);
      } catch (err) {
        console.error("Failed to load resumes:", err);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (auth.isAuthenticated) loadResumes();
  }, [auth.isAuthenticated]);

  // Parallax mouse tracking
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-800 relative overflow-hidden">
      {/* Ultra-Soft Parallax Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-5"
        style={{
          transform: `translate(${mouse.x * -0.005}px, ${mouse.y * -0.005}px)`,
        }}
      >
        <div
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: "30px 30px",
            width: "300%",
            height: "300%",
            top: "-100%",
            left: "-100%",
            position: "absolute",
          }}
        />
      </div>

      {/* Floating AI Pulse Orb */}
      <div className="fixed top-24 right-12 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg opacity-40 animate-pulse z-0"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <section className="main-section px-6 py-20 relative z-10 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          {/* AI Status */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-widest font-medium text-slate-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-60"></span>
                <span className="relative rounded-full h-2.5 w-2.5 bg-blue-500 shadow-sm"></span>
              </span>
              AI READY
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-thin leading-tight mb-6">
            <span className="block">Build a</span>
            <span className="font-black bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text">
              winning resume.
            </span>
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto opacity-90">
            Get intelligent, instant feedback to optimize clarity, impact, and ATS compatibility.
          </p>

          {/* Status Banner */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm text-slate-500 max-w-xl mx-auto cursor-default hover:bg-slate-100 transition-colors">
            {resumes.length === 0 && !loadingResumes
              ? "Upload your resume to unlock AI-powered insights."
              : "Your resumes are ready for review and refinement."}
          </div>
        </div>

        {/* Loading */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center py-32 gap-8">
            <div className="relative">
              <div className="w-20 h-20 border-5 border-slate-100 rounded-full"></div>
              <div
                className="w-20 h-20 border-5 border-blue-500 border-t-transparent rounded-full absolute top-0 animate-spin"
                style={{ animationDuration: "1.1s" }}
              ></div>
            </div>
            <p className="text-slate-500 text-lg font-medium">Preparing your documents...</p>
          </div>
        )}

        {/* Resumes */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="mb-32">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-14">
              <h2 className="text-3xl font-thin text-slate-900">Your Resumes</h2>
              <Link
                to="/upload"
                className="group text-sm font-medium text-blue-600 transition-all flex items-center gap-2.5 hover:text-blue-800"
              >
                <div className="relative w-5 h-5 flex items-center justify-center group-hover:scale-110">
                  <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 group-hover:opacity-60 animate-pulse"></div>
                  <svg className="h-3.5 w-3.5 relative z-10" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                </div>
                Upload New
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resumes.map((resume, i) => (
                <div
                  key={resume.id}
                  className="group relative"
                  style={{ animation: `fadeInUp 0.7s ease-out ${i * 0.1}s both` }}
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-60 transition duration-700" style={{ filter: "blur(28px)" }}></div>
                  <div className="relative bg-white border border-slate-100 rounded-2xl p-7 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 cursor-pointer">
                    <ResumeCard resume={resume} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 gap-20 max-w-4xl mx-auto">
            <div className="group relative max-w-xs w-full">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-400/15 to-indigo-500/15 blur-2xl opacity-0 group-hover:opacity-50 transition duration-700" style={{ filter: "blur(32px)" }}></div>
              <div className="relative bg-white border border-slate-100 rounded-3xl p-12 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-4 cursor-pointer">
                <div className="w-20 h-20 bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
                  <svg className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Ready to begin?</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Upload your first resume and let AI guide your improvement.</p>
                <Link to="/upload" className="inline-block w-full py-3.5 text-sm font-semibold text-blue-600 border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  ➕ Upload Resume
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 w-full">
              {[
                { t: "Instant AI Feedback", d: "Get insights in seconds.", i: "⚡" },
                { t: "ATS Optimized", d: "Beat applicant tracking.", i: "📄" },
                { t: "Track & Improve", d: "Refine over time.", i: "📈" },
              ].map((f, i) => (
                <div key={i} className="group text-center p-7 rounded-2xl hover:bg-slate-50 transition-all cursor-default hover:scale-105">
                  <div className="text-3xl mb-5 group-hover:scale-110 transition">{f.i}</div>
                  <h4 className="font-bold text-slate-900 text-base mb-2.5">{f.t}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}