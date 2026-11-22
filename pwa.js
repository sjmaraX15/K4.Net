
(() => {
  const isAdmin = /\/admin(?:\/|$)/i.test(location.pathname);

  if ("serviceWorker" in navigator && !isAdmin) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .catch(error => console.warn("Service worker error:", error));
    });
  }
})();
