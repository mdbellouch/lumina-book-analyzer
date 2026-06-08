import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  AlertTriangle, 
  Layers, 
  PenTool, 
  Upload, 
  ChevronRight, 
  BookMarked,
  Info,
  Download,
  Copy,
  Check,
  Key,
  Settings,
  Edit3,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SAMPLE_MANUSCRIPTS } from "./samples";
import { BookAnalysisResult } from "./types";

export default function App() {
  // Input states
  const [selectedSampleId, setSelectedSampleId] = useState<string>("sci-fi");
  const [manuscriptText, setManuscriptText] = useState<string>(SAMPLE_MANUSCRIPTS[0].content);
  const [fileType, setFileType] = useState<"markdown" | "txt" | "pdf">("markdown");
  const [fileName, setFileName] = useState<string>("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);

  // Drag over state for styling feedback
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<BookAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"metrics" | "grammar" | "readability" | "flow" | "structure">("metrics");
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  // API key configuration state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [sessionApiKey, setSessionApiKey] = useState<string>(() => localStorage.getItem("lumina_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => localStorage.getItem("lumina_api_key") || "");
  const [manuscriptCopied, setManuscriptCopied] = useState<boolean>(false);
  const [isEditingInViewer, setIsEditingInViewer] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const paperScrollRef = useRef<HTMLDivElement>(null);

  // Load sample book
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_MANUSCRIPTS.find((s) => s.id === sampleId);
    if (sample) {
      setSelectedSampleId(sampleId);
      setManuscriptText(sample.content);
      setFileType(sample.type as "markdown" | "txt" | "pdf");
      setFileName("");
      setFileBase64(null);
      setFileMime(null);
      setActiveHighlight(null);
      setErrorMsg(null);
    }
  };

  // Convert uploaded files
  const processUploadedFile = (file: File) => {
    const name = file.name;
    const type = file.type;
    const extension = name.split(".").pop()?.toLowerCase();

    // Prevent Out of Memory crashes and network gateway timeouts from excessively large uploads
    const maxPdfSize = 4 * 1024 * 1024; // 4MB
    const maxTextSize = 1.5 * 1024 * 1024; // 1.5MB

    if (extension === "pdf") {
      if (file.size > maxPdfSize) {
        setErrorMsg("The uploaded PDF exceeds the 4MB payload limit. To ensure the remote analysis engine does not timeout, please upload a shorter PDF segment.");
        return;
      }
      setFileType("pdf");
      setFileName(name);
      setSelectedSampleId("uploaded");
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(",")[1];
        setFileBase64(base64Data);
        setFileMime("application/pdf");
        setManuscriptText("PDF binary data uploaded. Content is being parsed directly by Gemini.");
      };
      reader.readAsDataURL(file);
    } else if (extension === "md" || extension === "txt" || type.startsWith("text/")) {
      if (file.size > maxTextSize) {
        setErrorMsg("The uploaded file exceeds the 1.5MB text limit. To ensure the analysis completes within the network timeout window, please upload a shorter chapter excerpt.");
        return;
      }
      const typeLabel = extension === "md" ? "markdown" : "txt";
      setFileType(typeLabel);
      setFileName(name);
      setSelectedSampleId("uploaded");
      setFileBase64(null);
      setFileMime(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setManuscriptText(text);
      };
      reader.readAsText(file);
    } else {
      setErrorMsg("Unsupported file format. Please upload markdown (.md), text (.txt), or PDF (.pdf) files.");
    }
  };

  // Drag and drop events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Analyze book handler
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorMsg(null);
    setActiveHighlight(null);

    const steps = [
      "Accessing remote analysis corridors...",
      "Executing parser token mapping checks...",
      "Reading linguistic structures and mechanics...",
      "Scanning plot, terminology, and backstory timeline inconsistencies...",
      "Balancing structural developmental pacing grids...",
      "Formulating draft intelligence report ledger..."
    ];

    let currentStep = 0;
    setAnalysisStep(steps[currentStep]);

    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setAnalysisStep(steps[currentStep]);
      }
    }, 1200);

    try {
      const bodyPayload: any = {};
      if (fileType === "pdf" && fileBase64 && fileMime) {
        bodyPayload.fileData = fileBase64;
        bodyPayload.mimeType = fileMime;
        bodyPayload.fileName = fileName;
      } else {
        bodyPayload.text = manuscriptText;
      }

      const resolvedHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionApiKey && sessionApiKey.trim().length > 0) {
        resolvedHeaders["x-gemini-api-key"] = sessionApiKey.trim();
      }

      const response = await fetch("/api/analyze-book", {
        method: "POST",
        headers: resolvedHeaders,
        body: JSON.stringify(bodyPayload),
      });

      clearInterval(interval);

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let errorMsg = "Failed to analyze book manuscript.";
        let isQuota = false;

        if (contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            if (errorData.isQuotaExceeded) {
              isQuota = true;
            }
            errorMsg = errorData.error || errorMsg;
          } catch (jsonErr) {
            console.error("Failed to parse JSON error:", jsonErr);
          }
        } else {
          try {
            const textResponse = await response.text();
            console.warn("Server returned non-JSON error page:", textResponse);
            
            const lowerText = textResponse.toLowerCase();
            isQuota = 
              response.status === 429 ||
              response.status === 503 ||
              lowerText.includes("quota") ||
              lowerText.includes("limit") ||
              lowerText.includes("exhausted") ||
              lowerText.includes("429") ||
              lowerText.includes("503") ||
              lowerText.includes("unavailable") ||
              lowerText.includes("demand") ||
              lowerText.includes("overloaded") ||
              lowerText.includes("busy") ||
              lowerText.includes("capacity") ||
              lowerText.includes("too many requests");
            
            if (textResponse.length < 300 && !lowerText.includes("<!doctype")) {
              errorMsg = textResponse;
            } else if (response.status === 503) {
              errorMsg = "The analysis engine is temporarily unavailable due to high system load. Please try again in 1-2 minutes.";
            } else if (response.status === 429) {
              errorMsg = "API quota exceeded. Please reduce the length of your manuscript or wait 60 seconds before retrying.";
            } else {
              errorMsg = `Server error (${response.status}). The service might be experiencing high demand. Please try again soon.`;
            }
          } catch (textErr) {
            console.error("Failed to read text response:", textErr);
          }
        }

        if (isQuota) {
          setIsQuotaModalOpen(true);
          return;
        }
        
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const textResponse = await response.text();
        const firstFewChars = textResponse.substring(0, 50).toLowerCase();
        
        if (firstFewChars.includes("<!doctype") || firstFewChars.includes("<html")) {
          throw new Error("API server route not found or failed to load. Please make sure the backend dev server is running on port 3000.");
        } else {
          throw new Error(`Expected JSON response but received: ${textResponse.substring(0, 100)}`);
        }
      }

      const result: BookAnalysisResult = await response.json();
      setAnalysisResult(result);
      setActiveTab("metrics");
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      
      const isQuotaText = 
        err.message?.toLowerCase().includes("quota") || 
        err.message?.toLowerCase().includes("limit") || 
        err.message?.toLowerCase().includes("exhausted") || 
        err.message?.toLowerCase().includes("429") || 
        err.message?.toLowerCase().includes("503") || 
        err.message?.toLowerCase().includes("unavailable");

      if (isQuotaText) {
        setIsQuotaModalOpen(true);
      } else if (err.message && (err.message.includes("Failed to fetch") || err.message.toLowerCase().includes("fetch"))) {
        setErrorMsg("Network connection interrupted or timed out. Large manuscripts or complex PDFs can take longer than the HTTP gateway timeout to process. Try processing a smaller chapter extract to stay within the limit.");
      } else {
        setErrorMsg(err.message || "An unexpected network or syntax error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatReportMarkdown = () => {
    if (!analysisResult) return "";
    
    const docName = fileName ? fileName : (SAMPLE_MANUSCRIPTS.find(s => s.id === selectedSampleId)?.title || "Manual Input");
    
    let md = `# LUMINA DRAFT INTELLIGENCE REPORT\n`;
    md += `**Manuscript:** ${docName}\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Maturity Score:** ${analysisResult.overallScore}%\n`;
    md += `**Readability Grade:** ${analysisResult.readabilityGrade}\n`;
    md += `**Detected Tone/Style:** ${analysisResult.tone}\n\n`;
    
    md += `## Executive Synthesis\n`;
    md += `${analysisResult.summary}\n\n`;
    
    md += `## Typographical Grammar Diagnostics (${analysisResult.grammarIssues?.length || 0} Issues)\n\n`;
    if (analysisResult.grammarIssues && analysisResult.grammarIssues.length > 0) {
      analysisResult.grammarIssues.forEach((issue) => {
        md += `### [${issue.issueType}] Severity: ${issue.severity.toUpperCase()} (${issue.location})\n`;
        md += `- **Original Phrasing:** "${issue.original}"\n`;
        md += `- **Suggested Patch:** "${issue.correction}"\n`;
        md += `- **Reasoning:** ${issue.explanation}\n\n`;
      });
    } else {
      md += `*No typographical issues detected.*\n\n`;
    }
    
    md += `## Stylistic & Readability Suggestions (${analysisResult.readabilitySuggestions?.length || 0} Suggestions)\n\n`;
    if (analysisResult.readabilitySuggestions && analysisResult.readabilitySuggestions.length > 0) {
      analysisResult.readabilitySuggestions.forEach((sug, i) => {
        md += `### Recommendation #${i + 1}\n`;
        md += `- **Found string:** "${sug.original}"\n`;
        md += `- **Alternative:** "${sug.suggestion}"\n`;
        md += `- **Rationale:** ${sug.reason}\n\n`;
      });
    } else {
      md += `*No styling recommendations found.*\n\n`;
    }
    
    md += `## Narrative Transitions & Logical Flows\n\n`;
    if (analysisResult.logicAndFlow && analysisResult.logicAndFlow.length > 0) {
      analysisResult.logicAndFlow.forEach((flow) => {
        md += `### [${flow.type}]\n`;
        md += `- **Context/Issue:** ${flow.description}\n`;
        md += `- **Editorial Prescription:** ${flow.suggestion}\n\n`;
      });
    } else {
      md += `*No narrative flow anomalies discovered.*\n\n`;
    }
    
    md += `## Character & Timeline Continuity\n\n`;
    if (analysisResult.consistencyIssues && analysisResult.consistencyIssues.length > 0) {
      analysisResult.consistencyIssues.forEach((issue) => {
        md += `### [${issue.category} Consistency]\n`;
        md += `- **Findings:** ${issue.description}\n`;
        md += `- **Correction Strategy:** ${issue.suggestion}\n\n`;
      });
    } else {
      md += `*No timeline or description consistency errors discovered.*\n\n`;
    }

    md += `## Coherence Restructuring Blueprint\n\n`;
    if (analysisResult.structuralCoherence && analysisResult.structuralCoherence.length > 0) {
      analysisResult.structuralCoherence.forEach((struct) => {
        md += `### Section: ${struct.section}\n`;
        md += `- **Strengths:** ${struct.strengths}\n`;
        md += `- **Weaknesses:** ${struct.weaknesses}\n`;
        md += `- **Re-structure Prescription:** ${struct.improvement}\n\n`;
      });
    }

    md += `\n*System Ledger compiled by Lumina Assistant on Cloud Workspace.*`;
    return md;
  };

  const handleExportDownloadMarkdown = () => {
    const markdownContent = formatReportMarkdown();
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const docName = fileName 
      ? fileName.split(".")[0] 
      : (SAMPLE_MANUSCRIPTS.find(s => s.id === selectedSampleId)?.title || "manuscript");
    
    link.setAttribute("download", `lumina_report_${docName.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDownloadJSON = () => {
    if (!analysisResult) return;
    const jsonContent = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const docName = fileName 
      ? fileName.split(".")[0] 
      : (SAMPLE_MANUSCRIPTS.find(s => s.id === selectedSampleId)?.title || "manuscript");
    
    link.setAttribute("download", `lumina_analysis_${docName.toLowerCase().replace(/[^a-z0-9]/gi, "_")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyClipboard = async () => {
    try {
      const markdownContent = formatReportMarkdown();
      await navigator.clipboard.writeText(markdownContent);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    } catch (err) {
      console.error("Failed to copy clipboard:", err);
    }
  };

  const handleCopyManuscript = async () => {
    try {
      await navigator.clipboard.writeText(manuscriptText);
      setManuscriptCopied(true);
      setTimeout(() => setManuscriptCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy manuscript text:", err);
    }
  };

  const applyGrammarFix = (original: string, correction: string) => {
    if (!original || !correction) return;
    let newText = manuscriptText;
    if (newText.includes(original)) {
      newText = newText.replace(original, correction);
    } else {
      const index = newText.toLowerCase().indexOf(original.toLowerCase());
      if (index !== -1) {
        newText = newText.substring(0, index) + correction + newText.substring(index + original.length);
      }
    }
    setManuscriptText(newText);
    if (analysisResult && analysisResult.grammarIssues) {
      setAnalysisResult({
        ...analysisResult,
        grammarIssues: analysisResult.grammarIssues.filter((issue) => issue.original !== original),
      });
    }
  };

  const applyReadabilityFix = (original: string, suggestion: string) => {
    if (!original || !suggestion) return;
    let newText = manuscriptText;
    if (newText.includes(original)) {
      newText = newText.replace(original, suggestion);
    } else {
      const index = newText.toLowerCase().indexOf(original.toLowerCase());
      if (index !== -1) {
        newText = newText.substring(0, index) + suggestion + newText.substring(index + original.length);
      }
    }
    setManuscriptText(newText);
    if (analysisResult && analysisResult.readabilitySuggestions) {
      setAnalysisResult({
        ...analysisResult,
        readabilitySuggestions: analysisResult.readabilitySuggestions.filter((s) => s.original !== original),
      });
    }
  };

  // Safe Highlight text parser (splits around target and renders a styled span wrapper)
  const renderInteractiveManuscript = () => {
    if (fileType === "pdf" && fileName) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-zinc-950 border border-zinc-900 rounded">
          <BookMarked className="w-12 h-12 text-zinc-500 mb-3 animate-pulse" />
          <h4 className="font-sans font-bold text-sm text-zinc-100">{fileName}</h4>
          <p className="font-mono text-[9px] text-zinc-500 mt-1 uppercase tracking-wider">
            PDF Stream Active ({fileBase64 ? Math.round((fileBase64.length * 3) / 4 / 1024) : 0} KB BINARY)
          </p>
          <div className="mt-4 p-3.5 rounded bg-zinc-900 border border-zinc-800 max-w-xs">
            <p className="font-sans text-[11px] text-zinc-300 leading-relaxed text-left">
              <Sparkles className="w-3.5 h-3.5 inline-block mr-1 text-amber-500 animate-spin" />
              <strong>PDF direct parsing:</strong> Raw metadata and textual arrays are read safely on our server and reviewed by Gemini.
            </p>
          </div>
        </div>
      );
    }

    const text = manuscriptText;
    if (!text.trim()) {
      return (
        <div className="text-center py-16 text-zinc-500 font-mono text-xs italic">
          No dynamic source content. Select a template above or upload a draft.
        </div>
      );
    }

    // Capture issues
    interface HighlightItem {
      start: number;
      end: number;
      text: string;
      colorClass: string;
      label: string;
      onClick: () => void;
    }
    const issuesList: HighlightItem[] = [];

    // Let's add grammar issues
    if (analysisResult && analysisResult.grammarIssues) {
      analysisResult.grammarIssues.forEach((issue, idx) => {
        if (!issue.original) return;
        let searchIndex = 0;
        const query = issue.original.toLowerCase();
        const textLower = text.toLowerCase();
        
        while (true) {
          const pos = textLower.indexOf(query, searchIndex);
          if (pos === -1) break;
          
          issuesList.push({
            start: pos,
            end: pos + issue.original.length,
            text: text.substring(pos, pos + issue.original.length),
            colorClass: "border-b-2 border-rose-400 bg-rose-100/90 hover:bg-rose-200/90 text-rose-950 font-medium px-0.5 rounded-xs transition-colors",
            label: `Grammar: ${issue.issueType}`,
            onClick: () => {
              setActiveHighlight(issue.original);
              setActiveTab("grammar");
              setTimeout(() => {
                const el = document.getElementById(`grammar-issue-${idx}`);
                el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }, 100);
            }
          });
          
          searchIndex = pos + issue.original.length;
          if (searchIndex >= text.length) break;
        }
      });
    }

    // Let's also add readability style suggestions
    if (analysisResult && analysisResult.readabilitySuggestions) {
      analysisResult.readabilitySuggestions.forEach((suggestion, idx) => {
        if (!suggestion.original) return;
        let searchIndex = 0;
        const query = suggestion.original.toLowerCase();
        const textLower = text.toLowerCase();
        
        while (true) {
          const pos = textLower.indexOf(query, searchIndex);
          if (pos === -1) break;
          
          issuesList.push({
            start: pos,
            end: pos + suggestion.original.length,
            text: text.substring(pos, pos + suggestion.original.length),
            colorClass: "border-b-2 border-indigo-400 bg-indigo-100/90 hover:bg-indigo-200/90 text-indigo-950 font-medium px-0.5 rounded-xs transition-colors",
            label: "Style Suggestion",
            onClick: () => {
              setActiveHighlight(suggestion.original);
              setActiveTab("readability");
              setTimeout(() => {
                const el = document.getElementById(`style-issue-${idx}`);
                el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }, 100);
            }
          });
          
          searchIndex = pos + suggestion.original.length;
          if (searchIndex >= text.length) break;
        }
      });
    }

    // Now sort by start index and filter overlaps
    issuesList.sort((a, b) => a.start - b.start);
    const nonOverlapping: HighlightItem[] = [];
    let lastEnd = 0;
    
    issuesList.forEach((issue) => {
      if (issue.start >= lastEnd) {
        nonOverlapping.push(issue);
        lastEnd = issue.end;
      }
    });

    // If there are no highlights or we have an activeHighlight that isn't pre-computed
    if (nonOverlapping.length === 0) {
      if (activeHighlight) {
        const index = text.toLowerCase().indexOf(activeHighlight.toLowerCase());
        if (index !== -1) {
          const before = text.substring(0, index);
          const match = text.substring(index, index + activeHighlight.length);
          const after = text.substring(index + activeHighlight.length);
          return (
            <div className="whitespace-pre-wrap font-serif text-stone-850 leading-relaxed text-sm select-text">
              {before}
              <span className="bg-amber-100/95 border-b-2 border-amber-600 font-semibold text-stone-900 relative px-0.5 inline rounded-xs shadow-xs cursor-pointer">
                {match}
                <span className="absolute -top-5 left-0 bg-amber-600 text-white text-[8px] font-mono uppercase tracking-widest rounded px-1.5 py-0.5 select-none shadow-sm whitespace-nowrap z-10 font-bold">
                  Selected Focus
                </span>
              </span>
              {after}
            </div>
          );
        }
      }
      return (
        <div className="whitespace-pre-wrap font-serif text-stone-850 leading-relaxed text-sm select-text">
          {text}
        </div>
      );
    }

    // Build JSX elements
    const elements: React.ReactNode[] = [];
    let currentCursor = 0;

    nonOverlapping.forEach((issue, idx) => {
      // Append text before the issue
      if (issue.start > currentCursor) {
        elements.push(
          <span key={`text-${idx}`} className="text-stone-850">
            {text.substring(currentCursor, issue.start)}
          </span>
        );
      }

      // Append highlighted issue
      const isSelected = activeHighlight && issue.text.toLowerCase() === activeHighlight.toLowerCase();
      
      elements.push(
        <span
          key={`issue-${idx}`}
          onClick={issue.onClick}
          className={`${
            isSelected 
              ? "bg-amber-100 border-b-2 border-amber-600 text-stone-900 font-bold shadow-xs px-1" 
              : issue.colorClass
          } font-serif relative px-0.5 inline rounded-xs cursor-pointer select-text transition-all duration-150`}
          title={issue.label}
        >
          {issue.text}
          {isSelected && (
            <span className="absolute -top-5 left-0 bg-amber-600 text-white text-[8px] font-mono uppercase tracking-widest rounded px-1.5 py-0.5 select-none shadow-sm whitespace-nowrap z-10 font-bold">
              Active Selection
            </span>
          )}
        </span>
      );

      currentCursor = issue.end;
    });

    // Append remaining text
    if (currentCursor < text.length) {
      elements.push(
        <span key={`text-end`} className="text-stone-850">
          {text.substring(currentCursor)}
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap font-serif leading-relaxed text-sm select-text">
        {elements}
      </div>
    );
  };

  const focusHighlight = (textStr: string) => {
    setActiveHighlight(textStr);
    paperScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3]/80 text-stone-800 font-sans flex flex-col antialiased selection:bg-amber-100">
      {/* High Density Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/85 border-b border-stone-200/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-serif font-black text-lg shadow-sm">L</div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-stone-900 uppercase">
              LUMINA <span className="text-stone-400 font-normal tracking-[0.05em] lowercase ml-1.5 font-serif italic text-xs">draft intelligence system</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {isAnalyzing ? (
              <div className="px-2.5 py-1 rounded-full bg-amber-50/70 border border-amber-200/60 flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider font-mono">
                  Engine Parsing
                </span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  System Online
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setApiKeyInput(sessionApiKey);
              setIsApiKeyModalOpen(true);
            }}
            className={`cursor-pointer px-3 py-1.5 border rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-[0_1.5px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 inline-flex items-center gap-1.5 ${
              sessionApiKey 
                ? "bg-amber-50 text-amber-850 border-amber-200/60 hover:bg-amber-100" 
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Key className="h-3.5 w-3.5 text-stone-550" />
            <span>API Config</span>
            {sessionApiKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Custom API key active" />
            )}
          </button>

          {analysisResult && (
            <button 
              onClick={() => setIsExportDialogOpen(true)}
              className="cursor-pointer px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-[0_1.5px_4px_rgba(0,0,0,0.02)] transition-all active:scale-95 inline-flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-stone-450" />
              Export Report
            </button>
          )}

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !manuscriptText.trim()}
            className={`cursor-pointer px-3.5 py-1.5 bg-stone-900 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-sm transition-all hover:bg-stone-800 active:scale-95 inline-flex items-center gap-1.5 ${
              isAnalyzing ? "opacity-50 cursor-wait bg-stone-400 text-stone-100" : ""
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-stone-200" />
                Working...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                Analyze Book
              </>
            )}
          </button>
        </div>
      </header>

      {/* Workspace Dashboard */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 max-w-7xl mx-auto w-full">
        
        {/* Left Control Panel / Workspace File Display (5 Columns) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Controls Sheet */}
          <div className="bg-white rounded-xl border border-stone-200/60 p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <PenTool className="w-3.5 h-3.5 text-stone-400" /> SOURCE INPUT CONTROL
              </h2>
              <button
                onClick={() => setIsQuotaModalOpen(true)}
                className="cursor-pointer text-[8px] bg-red-50/70 hover:bg-red-100/60 border border-red-200/50 text-red-750 py-0.5 px-2 rounded-lg font-mono font-bold uppercase tracking-wider transition-colors shadow-xs"
                title="Trigger simulated quota limit warning dialog popup"
              >
                ⚠ Test Quota Alert
              </button>
            </div>            {/* Quick Sample Selector */}
            <div className="space-y-1.5">
              <label className="block text-[8px] font-bold text-stone-450 uppercase tracking-widest font-mono">
                Select Manuscript Chapter Template
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {SAMPLE_MANUSCRIPTS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadSample(sample.id)}
                    className={`cursor-pointer p-2 rounded-lg text-left border transition-all ${
                      selectedSampleId === sample.id
                        ? "bg-stone-100 border-stone-300 border-l-2 border-l-stone-850 text-stone-900 font-bold"
                        : "bg-stone-50/50 border-stone-200/60 text-stone-550 hover:bg-stone-100 hover:text-stone-800"
                    }`}
                  >
                    <div className="truncate text-[10px] font-bold leading-tight">{sample.title}</div>
                    <div className="truncate text-[8px] text-stone-500 uppercase tracking-wider font-mono mt-0.5">{sample.genre}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border border-dashed rounded-lg p-3.5 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                isDragging 
                  ? "border-stone-800 bg-stone-50 scale-[0.99]" 
                  : "border-stone-200/85 hover:border-stone-350 hover:bg-stone-50/50 bg-[#faf9f6]/40"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.md,.pdf"
                className="hidden"
              />
              <div className="bg-white p-1 rounded-md border border-stone-250 text-stone-400 shadow-xs">
                <Upload className="w-3.5 h-3.5 text-stone-500" />
              </div>
              <div>
                <p className="font-sans text-[10px] text-stone-750 font-semibold leading-tight">
                  {fileName ? `File queued: ${fileName}` : "Drag and drop book file here"}
                </p>
                <p className="font-sans text-[8px] text-stone-450 mt-0.5">
                  Accepting plain markdown (.md), text (.txt), or PDF files
                </p>
              </div>
            </div>

            {/* Editing field if not PDF */}
            {fileType !== "pdf" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[8px] font-bold text-stone-450 uppercase tracking-widest font-mono">
                    MANUSCRIPT CORE TEXT
                  </label>
                  <span className="text-[8px] bg-stone-50 font-mono text-stone-500 p-1 px-1.5 rounded border border-stone-200/80">
                    {manuscriptText.trim().split(/\s+/).filter(Boolean).length} WORDS
                  </span>
                </div>
                <textarea
                  value={manuscriptText}
                  onChange={(e) => {
                    setManuscriptText(e.target.value);
                    setSelectedSampleId("custom");
                  }}
                  placeholder="Paste or write your manuscript here..."
                  className="w-full h-36 p-3 font-mono text-[10px] bg-stone-50/60 border border-stone-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-350 focus:bg-white transition-all resize-none text-stone-800 leading-relaxed"
                />
              </div>
            )}
          </div>          {/* Living Manuscript View Panel */}
          <div className="bg-white rounded-xl border border-stone-200/60 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="bg-stone-50/60 border-b border-stone-250 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-mono text-stone-500 uppercase flex items-center gap-1.5 font-bold tracking-wider">
                <FileText className="w-3.5 h-3.5 text-stone-400" /> 
                {fileName ? `SOURCE: ${fileName}` : `SOURCE: ${SAMPLE_MANUSCRIPTS.find(s => s.id === selectedSampleId)?.title || "Manual Input"}`}
              </span>
              
              <div className="flex items-center gap-2">
                {fileType !== "pdf" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingInViewer(!isEditingInViewer);
                      if (!isEditingInViewer) setActiveHighlight(null);
                    }}
                    className={`cursor-pointer px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border font-mono transition-all active:scale-95 flex items-center gap-1 ${
                      isEditingInViewer 
                        ? "bg-stone-900 border-stone-900 text-white animate-pulse" 
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {isEditingInViewer ? (
                      <>
                        <Eye className="w-3 h-3 text-stone-200" />
                        <span>Interactive View</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3 h-3 text-stone-500" />
                        <span>Edit Manuscript</span>
                      </>
                    )}
                  </button>
                )}
                
                <div className="flex gap-1.5 font-mono text-[8px] font-bold">
                  {analysisResult ? (
                    <>
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-150">
                        {analysisResult.grammarIssues?.length || 0} GRAMMAR
                      </span>
                      <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-150">
                        {((analysisResult.logicAndFlow?.length || 0) + (analysisResult.consistencyIssues?.length || 0))} LOGIC
                      </span>
                    </>
                  ) : (
                    <span className="bg-stone-100 text-stone-450 border border-stone-200 px-2 py-0.5 rounded-md tracking-wider uppercase">
                      PENDING REVIEW
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="relative flex-1 min-h-0 flex flex-col">
              {/* Floating Copy Button */}
              {manuscriptText.trim() && !isEditingInViewer && (
                <div className="absolute top-6 right-6 z-10">
                  <button
                    type="button"
                    id="copy-manuscript-btn"
                    onClick={handleCopyManuscript}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm active:scale-95 flex items-center gap-1.5 transition-all duration-150 border ${
                      manuscriptCopied
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-none"
                        : "bg-white/90 backdrop-blur-xs text-stone-700 border-stone-200/80 hover:bg-white hover:text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    }`}
                    title="Copy core manuscript text to clipboard"
                  >
                    {manuscriptCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {isEditingInViewer ? (
                <div className="p-4 flex flex-col flex-1 bg-[#fbfbfa]/60">
                  <div className="mb-2 flex items-center justify-between text-[9px] font-mono text-stone-400 font-bold uppercase tracking-wider">
                    <span>Manuscript Live-Editor Mode</span>
                    <span>{manuscriptText.length} characters</span>
                  </div>
                  <textarea
                    value={manuscriptText}
                    onChange={(e) => {
                      setManuscriptText(e.target.value);
                      setSelectedSampleId("custom");
                    }}
                    placeholder="Enter or modify your manuscript text here..."
                    className="w-full flex-1 min-h-[250px] p-5 font-serif text-sm leading-relaxed text-stone-850 bg-[#fbfbfa] border border-stone-200 shadow-inner rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-350 resize-none font-medium text-left"
                  />
                </div>
              ) : (
                <div className="p-4 overflow-y-auto max-h-[380px] lg:max-h-[440px] bg-[#fbfbfa]/60 flex-1 text-left" ref={paperScrollRef}>
                  <div className="paper-texture p-5 lg:p-6 rounded-lg border border-stone-200 shadow-xs min-h-[250px]">
                    {renderInteractiveManuscript()}
                  </div>
                </div>
              )}
            </div>

            {activeHighlight && (() => {
              const activeGrammarIssue = analysisResult?.grammarIssues?.find(
                (issue) => issue.original.toLowerCase() === activeHighlight.toLowerCase()
              );
              const activeReadabilitySuggestion = analysisResult?.readabilitySuggestions?.find(
                (suggestion) => suggestion.original.toLowerCase() === activeHighlight.toLowerCase()
              );

              return (
                <div className="bg-amber-50/80 border-t border-amber-150 p-2.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-sans text-amber-850 flex items-center font-bold uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Current Selection: "{activeHighlight}"
                    </span>
                    {activeGrammarIssue && (
                      <span className="text-[10px] text-stone-600 font-sans">
                        Patch suggestion: Replace with <strong className="text-emerald-700 font-serif">"{activeGrammarIssue.correction}"</strong> ({activeGrammarIssue.issueType})
                      </span>
                    )}
                    {activeReadabilitySuggestion && (
                      <span className="text-[10px] text-stone-600 font-sans">
                        Patch suggestion: Replace with <strong className="text-indigo-700 font-serif">"{activeReadabilitySuggestion.suggestion}"</strong> (Alternative)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(activeGrammarIssue || activeReadabilitySuggestion) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeGrammarIssue) {
                            applyGrammarFix(activeGrammarIssue.original, activeGrammarIssue.correction);
                          } else if (activeReadabilitySuggestion) {
                            applyReadabilityFix(activeReadabilitySuggestion.original, activeReadabilitySuggestion.suggestion);
                          }
                          setActiveHighlight(null);
                        }}
                        className="cursor-pointer text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg font-mono transition-all uppercase tracking-wider shadow-xs active:scale-95 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Fix Instantly
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveHighlight(null)}
                      className="cursor-pointer text-[9px] bg-white border border-amber-200 hover:bg-amber-100/50 text-amber-900 px-2.5 py-1.5 rounded-lg font-mono font-bold transition-colors uppercase tracking-wider"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Right Side: Analytical Engine (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-stone-200/60 p-8 text-center shadow-xs flex flex-col items-center justify-center flex-1 my-auto"
                key="loading-panel"
              >
                <div className="relative mb-5">
                  <div className="w-12 h-12 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest animate-pulse">Evaluating Manuscript Structure</h3>
                <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  The editorial compiler is reading your manuscript chapters to formulate a comprehensive review matrix.
                </p>
                
                {/* Steps indicator */}
                <div className="mt-6 bg-stone-50 border border-stone-200/80 rounded-lg p-3.5 max-w-sm w-full text-left">
                  <span className="text-[8px] font-mono text-stone-400 font-bold uppercase tracking-wider block">
                    CURRENT REVIEW SEQUENCE:
                  </span>
                  <p className="font-mono text-[10px] text-amber-900 font-bold mt-1 tracking-tight">
                    {analysisStep}
                  </p>
                </div>
              </motion.div>
            )}

            {!isAnalyzing && errorMsg && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-red-200 p-8 shadow-xs text-center flex flex-col items-center justify-center flex-1 my-auto"
                key="error-panel"
              >
                <div className={`p-2.5 rounded-full mb-3.5 border ${
                  errorMsg?.includes("503") || errorMsg?.includes("demand") || errorMsg?.includes("UNAVAILABLE")
                    ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
                    : "bg-red-50 text-red-600 border-red-150"
                }`}>
                  {errorMsg?.includes("503") || errorMsg?.includes("demand") || errorMsg?.includes("UNAVAILABLE") ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">
                  {errorMsg?.includes("503") || errorMsg?.includes("demand") || errorMsg?.includes("UNAVAILABLE")
                    ? "Linguistic Engine Fully Saturated"
                    : "Analysis Aborted"}
                </h3>
                
                <div className="text-xs text-stone-600 mt-3.5 max-w-sm mx-auto leading-relaxed">
                  {errorMsg?.includes("503") || errorMsg?.includes("demand") || errorMsg?.includes("UNAVAILABLE") ? (
                    <span className="block text-stone-700 bg-amber-50/60 p-4 rounded-lg border border-amber-200/60 text-left">
                      <strong className="block text-[10px] text-amber-850 uppercase tracking-wider mb-1 font-mono">Service Peak Spike</strong>
                      The analysis queue is currently experiencing unusually high momentary load. We performed automatic backoff retries, but wait times exceeded thresholds. Please try clicking <strong>Re-run engine review</strong> in a few moments.
                    </span>
                  ) : (
                    <p className="p-4 bg-red-50/50 text-red-800 rounded-lg border border-red-150 text-left font-mono text-[10px] overflow-auto max-h-40">
                      {errorMsg}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleAnalyze}
                  className="cursor-pointer mt-6 bg-stone-900 hover:bg-stone-850 text-white text-[10px] uppercase font-bold px-4 py-2.5 rounded-lg transition-all tracking-wider shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {errorMsg?.includes("503") || errorMsg?.includes("demand") || errorMsg?.includes("UNAVAILABLE")
                    ? "RE-RUN ENGINE REVIEW"
                    : "RESET WORKSPACE RUN"}
                </button>
              </motion.div>
            )}

            {!isAnalyzing && !analysisResult && !errorMsg && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-stone-200/60 p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.015)] flex flex-col items-center justify-center flex-1 my-auto"
                key="welcome-panel"
              >
                <div className="bg-amber-50/80 text-amber-600 p-3.5 rounded-full mb-4 border border-amber-100 shadow-xs">
                  <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-stone-850 uppercase tracking-widest font-serif">Manuscript Intelligence Center</h3>
                <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Start your review sequence by clicking the <strong>Analyze Book</strong> action at the top right. You can review built-in science fiction, historical, or non-fiction drafts, or drop your own file.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 w-full max-w-lg">
                  <div className="bg-stone-50/40 p-3.5 rounded-lg border border-stone-200/50 text-left transition-colors hover:border-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-2" />
                    <h5 className="font-serif font-bold text-[10.5px] text-stone-800 uppercase tracking-wide">Mechanical Splicing</h5>
                    <p className="text-[9px] text-stone-450 mt-1 leading-relaxed">Grammar corrections, tense shifts, and sentence mechanics review.</p>
                  </div>
                  <div className="bg-stone-50/40 p-3.5 rounded-lg border border-stone-200/50 text-left transition-colors hover:border-stone-300">
                    <TrendingUp className="w-4 h-4 text-indigo-600 mb-2" />
                    <h5 className="font-serif font-bold text-[10.5px] text-stone-800 uppercase tracking-wide">Flow Continuities</h5>
                    <p className="text-[9px] text-stone-450 mt-1 leading-relaxed">Pacing balances, narrative metrics, and vocabulary enhancements.</p>
                  </div>
                  <div className="bg-stone-50/40 p-3.5 rounded-lg border border-stone-200/50 text-left transition-colors hover:border-stone-300">
                    <Layers className="w-4 h-4 text-[#f59e0b] mb-2" />
                    <h5 className="font-serif font-bold text-[10.5px] text-stone-800 uppercase tracking-wide">Coherence Reports</h5>
                    <p className="text-[9px] text-stone-450 mt-1 leading-relaxed">Timeline sync checks, character names list, and story consistency.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {!isAnalyzing && analysisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 flex-col flex-1 flex"
                key="analysis-panel"
              >
                {analysisResult.isFallback && (
                  <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                    <div className="p-1 px-1.5 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide font-mono flex items-center gap-2">
                        Local Analytical Backup Active
                      </h4>
                      <p className="text-[10px] text-amber-800 leading-relaxed font-sans">
                        The primary cloud node is currently experiencing heavy model demand (503 Service Saturated). 
                        To keep your momentum going, Lumina's offline heuristic engine has safely processed your manuscript block.
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-white border border-stone-200/60 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-stone-850 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-stone-800 rounded-sm"></span>
                      AI INTELLIGENCE LEDGER REPORT
                    </h2>
                    
                    <button 
                      onClick={() => setIsExportDialogOpen(true)}
                      className="cursor-pointer text-[9px] bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-lg font-mono font-bold transition-all uppercase tracking-wider inline-flex items-center gap-1 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-stone-500 font-bold" /> Export Report
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-stone-200/60 rounded-lg bg-[#faf9f6]/40">
                      <span className="block text-[8px] text-stone-400 uppercase tracking-widest font-mono font-bold mb-1">Grade Complexity</span>
                      <span className="text-sm font-bold text-stone-800 block truncate">{analysisResult.readabilityGrade}</span>
                      <span className="text-[9.5px] text-emerald-700 block font-semibold mt-0.5">✔ Optimized Range</span>
                    </div>
                    <div className="p-4 border border-stone-200/60 rounded-lg bg-[#faf9f6]/40">
                      <span className="block text-[8px] text-stone-400 uppercase tracking-widest font-mono font-bold mb-1">Maturity Coherence Index</span>
                      <span className="text-sm font-bold text-stone-800 block">{analysisResult.overallScore}% Grade Score</span>
                      <span className="text-[9px] text-amber-700 block font-semibold truncate mt-0.5 uppercase tracking-wide font-mono" title={analysisResult.tone}>
                        {analysisResult.tone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dense Tab Controllers */}
                <div className="bg-white border border-stone-200/60 rounded-xl shadow-xs flex flex-col flex-1 overflow-hidden">
                  <div className="flex border-b border-stone-200 bg-stone-50/60 select-none">
                    <button
                      onClick={() => setActiveTab("metrics")}
                      className={`cursor-pointer flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === "metrics"
                          ? "bg-white border-b-2 border-stone-800 text-stone-900"
                          : "text-stone-400 hover:text-stone-700 hover:bg-stone-50/30"
                      }`}
                    >
                      Summary
                    </button>
                    <button
                      onClick={() => setActiveTab("grammar")}
                      className={`cursor-pointer flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === "grammar"
                          ? "bg-white border-b-2 border-stone-800 text-stone-900"
                          : "text-stone-400 hover:text-stone-704 hover:bg-stone-50/30"
                      }`}
                    >
                      Grammar ({analysisResult.grammarIssues?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("readability")}
                      className={`cursor-pointer flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === "readability"
                          ? "bg-white border-b-2 border-stone-800 text-stone-900"
                          : "text-stone-400 hover:text-stone-704 hover:bg-stone-50/30"
                      }`}
                    >
                      Styles ({analysisResult.readabilitySuggestions?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("flow")}
                      className={`cursor-pointer flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === "flow"
                          ? "bg-white border-b-2 border-stone-800 text-stone-900"
                          : "text-stone-400 hover:text-stone-704 hover:bg-stone-50/30"
                      }`}
                    >
                      Continuity ({ (analysisResult.logicAndFlow?.length || 0) + (analysisResult.consistencyIssues?.length || 0) })
                    </button>
                    <button
                      onClick={() => setActiveTab("structure")}
                      className={`cursor-pointer flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === "structure"
                          ? "bg-white border-b-2 border-stone-800 text-stone-900"
                          : "text-stone-404 hover:text-stone-704 hover:bg-stone-50/30"
                      }`}
                    >
                      Coherence
                    </button>
                  </div>

                  {/* Dense Tab Scroll Content */}
                  <div className="p-4 overflow-y-auto max-h-[500px] lg:max-h-[580px] flex-1">
                    
                    {/* Tab 1: Overview Summary */}
                    {activeTab === "metrics" && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Executive Synthesis</h4>
                          <p className="font-serif text-stone-850 text-[12.5px] leading-relaxed bg-[#fbfbfa]/75 p-4 rounded-lg border border-stone-200/80 whitespace-pre-wrap shadow-xs">
                            {analysisResult.summary}
                          </p>
                        </div>

                        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-stone-800">
                          <p className="text-[9px] italic opacity-80 underline decoration-indigo-400 underline-offset-2 font-mono uppercase mb-1">System Intelligence Summary:</p>
                          <p className="text-[11px] leading-relaxed font-sans">
                            Atmospheric narrative building has scored overall structural maturity of {analysisResult.overallScore} out of 100. Correcting identified narrative discrepancies and terminology drifts listed in the tabs above will polish Act 1 thoroughly.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Grammar Issues */}
                    {activeTab === "grammar" && (
                      <div className="space-y-3">
                        {(!analysisResult.grammarIssues || analysisResult.grammarIssues.length === 0) ? (
                          <div className="text-center py-8 text-stone-400 font-mono text-xs italic">
                            No typographical grammar breaches detected!
                          </div>
                        ) : (
                          <div className="space-y-2">
                             {analysisResult.grammarIssues.map((issue, idx) => (
                              <div 
                                key={idx}
                                onClick={() => focusHighlight(issue.original)}
                                className="group cursor-pointer p-4 rounded-xl border border-stone-200/80 bg-white hover:border-stone-300 hover:bg-[#faf9f6]/30 transition-all text-left flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-center text-[9px] font-mono border-b border-stone-100 pb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    <span className="font-bold text-red-700 uppercase">{issue.issueType}</span>
                                    <span className="text-stone-400">({issue.location})</span>
                                  </div>
                                  <span className="bg-stone-50 border border-stone-200 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-stone-500">
                                    {issue.severity}
                                  </span>
                                </div>

                                <div className="text-[11px] space-y-1.5">
                                  <div className="p-2.5 bg-red-50/50 border border-red-100 rounded-lg text-red-905 leading-relaxed font-serif">
                                    <span className="font-sans font-bold text-[8px] text-red-650 uppercase block">Weak phrasing</span>
                                    "{issue.original}"
                                  </div>
                                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-emerald-950 leading-relaxed font-serif mt-1">
                                    <span className="font-sans font-bold text-[8px] text-emerald-700 block uppercase">Suggested correction</span>
                                    "{issue.correction}"
                                  </div>
                                </div>

                                <div className="text-[10px] text-stone-500 font-sans leading-relaxed">
                                  {issue.explanation}
                                </div>

                                {fileType !== "pdf" && (
                                  <div className="mt-2.5 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        applyGrammarFix(issue.original, issue.correction);
                                      }}
                                      className="cursor-pointer text-[9px] font-bold uppercase tracking-wider font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      Apply Correction
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Style Readability */}
                    {activeTab === "readability" && (
                      <div className="space-y-3">
                        {(!analysisResult.readabilitySuggestions || analysisResult.readabilitySuggestions.length === 0) ? (
                          <div className="text-center py-8 text-stone-400 font-mono text-xs italic">
                            Semantic style registers are optimal.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {analysisResult.readabilitySuggestions.map((suggestion, idx) => (
                              <div 
                                key={idx}
                                onClick={() => focusHighlight(suggestion.original)}
                                className="group cursor-pointer p-4 rounded-xl border border-stone-200/80 bg-white hover:border-stone-300 hover:bg-[#faf9f6]/30 transition-all text-left flex flex-col gap-2"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-serif">
                                    <span className="text-[8px] font-sans font-bold text-stone-400 uppercase block">Found</span>
                                    "{suggestion.original}"
                                  </div>
                                  <div className="p-2.5 bg-stone-100/70 border border-stone-200 rounded-lg text-stone-900 font-serif font-semibold">
                                    <span className="text-[8px] font-sans font-bold text-stone-500 block uppercase">Alternative</span>
                                    "{suggestion.suggestion}"
                                  </div>
                                </div>

                                <div className="text-[10.5px] text-stone-505 leading-relaxed font-sans mt-0.5">
                                  <strong className="text-stone-700">Stylistic Rationale:</strong> {suggestion.reason}
                                </div>

                                {fileType !== "pdf" && (
                                  <div className="mt-2.5 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        applyReadabilityFix(suggestion.original, suggestion.suggestion);
                                      }}
                                      className="cursor-pointer text-[9px] font-bold uppercase tracking-wider font-mono text-stone-705 bg-stone-50 hover:bg-stone-100 border border-stone-205 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                                    >
                                      <Check className="w-3.5 h-3.5 text-stone-500" />
                                      Apply Alternative
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                                        {/* Tab 4: Continuity Gaps */}
                    {activeTab === "flow" && (
                      <div className="space-y-4">
                        {/* Transitions */}
                        <div className="space-y-2">
                          <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Pacing & Transitions</h4>
                          {(!analysisResult.logicAndFlow || analysisResult.logicAndFlow.length === 0) ? (
                            <p className="text-[10px] text-stone-400 italic">No transition flaws found.</p>
                          ) : (
                            <div className="space-y-2">
                              {analysisResult.logicAndFlow.map((flow, idx) => (
                                <div key={idx} className="p-4 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-left">
                                  <div className="font-mono text-[8px] font-bold text-amber-800 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-md inline-block uppercase mb-2">
                                    {flow.type}
                                  </div>
                                  <p className="font-serif text-stone-850 leading-relaxed mb-2">
                                    {flow.description}
                                  </p>
                                  <div className="bg-white border border-stone-200 p-3 rounded-lg text-[10.5px] text-stone-750">
                                    <strong className="text-stone-900 block text-[8px] font-sans uppercase mb-1">Editorial prescription</strong>
                                    {flow.suggestion}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Consistency */}
                        <div className="space-y-2 pt-3 border-t border-stone-200">
                          <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Detailing & backstories</h4>
                          {(!analysisResult.consistencyIssues || analysisResult.consistencyIssues.length === 0) ? (
                            <p className="text-[10px] text-stone-400 italic">No historical contradictions detected.</p>
                          ) : (
                            <div className="space-y-2">
                              {analysisResult.consistencyIssues.map((issue, idx) => (
                                <div key={idx} className="p-4 bg-stone-50/60 border border-stone-200 rounded-xl text-xs text-left">
                                  <div className="font-mono text-[8px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md inline-block uppercase mb-2">
                                    {issue.category} Consistency
                                  </div>
                                  <p className="font-serif text-stone-850 leading-relaxed mb-2">
                                    {issue.description}
                                  </p>
                                  <div className="bg-white border border-stone-200 p-3 rounded-lg text-[10.5px] text-stone-750">
                                    <strong className="text-indigo-600 block text-[8px] font-sans uppercase mb-1">Timeline correction Plan</strong>
                                    {issue.suggestion}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                                        {/* Tab 5: Coherence Structural Section */}
                    {activeTab === "structure" && (
                      <div className="space-y-3">
                        {(!analysisResult.structuralCoherence || analysisResult.structuralCoherence.length === 0) ? (
                          <div className="text-center py-8 text-stone-400 font-mono text-xs italic">
                            Structural balances are perfectly level.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {analysisResult.structuralCoherence.map((struct, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 flex flex-col gap-2.5 text-left shadow-xs">
                                <div className="border-b border-stone-200/80 pb-2 select-none flex items-center gap-1.5 text-[10.5px] font-bold text-stone-850 uppercase font-serif tracking-wide">
                                  <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                                  {struct.section}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                                  <div className="p-3 bg-emerald-50/65 border border-emerald-150 rounded-lg text-stone-800 leading-relaxed">
                                    <span className="text-[8px] font-sans font-black text-emerald-700 uppercase block mb-1">Strength highlights</span>
                                    {struct.strengths}
                                  </div>
                                  <div className="p-3 bg-red-50/65 border border-red-150 rounded-lg text-red-950 leading-relaxed font-sans">
                                    <span className="text-[8px] font-sans font-black text-red-700 block uppercase mb-1">Pacing breaches</span>
                                    {struct.weaknesses}
                                  </div>
                                </div>

                                <div className="p-3 bg-white text-stone-750 rounded-lg border border-stone-200 text-[10.5px] leading-relaxed">
                                  <span className="text-[8px] tracking-wider font-bold text-stone-800 block uppercase mb-1 font-mono">Restructuring blueprint:</span>
                                  {struct.improvement}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Quota Exceeded Warning Popup overlay */}
      <AnimatePresence>
        {isQuotaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-stone-850 tracking-wider uppercase font-mono">
                      QUOTA LIMIT REACHED
                    </h2>
                    <p className="text-[9px] text-amber-700 font-mono uppercase tracking-wider">
                      Gemini API Rate Guard Active
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-700 rounded transition-colors text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Main Information body */}
              <div className="p-5 space-y-4 text-left">
                <div className="space-y-1.5 text-left">
                  <p className="text-xs font-bold text-stone-800 leading-normal">
                    This workspace requires heavy linguistic token compilation, and your API Key safe-quota has temporarily saturated.
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Standard Google and Gemini free endpoints automatically restrict input sequences to protect the environment. Please review these remediation guidelines.
                  </p>
                </div>

                {/* Guidelines list */}
                <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-2.5 text-left">
                  <span className="block text-[8px] font-mono font-bold text-stone-450 uppercase tracking-widest">
                    REMEDIATION GUIDELINES:
                  </span>
                  
                  <div className="space-y-2 text-[10px] leading-relaxed font-sans">
                    <div className="flex gap-2">
                      <span className="text-amber-650 font-bold font-mono">①</span>
                      <p className="text-stone-600 font-sans leading-relaxed">
                        <strong className="text-stone-800 font-semibold">Trigger standard Cool-down check:</strong> Free standard packages renew their token slots automatically every 60 seconds.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-650 font-bold font-mono">②</span>
                      <p className="text-stone-600 font-sans leading-relaxed">
                        <strong className="text-stone-800 font-semibold">Reduce prompt density weight:</strong> Cut down the input text array slightly to process elements incrementally instead.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-650 font-bold font-mono">③</span>
                      <p className="text-stone-600 font-sans leading-relaxed text-[10px]">
                        <strong className="text-stone-800 font-semibold font-sans">Drop simple drafts:</strong> Complex layout elements packed inside uploaded PDFs take more processing effort. Standard plaintext or markdown formats compile much faster.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action array */}
              <div className="bg-stone-50/80 border-t border-stone-200 p-4 px-5 flex justify-end gap-2 text-right">
                <button
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="cursor-pointer px-4 py-2 text-[10px] font-bold text-stone-600 bg-white border border-stone-200 rounded-lg font-mono uppercase tracking-wider transition-colors inline-block hover:text-stone-800"
                >
                  Close Warning
                </button>
                <button
                  onClick={() => {
                    setIsQuotaModalOpen(false);
                    handleAnalyze();
                  }}
                  className="cursor-pointer px-4 py-2 text-[10px] bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-lg uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Try Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE INTELLIGENCE EXPORT OVERLAY DIALOG */}
      <AnimatePresence>
        {isExportDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-stone-850 tracking-wider uppercase font-mono">
                      Export Editorial Report
                    </h2>
                    <p className="text-[9px] text-stone-450 font-mono uppercase tracking-wider">
                      Save & Distribute Ledger Data
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExportDialogOpen(false)}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-700 rounded transition-colors text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-left">
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-stone-800 leading-normal font-sans">
                    Select your preferred packaging protocol below:
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-normal font-sans">
                    Choose between a fully readable style document containing structural chapters or raw computer-readable JSON matrices.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Markdown Report */}
                  <button
                    onClick={handleExportDownloadMarkdown}
                    className="w-full cursor-pointer p-3.5 rounded-xl border border-stone-200 hover:border-stone-350 bg-stone-50/50 hover:bg-stone-50 text-left transition-all flex items-center justify-between animate-none"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-stone-855 text-xs">
                        Download Markdown Document (.md)
                      </h4>
                      <p className="text-[9.5px] text-stone-455 mt-1 leading-snug">
                        Ideal for Word, text editors, sharing with authors, or reading offline.
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-stone-500" />
                  </button>

                  {/* Option 2: RAW JSON Matrices */}
                  <button
                    onClick={handleExportDownloadJSON}
                    className="w-full cursor-pointer p-3.5 rounded-xl border border-stone-200 hover:border-stone-350 bg-stone-50/50 hover:bg-stone-50 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-stone-855 text-xs">
                        Download Raw Database Matrix (.json)
                      </h4>
                      <p className="text-[9.5px] text-stone-455 mt-1 leading-snug">
                        Strict Javascript computer-friendly JSON serialization schema.
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-stone-500" />
                  </button>

                  {/* Option 3: Copy Markdown to Clipboard */}
                  <button
                    onClick={handleCopyClipboard}
                    className="w-full cursor-pointer p-3.5 rounded-xl border border-[#e5e5e0] hover:border-stone-350 bg-stone-50/50 hover:bg-stone-50 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-stone-855 text-xs flex items-center gap-1.5">
                        Copy Comprehensive Report to Clipboard
                      </h4>
                      <p className="text-[9.5px] text-stone-455 mt-1 leading-snug">
                        Direct clipboard payload transfer protocols.
                      </p>
                    </div>
                    {copiedStatus ? (
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50/80 border-t border-stone-200 p-4 px-5 flex justify-end gap-2 text-right">
                <button
                  onClick={() => setIsExportDialogOpen(false)}
                  className="cursor-pointer px-4 py-2 text-[10.5px] bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 rounded-lg font-mono uppercase tracking-wider transition-all font-bold"
                >
                  Dismiss Selector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Configuration Overlay */}
      <AnimatePresence>
        {isApiKeyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-sm w-full overflow-hidden flex flex-col font-sans text-left"
            >
              {/* Header */}
              <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    <Settings className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-stone-850 tracking-wider uppercase font-mono">
                      API KEY CONFIG
                    </h2>
                    <p className="text-[9px] text-stone-450 font-mono uppercase tracking-wider">
                      Manage Gemini Credentials
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="cursor-pointer p-1 text-stone-400 hover:text-stone-700 rounded transition-colors text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-stone-800 leading-normal">
                    Optionally configure private Gemini Credentials
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    By default, Lumina uses its shared server-side key. Optionally specify a custom key to bypass shared quota limits or process large book chapters.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest font-mono">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 bg-stone-50/50"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <span className="block text-[8px] font-mono font-bold text-stone-450 uppercase tracking-widest">
                      SECURITY DETAILS:
                    </span>
                    <ul className="list-disc pl-4 text-[10px] space-y-1 text-stone-600 leading-relaxed font-normal font-sans">
                      <li>Saved exclusively in browser-sandboxed local storage.</li>
                      <li>Passed securely over custom HTTPS request headers.</li>
                      <li>Acquire developer API keys at official <a href="https://ai.google.dev/aistudio" target="_blank" rel="referrer noopener" className="text-amber-700 font-semibold underline hover:text-amber-800 transition-colors">Google AI Studio</a>.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50/80 border-t border-stone-200 p-4 px-5 flex justify-between gap-2">
                <div>
                  {sessionApiKey && (
                    <button
                      onClick={() => {
                        localStorage.removeItem("lumina_api_key");
                        setSessionApiKey("");
                        setApiKeyInput("");
                        setIsApiKeyModalOpen(false);
                      }}
                      className="cursor-pointer px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-white border border-rose-100 rounded-lg font-mono uppercase tracking-wider transition-colors"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsApiKeyModalOpen(false)}
                    className="cursor-pointer px-4 py-2 text-[10px] font-bold text-stone-600 bg-white border border-stone-200 rounded-lg font-mono uppercase tracking-wider transition-colors inline-block hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const trimmed = apiKeyInput.trim();
                      if (trimmed) {
                        localStorage.setItem("lumina_api_key", trimmed);
                        setSessionApiKey(trimmed);
                      } else {
                        localStorage.removeItem("lumina_api_key");
                        setSessionApiKey("");
                      }
                      setIsApiKeyModalOpen(false);
                    }}
                    className="cursor-pointer px-4 py-2 text-[10px] bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-lg uppercase tracking-wider font-mono transition-all shadow-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Density Footer Status Metrics */}
      <footer className="px-6 py-3.5 bg-stone-50/95 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-500 font-mono uppercase tracking-wider sticky bottom-0 backdrop-blur-md">
        <div>
          METRICS: {manuscriptText.trim().split(/\s+/).filter(Boolean).length} WORDS | {manuscriptText.length} CHARS | SCHEMAS: DENSE INTEL {fileType === "pdf" ? "[PDF STREAM]" : "[BUFFER]"}
        </div>
        <div className="flex gap-4 items-center select-none">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Grammar</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Logic</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Consistency</span>
        </div>
      </footer>
    </div>
  );
}
