import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/feebdack/ATS";
import Details from "~/components/feebdack/Details";
import Summary from "~/components/feebdack/Summary";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/resume";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Resume Review" },
    { name: "description", content: "A detailed overview of your resume" },
  ];
}

const ResumePage = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) return;
      const data = JSON.parse(resume);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
      setFeedback(data.feedback);
    };
    loadResume();
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 relative">
      {/* Subtle Dot Texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-2"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Navigation */}
      <nav className="px-6 py-4 bg-white/70 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m7 7l7-7m-7 7V2" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </nav>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3rem)]">
        {/* Left: Resume Preview (Sticky) */}
        <section className="lg:w-2/5 h-screen sticky top-16 bg-white border-r border-slate-100 flex items-center justify-center p-6 lg:p-10">
          {imageUrl && resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block max-w-xs w-full mx-auto"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-blue-400/10 to-indigo-500/10 opacity-0 group-hover:opacity-40 blur-xl transition duration-500"></div>
              <div className="relative bg-white border border-slate-200 rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200">
                <img
                  src={imageUrl}
                  alt="Resume Preview"
                  className="w-full h-auto object-contain rounded-xl"
                  style={{ maxHeight: "75vh" }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-2xl transition-colors duration-300"></div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 px-2.5 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Open PDF
                </div>
              </div>
            </a>
          ) : (
            <p className="text-slate-500 italic">Loading preview...</p>
          )}
        </section>

        {/* Right: Feedback */}
        <section className="lg:w-3/5 p-6 lg:p-10 overflow-y-auto bg-slate-50">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-4xl font-thin leading-tight mb-2">
                <span className="block">Your resume</span>
                <span className="font-black bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text">performance report</span>
              </h2>
              <p className="text-slate-600 mt-3">
                AI-powered insights to help you improve and get hired faster.
              </p>
            </div>

            {feedback ? (
              <div className="space-y-10 animate-in fade-in duration-700">
                {/* Score Card */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-xl font-light text-slate-900 mb-6">Overall Score</h3>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * (feedback.ATS.score || 0)) / 100}
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800">{feedback.ATS.score || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Content Quality</span>
                        <span className="font-medium">{feedback.ATS.score > 70 ? 'Excellent' : feedback.ATS.score > 50 ? 'Good' : 'Needs Work'}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${feedback.ATS.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-slate-900">Executive Summary</h3>
                  </div>
                  <Summary feedback={feedback} />
                </div>

                {/* ATS */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-slate-900">ATS Optimization</h3>
                  </div>
                  <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                </div>

                {/* Details */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-slate-900">Detailed Analysis</h3>
                  </div>
                  <Details feedback={feedback} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full absolute top-0 animate-spin" style={{ animationDuration: '1.1s' }}></div>
                </div>
                <h3 className="text-2xl font-light text-slate-900 mb-3">Analyzing Your Resume</h3>
                <p className="text-slate-600">This may take a few moments...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResumePage;