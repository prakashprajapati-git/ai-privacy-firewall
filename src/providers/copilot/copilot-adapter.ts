import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class CopilotAdapter extends BaseProviderAdapter {
  id: ProviderId = "copilot";
  name = "Microsoft Copilot";

  matchesCurrentPage(): boolean {
    const host = window.location.hostname;
    return host.includes("copilot.microsoft.com") || host.includes("bing.com");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "textarea#searchbox",
      "textarea[aria-label*='Ask']",
      "textarea[placeholder*='Ask']",
      "div[contenteditable='true']",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      "button[aria-label*='Submit']",
      "button[aria-label*='Send']",
      "button.submit",
    ];
    return queryFirstVisible(selectors);
  }
}
