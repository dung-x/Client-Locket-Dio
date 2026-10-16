// Safari 12.5-safe clipboard helper.
// navigator.clipboard does NOT exist on iOS 12 — every direct call throws
// a TypeError and breaks the click handler. Use this everywhere instead.

export async function copyText(text) {
  if (text === null || text === undefined) return false;
  var value = String(text);

  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      // Clipboard API requires a secure context; wrap in try/catch anyway.
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (e) {
    // fall through to execCommand fallback
  }

  try {
    var textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    // Safari 12 supports execCommand("copy") on a focused textarea.
    var ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return !!ok;
  } catch (e) {
    return false;
  }
}
