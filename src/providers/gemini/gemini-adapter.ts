import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class GeminiAdapter extends BaseProviderAdapter {
  id: ProviderId = "gemini";
  name = "Google Gemini";

  matchesCurrentPage(): boolean {
    return window.location.hostname.includes("gemini.google.com");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "rich-textarea div[contenteditable='true']",
      "div.aria-textarea[contenteditable='true']",
      "textarea[aria-label*='Prompt']",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      "button.send-button-container",
      "button[aria-label*='Send']",
      "button.send-button",
    ];
    return queryFirstVisible(selectors);
  }
}
