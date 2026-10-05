import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class DeepSeekAdapter extends BaseProviderAdapter {
  id: ProviderId = "deepseek";
  name = "DeepSeek";

  matchesCurrentPage(): boolean {
    return window.location.hostname.includes("deepseek.com");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "#chat-input",
      "textarea[placeholder*='Send']",
      "textarea",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      ".send-button",
      "button[aria-label*='Send']",
    ];
    return queryFirstVisible(selectors);
  }
}
