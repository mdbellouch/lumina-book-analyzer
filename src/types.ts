export interface GrammarIssue {
  original: string;
  correction: string;
  issueType: string; // Spelling, Grammar, Punctuation, Passive Voice, Style, etc.
  explanation: string;
  severity: "low" | "medium" | "high";
  location: string; // chapter, section, or rough position
}

export interface ReadabilitySuggestion {
  original: string;
  suggestion: string;
  reason: string;
}

export interface FlowIssue {
  type: string; // Transition Gap, Argument Flaw, Plot Hole, Narrative Pace, etc.
  description: string;
  suggestion: string;
}

export interface ConsistencyIssue {
  category: "Character" | "Timeline" | "Terminology" | "Tone" | "Other";
  description: string;
  suggestion: string;
}

export interface StructuralSection {
  section: string;
  strengths: string;
  weaknesses: string;
  improvement: string;
}

export interface BookAnalysisResult {
  overallScore: number; // 0 to 100
  wordCount: number;
  readabilityGrade: string; // e.g. "8th Grade" or "Graduate Level"
  tone: string; // e.g. "Formal", "Academic", "Suspenseful"
  summary: string; // General high level overview of the manuscript
  grammarIssues: GrammarIssue[];
  readabilitySuggestions: ReadabilitySuggestion[];
  logicAndFlow: FlowIssue[];
  consistencyIssues: ConsistencyIssue[];
  structuralCoherence: StructuralSection[];
  isFallback?: boolean;
}

export interface SampleManuscript {
  id: string;
  title: string;
  genre: string;
  author: string;
  content: string;
  type: "markdown" | "txt" | "pdf";
}
