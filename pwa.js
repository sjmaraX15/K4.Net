(() => {
  const isAdmin = /\/admin(?:\/|$)/i.test(location.pathname);
  if ("serviceWorker" in navigator && !isAdmin) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .catch(error => console.warn("PWA service worker registration failed:", error));
    });
  }

  // Keep the existing desktop header navigation. Add a compact mobile app bar.
  if (isAdmin || document.querySelector("[data-pwa-bottom-nav]")) return;

  const links = [
    { label: "Home", href: "./index.html", icon: "⌂" },
    { label: "Stories", href: "./blog.html", icon: "▤" },
    { label: "Gallery", href: "./gallery.html", icon: "▧" },
    { label: "Explore", href: "./explore.html", icon: "◎" },
    { label: "Contact", href: "./contact.html", icon: "✉" }
  ];

  const current = location.pathname.split("/").pop() || "index.html";
  const nav = document.createElement("nav");
  nav.className = "pwa-bottom-nav";
  nav.dataset.pwaBottomNav = "true";
  nav.setAttribute("aria-label", "App navigation");

  links.forEach(item => {
    const a = document.createElement("a");
    a.href = item.href;
    a.className = current === item.href.replace("./", "") ? "is-active" : "";
    if (a.className) a.setAttribute("aria-current", "page");

    const icon = document.createElement("span");
    icon.className = "pwa-nav-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.textContent = item.label;
    a.append(icon, label);
    nav.append(a);
  });

  document.body.append(nav);
  document.body.classList.add("has-pwa-nav");
})();
