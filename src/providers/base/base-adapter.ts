import { AIProviderAdapter, ProviderId, SubmitInterceptorCallback } from "../../types/provider";
import { extractElementText, setElementText } from "../../utils/dom";

export abstract class BaseProviderAdapter implements AIProviderAdapter {
  abstract id: ProviderId;
  abstract name: string;
  abstract matchesCurrentPage(): boolean;
  abstract findInputElements(): HTMLElement[];

  public extractPrompt(element: HTMLElement): string {
    return extractElementText(element);
  }

  public replacePrompt(element: HTMLElement, safePrompt: string): void {
    setElementText(element, safePrompt);
  }

  public interceptSubmit(callback: SubmitInterceptorCallback): void {
    if ((window as any)._aiPrivacyFirewallAttached) return;
    (window as any)._aiPrivacyFirewallAttached = true;

    // 1. Document-Level Keydown Capture Interceptor (Enter Key)
    document.addEventListener(
      "keydown",
      async (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
          const target = e.target as HTMLElement;
          if (target && (target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
            await this.handleIntercept(target, e, callback);
          }
        }
      },
      true // Capture phase intercepts BEFORE site listeners!
    );

    // 2. Document-Level Click Capture Interceptor (Send Button)
    document.addEventListener(
      "click",
      async (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const btn = target.closest("button") || target.closest("[role='button']");
        if (btn) {
          const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
          const testId = (btn.getAttribute("data-testid") || "").toLowerCase();
          const isSendButton =
            testId.includes("send") ||
            testId.includes("submit") ||
            ariaLabel.includes("send") ||
            ariaLabel.includes("submit") ||
            btn.classList.contains("send-button") ||
            btn.getAttribute("type") === "submit";

          if (isSendButton) {
            const inputEl = this.findInputElements()[0] || (document.querySelector("#prompt-textarea") as HTMLElement) || target.closest("form")?.querySelector("div[contenteditable='true'], textarea") as HTMLElement;
            if (inputEl) {
              await this.handleIntercept(inputEl, e, callback);
            }
          }
        }
      },
      true // Capture phase
    );

    // 3. Document-Level Form Submit Capture Interceptor
    document.addEventListener(
      "submit",
      async (e: SubmitEvent) => {
        const inputEl = this.findInputElements()[0] || (e.target as HTMLElement)?.querySelector("div[contenteditable='true'], textarea") as HTMLElement;
        if (inputEl) {
          await this.handleIntercept(inputEl, e, callback);
        }
      },
      true // Capture phase
    );
  }

  private async handleIntercept(
    el: HTMLElement,
    e: Event,
    callback: SubmitInterceptorCallback
  ): Promise<void> {
    if ((el as any)._isFirewallBypassing) return;

    const rawPrompt = this.extractPrompt(el);
    if (rawPrompt && rawPrompt.trim().length > 0) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const decision = await callback(rawPrompt, e);
      if (decision.allow && decision.sanitizedPrompt) {
        this.replacePrompt(el, decision.sanitizedPrompt);
        (el as any)._isFirewallBypassing = true;
        setTimeout(() => {
          this.triggerNativeSubmit(el);
          setTimeout(() => {
            (el as any)._isFirewallBypassing = false;
          }, 500);
        }, 50);
      }
    }
  }

  protected triggerNativeSubmit(inputEl: HTMLElement): void {
    const submitBtn = this.findSubmitButton();
    if (submitBtn) {
      submitBtn.click();
    } else {
      inputEl.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        })
      );
    }
  }

  protected findSubmitButton(): HTMLElement | null {
    return null;
  }
}
