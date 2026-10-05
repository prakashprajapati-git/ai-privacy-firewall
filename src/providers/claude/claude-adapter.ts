import { BaseProviderAdapter } from "../base/base-adapter";
import { ProviderId } from "../../types/provider";
import { queryFirstVisible } from "../../utils/dom";

export class ClaudeAdapter extends BaseProviderAdapter {
  id: ProviderId = "claude";
  name = "Claude";

  matchesCurrentPage(): boolean {
    return window.location.hostname.includes("claude.ai");
  }

  findInputElements(): HTMLElement[] {
    const selectors = [
      "fieldset div[contenteditable='true']",
      "div.ProseMirror[contenteditable='true']",
      "div[contenteditable='true']",
    ];
    const el = queryFirstVisible(selectors);
    return el ? [el] : [];
  }

  protected findSubmitButton(): HTMLElement | null {
    const selectors = [
      "button[aria-label*='Send']",
      "button[aria-label*='Submit']",
      "button:has(svg)",
    ];
    return queryFirstVisible(selectors);
  }
}
