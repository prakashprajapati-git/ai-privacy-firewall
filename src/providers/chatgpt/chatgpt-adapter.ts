import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class ChatGPTAdapter extends BaseProviderAdapter {
  id: ProviderId = "chatgpt";
  name = "ChatGPT";

  matchesCurrentPage(): boolean {
    const host = window.location.hostname;
    return host.includes("chatgpt.com") || host.includes("chat.openai.com");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "#prompt-textarea",
      "div#prompt-textarea[contenteditable='true']",
      "div[contenteditable='true'][id='prompt-textarea']",
      "div[contenteditable='true']",
      "textarea[tabindex='0']",
      "textarea[data-id='root']",
      "textarea",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      "button[data-testid='send-button']",
      "button[aria-label*='Send']",
      "button[aria-label*='send']",
      "button[aria-label*='Submit']",
      "button.mb-1.me-1",
      "form button[type='submit']",
    ];
    return queryFirstVisible(selectors);
  }
}
