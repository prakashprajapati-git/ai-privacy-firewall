import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class GrokAdapter extends BaseProviderAdapter {
  id: ProviderId = "grok";
  name = "Grok";

  matchesCurrentPage(): boolean {
    const host = window.location.hostname;
    return host.includes("grok.com") || host.includes("x.ai");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "textarea[placeholder*='Grok']",
      "textarea[placeholder*='Ask']",
      "textarea",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      "button[type='submit']",
      "button[aria-label*='Send']",
    ];
    return queryFirstVisible(selectors);
  }
}
