/** Open native date/time picker with cross-browser fallbacks. */
export function openPicker(input: HTMLInputElement | null) {
  if (!input) return;

  input.focus({ preventScroll: true });

  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
      return;
    } catch {
      // Firefox/Safari: may throw if not allowed; fall through to click()
    }
  }

  // Firefox time picker relies on the native indicator when showPicker is unavailable
  input.click();
}
