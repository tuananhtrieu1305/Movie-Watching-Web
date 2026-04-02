let googleScriptPromise;

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src=\"${GOOGLE_SCRIPT_SRC}\"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Không tải được Google Identity Services")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Không tải được Google Identity Services"));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const getGoogleCredential = async (clientId) => {
  if (!clientId) {
    throw new Error("Thiếu VITE_GOOGLE_CLIENT_ID trong frontend/.env");
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    let settled = false;

    const timeout = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Google sign-in timeout, thử lại."));
      }
    }, 45000);

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);

        if (!response?.credential) {
          reject(new Error("Google không trả về credential."));
          return;
        }

        resolve(response.credential);
      },
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (settled) return;

      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        settled = true;
        window.clearTimeout(timeout);
        reject(new Error("Không thể mở Google prompt. Kiểm tra popup/blocker."));
      }
    });
  });
};
