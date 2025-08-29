import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { AIResponseFormat } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import type { Route } from "./+types/upload";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ScoreMyResume | Upload Resume" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
}

const UploadPage = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/upload");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    if (!file) return;
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 800);
    return interval;
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    const progressInterval = simulateProgress();

    try {
      setStatusText("Uploading your resume...");
      setCurrentStep(1);
      const uploadedFile = await fs.upload([file]);
      setProgress(30);

      if (!uploadedFile) throw new Error("Upload failed");

      setStatusText("Processing document...");
      setCurrentStep(2);
      const imageFile = await convertPdfToImage(file);
      setProgress(50);

      if (!imageFile.file) throw new Error("PDF conversion failed");

      setStatusText("Finalizing upload...");
      setCurrentStep(3);
      const uploadedImage = await fs.upload([imageFile.file]);
      setProgress(70);

      if (!uploadedImage) throw new Error("Image upload failed");

      setStatusText("Preparing analysis...");
      setCurrentStep(4);
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setProgress(85);

      setStatusText("Analyzing your resume...");
      setCurrentStep(5);
      const feedback = await ai.feedback(
        uploadedFile.path,
        `You are an expert in ATS and resume analysis.
        Analyze and rate this resume. Be thorough.
        Job title: ${jobTitle}
        Job description: ${jobDescription}
        Format: ${AIResponseFormat}
        Return only JSON, no backticks, no extra text.`
      );

      if (!feedback) throw new Error("AI analysis failed");

      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;
      data.feedback = JSON.parse(feedbackText);

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setProgress(100);
      setStatusText("Analysis complete! Redirecting...");
      setCurrentStep(6);

      setTimeout(() => navigate(`/resume/${uuid}`), 1500);
    } catch (error) {
      setStatusText("Failed to process resume");
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-800 relative">
      {/* Subtle texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-2"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: "30px 30px",
        }}
      />

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-slate-500 mb-5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            AI-POWERED ANALYSIS
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-thin leading-tight mb-6">
            <span>Optimize your</span>
            <span className="font-black bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text block mt-2">
              resume for success.
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload your resume and get AI-powered feedback to beat ATS and land more interviews.
          </p>
        </div>

        {isProcessing ? (
          /* Processing View */
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-8 max-w-3xl mx-auto border border-slate-100">
            <div className="flex flex-col items-center justify-center py-12">
              {/* Radar Pulse */}
              <div className="relative mb-10">
                <div className="w-32 h-32 border-2 border-slate-100 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '1.2s' }}></div>
                </div>
                <div className="absolute inset-0 w-32 h-32 rounded-full bg-blue-500/5 animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-slate-800">
                  {progress}%
                </div>
              </div>

              <h2 className="text-2xl font-light text-slate-900 mb-3">Analyzing Your Resume</h2>
              <p className="text-slate-600 mb-8 max-w-md text-center">{statusText}</p>

              {/* Step Indicator */}
              <div className="w-full max-w-lg mb-8">
                <div className="flex justify-between relative">
                  {["Upload", "Process", "Convert", "Prepare", "Analyze", "Done"].map((label, i) => (
                    <div key={i} className="flex flex-col items-center group">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${currentStep > i + 1
                            ? "bg-blue-600 text-white shadow-lg scale-110"
                            : currentStep === i + 1
                              ? "bg-white border-2 border-blue-500 text-blue-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                      >
                        {currentStep > i + 1 ? "✓" : i + 1}
                      </div>
                      <div className="text-xs mt-2 text-slate-500 group-hover:text-slate-700 transition-colors">
                        {label}
                      </div>
                    </div>
                  ))}
                  <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-100">
                    <div
                      className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${(currentStep - 1) * 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Usually takes under a minute
              </p>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Info Panel */}
            <div className="lg:w-2/5 bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <div className="space-y-8">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 mb-2">Why This Matters</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    75% of resumes are filtered out by ATS before a human sees them. Let AI help you get past the bots.
                  </p>
                </div>

                {[
                  { title: "ATS Optimization", desc: "Beat automated screening systems", icon: "📄" },
                  { title: "Keyword Match", desc: "Align with job description", icon: "🔍" },
                  { title: "Expert Feedback", desc: "Improve impact & readability", icon: "💡" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="text-2xl mt-0.5">{item.icon}</div>
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-3/5 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-slate-900">Submit for Analysis</h2>
                    <p className="text-slate-500 text-sm">Fill in job details for targeted feedback</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Company Name *</label>
                      <input
                        type="text"
                        name="company-name"
                        required
                        placeholder="e.g. Google"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Job Title *</label>
                      <input
                        type="text"
                        name="job-title"
                        required
                        placeholder="e.g. Software Engineer"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Job Description (Optional)</label>
                    <textarea
                      name="job-description"
                      placeholder="Paste the job description for better feedback..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">Helps tailor feedback to the role</p>
                  </div>

                  {/* Custom File Upload Zone */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Upload Resume (PDF) *</label>
                    <div
                      className={`relative w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
                        ${file
                          ? "border-green-300 bg-green-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
                      `}
                      onClick={() => document.getElementById("file-input")?.click()}
                    >
                      {!file ? (
                        <div className="text-center">
                          {/* Animated PDF Icon */}
                          <div className="flex justify-center mb-4 animate-pulse">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">
                            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-slate-500 mt-1">PDF up to 5MB</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{file.name}</p>
                              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <input
                        id="file-input"
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">We never store your data permanently.</p>
                  </div>

                  {file && (
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <span>Analyze My Resume</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  )}
                </form>
              </div>

              <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs text-slate-500">
                  Your data is encrypted. We never share it with third parties.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {!isProcessing && (
          <div className="mt-20 text-center max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="text-3xl font-black text-slate-900 mb-2">75%</div>
                <p className="text-slate-600 text-sm">of resumes rejected by ATS</p>
              </div>
              <div className="p-6">
                <div className="text-3xl font-black text-slate-900 mb-2">5x</div>
                <p className="text-slate-600 text-sm">more interviews with optimization</p>
              </div>
              <div className="p-6">
                <div className="text-3xl font-black text-slate-900 mb-2">98%</div>
                <p className="text-slate-600 text-sm">of Fortune 500 companies use ATS</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default UploadPage;