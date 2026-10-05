import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class PerplexityAdapter extends BaseProviderAdapter {
  id: ProviderId = "perplexity";
  name = "Perplexity";

  matchesCurrentPage(): boolean {
    return window.location.hostname.includes("perplexity.ai");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "textarea[placeholder*='Ask']",
      "textarea[placeholder*='Anything']",
      "textarea",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      "button[aria-label*='Submit']",
      "button[aria-label*='Send']",
      "button.bg-super",
    ];
    return queryFirstVisible(selectors);
  }
}
