import { AIProviderAdapter } from "../types/provider";
import { ChatGPTAdapter } from "./chatgpt/chatgpt-adapter";
import { GeminiAdapter } from "./gemini/gemini-adapter";
import { ClaudeAdapter } from "./claude/claude-adapter";
import { CopilotAdapter } from "./copilot/copilot-adapter";
import { PerplexityAdapter } from "./perplexity/perplexity-adapter";
import { DeepSeekAdapter } from "./deepseek/deepseek-adapter";
import { GrokAdapter } from "./grok/grok-adapter";

export class ProviderFactory {
  private adapters: AIProviderAdapter[] = [
    new ChatGPTAdapter(),
    new GeminiAdapter(),
    new ClaudeAdapter(),
    new CopilotAdapter(),
    new PerplexityAdapter(),
    new DeepSeekAdapter(),
    new GrokAdapter(),
  ];

  public getAdapterForCurrentPage(): AIProviderAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.matchesCurrentPage()) {
        return adapter;
      }
    }
    return null;
  }

  public getAllAdapters(): AIProviderAdapter[] {
    return this.adapters;
  }
}

export const providerFactory = new ProviderFactory();
