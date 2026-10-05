/**
 * DOM Utility functions for robust element querying, text extraction, and text updating
 * across standard textareas and contenteditable elements on modern SPA AI platforms.
 */

export function extractElementText(element: HTMLElement): string {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  if (element.isContentEditable) {
    return element.innerText || element.textContent || "";
  }
  return element.textContent || "";
}

export function setElementText(element: HTMLElement, newText: string): void {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = newText;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (element.isContentEditable) {
    element.innerText = newText;
    element.dispatchEvent(new InputEvent("input", { inputType: "insertText", data: newText, bubbles: true }));
  }
}

export function queryFirstVisible(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    try {
      const el = document.querySelector<HTMLElement>(selector);
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        return el;
      }
    } catch (e) {
      // Continue on selector syntax error or invalid DOM node
    }
  }
  return null;
}
