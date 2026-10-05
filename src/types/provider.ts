export type ProviderId =
  | "chatgpt"
  | "gemini"
  | "claude"
  | "copilot"
  | "perplexity"
  | "deepseek"
  | "grok"
  | "unknown";

export interface SubmitDecision {
  allow: boolean;
  actionTaken: "allow" | "redacted" | "anonymized" | "tokenized" | "blocked";
  sanitizedPrompt?: string;
}

export type SubmitInterceptorCallback = (
  rawPrompt: string,
  event: Event
) => Promise<SubmitDecision>;

export interface AIProviderAdapter {
  id: ProviderId;
  name: string;
  matchesCurrentPage(): boolean;
  findInputElements(): HTMLElement[];
  extractPrompt(element: HTMLElement): string;
  replacePrompt(element: HTMLElement, safePrompt: string): void;
  interceptSubmit(callback: SubmitInterceptorCallback): void;
}
