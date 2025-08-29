import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { AIResponseFormat } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import type { Route } from "./+types/upload";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ScoreMyResume" },
    { name: "description", content: "Upload your resume to get feedback" },
  ];
}

const UploadPage = () => {
  const { auth, isLoading, error, fs, ai, kv } = usePuterStore();
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
  }, [isLoading]);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    if (!file) {
      return;
    }
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
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

      if (!uploadedFile) {
        setStatusText("Error: Failed to upload file");
        clearInterval(progressInterval);
        return;
      }

      setStatusText("Processing document...");
      setCurrentStep(2);
      const imageFile = await convertPdfToImage(file);
      setProgress(50);

      if (!imageFile.file) {
        setStatusText("Error: Failed to convert PDF to image");
        clearInterval(progressInterval);
        return;
      }

      setStatusText("Finalizing upload...");
      setCurrentStep(3);
      const uploadedImage = await fs.upload([imageFile.file]);
      setProgress(70);

      if (!uploadedImage) {
        setStatusText("Error: Failed to upload image");
        clearInterval(progressInterval);
        return;
      }

      setStatusText("Preparing analysis...");
      setCurrentStep(4);
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName: companyName,
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        feedback: "",
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setProgress(85);

      setStatusText("Analyzing your resume...");
      setCurrentStep(5);
      const feedback = await ai.feedback(
        uploadedFile.path,
        `You are an expert in ATS (Applicant Tracking System) and resume analysis.
        Please analyze and rate this resume and suggest how to improve it.
        The rating can be low if the resume is bad.
        Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
        If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
        If available, use the job description for the job user is applying to to give more detailed feedback.
        If provided, take the job description into consideration.
        The job title is: ${jobTitle}
        The job description is: ${jobDescription}
        Provide the feedback using the following format:
        ${AIResponseFormat}
        Return the analysis as an JSON object, without any other text and without the backticks.
        Do not include any other text or comments.`
      );

      if (!feedback) {
        setStatusText("Error: Failed to analyze resume");
        clearInterval(progressInterval);
        return;
      }

      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;
      data.feedback = JSON.parse(feedbackText);

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setProgress(100);
      setStatusText("Analysis complete! Redirecting...");
      setCurrentStep(6);

      setTimeout(() => {
        navigate(`/resume/${uuid}`);
      }, 1500);
    } catch (error) {
      setStatusText("An error occurred during processing");
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-blue-600 font-medium text-sm">AI-Powered Resume Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Land More Interviews With
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
              Optimized Resumes
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get detailed feedback on how to improve your resume for specific roles and pass automated screening systems
          </p>
        </div>

        {isProcessing ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-8">
              {/* Animated progress circle */}
              <div className="relative mb-8">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={339.3}
                    strokeDashoffset={339.3 - (progress / 100) * 339.3}
                    className="transition-all duration-500 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{progress}%</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">Analyzing Your Resume</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{statusText}</p>

              {/* Step indicator */}
              <div className="w-full max-w-md mb-8">
                <div className="flex justify-between items-center relative">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                        }`}>
                        {step}
                      </div>
                      <div className="text-xs mt-2 text-gray-500 hidden md:block">
                        {step === 1 && 'Uploading'}
                        {step === 2 && 'Processing'}
                        {step === 3 && 'Converting'}
                        {step === 4 && 'Preparing'}
                        {step === 5 && 'Analyzing'}
                        {step === 6 && 'Complete'}
                      </div>
                    </div>
                  ))}
                  <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 -z-1">
                    <div
                      className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                      style={{ width: `${(currentStep - 1) * 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This usually takes less than a minute
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Info Panel */}
            <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg overflow-hidden relative">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="mb-10">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Why Resume Analysis Matters</h3>
                  <p className="opacity-90">75% of resumes are rejected by ATS before they ever reach a human. Make sure yours isn't one of them.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-white/20 rounded-full p-2 mr-4 mt-0.5 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">ATS Optimization</h4>
                      <p className="text-sm opacity-90 mt-1">Ensure your resume passes automated tracking systems used by most companies</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-white/20 rounded-full p-2 mr-4 mt-0.5 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">Keyword Matching</h4>
                      <p className="text-sm opacity-90 mt-1">Align your resume with specific job requirements and increase match rates</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-white/20 rounded-full p-2 mr-4 mt-0.5 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">Expert Feedback</h4>
                      <p className="text-sm opacity-90 mt-1">Get actionable suggestions to improve your resume's impact and readability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Panel */}
            <div className="lg:w-3/5 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Request</h2>
                    <p className="text-gray-600">Complete the form below to get started</p>
                  </div>
                </div>

                <form
                  id="upload-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="company-name" className="text-sm font-medium text-gray-700 flex items-center">
                        Company Name
                        <span className="text-blue-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="company-name"
                          placeholder="e.g. Google, Amazon"
                          id="company-name"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="job-title" className="text-sm font-medium text-gray-700 flex items-center">
                        Job Title
                        <span className="text-blue-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="job-title"
                          placeholder="e.g. Software Engineer"
                          id="job-title"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                      Job Description (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <textarea
                        name="job-description"
                        id="job-description"
                        placeholder="Paste the job description here for targeted feedback..."
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Adding the job description helps us provide more specific feedback tailored to the role</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Upload Your Resume
                      <span className="text-blue-500 ml-1">*</span>
                    </label>
                    <FileUploader onFileSelect={handleFileSelect} />
                    <p className="text-xs text-gray-500">Supported format: PDF. Max file size: 5MB. We don't store your personal data.</p>
                  </div>

                  {file && (
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center group"
                    >
                      <span>Analyze My Resume</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  )}
                </form>
              </div>

              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-gray-600">
                  Your data is encrypted and secure. We prioritize your privacy and never share your information with third parties.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {!isProcessing && (
        <div className="bg-white border-t border-gray-100 mt-16 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">75%</div>
                <p className="text-gray-600">of resumes are rejected by ATS before reaching a human</p>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">5x</div>
                <p className="text-gray-600">more interviews with an optimized resume</p>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <p className="text-gray-600">of Fortune 500 companies use ATS to screen candidates</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;