/* No analytics, remote dependencies, or automatic video downloads. */
"use strict";
const node = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text) n.textContent = text; return n; };
const burger = document.querySelector(".navbar-burger");
burger.addEventListener("click", () => { const open = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(open)); document.getElementById("site-navigation").classList.toggle("is-active", open); burger.classList.toggle("is-active", open); });
document.querySelectorAll(".navbar-menu a").forEach(a => a.addEventListener("click", () => { burger.setAttribute("aria-expanded", "false"); burger.classList.remove("is-active"); document.getElementById("site-navigation").classList.remove("is-active"); }));
const dialog = document.getElementById("figure-dialog");
dialog.querySelector("button").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
document.querySelectorAll(".gallery").forEach(container => {
  const dataset = container.dataset.dataset;
  const entries = (window.GAMVI_GALLERY || {})[dataset] || [];
  if (!entries.length) { container.append(node("p", "notice", "Gallery unavailable. Please reload after the gallery assets have been generated.")); return; }
  const controls = node("div", "gallery-controls"), selectLabel = node("label", "", "Sequence"), select = node("select");
  select.setAttribute("aria-label", `${dataset.toUpperCase()} sequence`);
  entries.forEach(entry => { const option = node("option", "", `${entry.id} · ${entry.title}`); option.value = entry.id; select.append(option); });
  selectLabel.append(select); controls.append(selectLabel);
  const view = node("select"); view.setAttribute("aria-label", "EMDB plot layout");
  [["panels", "Four panels"], ["overlay", "Overlay"]].forEach(([value, label]) => { const option = node("option", "", label); option.value = value; view.append(option); });
  if (dataset === "emdb") { const label = node("label", "", "Layout"); label.append(view); controls.append(label); }
  const heading = node("p", "gallery-heading"), button = node("button", "gallery-image-button"), img = node("img", "gallery-image");
  button.type = "button"; button.setAttribute("aria-label", "Open full-resolution trajectory figure"); img.loading = "lazy"; img.decoding = "async"; button.append(img);
  const links = node("div", "gallery-links"), metrics = node("div", "gallery-metrics"), caption = node("p", "gallery-caption"); caption.setAttribute("aria-live", "polite");
  container.append(controls, heading, button, links, caption, metrics);
  let entry, asset;
  function update() {
    entry = entries.find(e => e.id === select.value); asset = entry[view.value] || entry.panels;
    heading.textContent = `${entry.id} · ${entry.title}`;
    img.src = asset.preview; img.alt = `${heading.textContent}: ${dataset === "tumvi" ? "camera" : "pelvis"} trajectories against ground truth, ${view.value}`;
    caption.textContent = entry.caption;
    links.replaceChildren();
    [["pdf", "Vector PDF"], ["png", "Full-resolution PNG"]].forEach(([key, label]) => { const a = node("a", "", label); a.href = asset[key]; a.target = "_blank"; a.rel = "noopener"; links.append(a); });
    metrics.replaceChildren(node("strong", "", `${entry.metric_label} · ${entry.valid_frames} valid poses:`));
    Object.entries(entry.metrics).forEach(([name, value]) => metrics.append(node("span", "", `${name}: ${value.toFixed(3)}`)));
  }
  select.addEventListener("change", update); view.addEventListener("change", update);
  button.addEventListener("click", () => { const full = dialog.querySelector("img"); full.src = asset.webp; full.alt = img.alt; dialog.querySelector("p").textContent = `${heading.textContent}. ${entry.caption}`; dialog.showModal(); });
  update();
});
// Stop offscreen playback, but never start playback without user interaction.
const observer = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) e.target.pause(); }), {threshold: 0});
document.querySelectorAll("video").forEach(video => observer.observe(video));
document.addEventListener("visibilitychange", () => { if (document.hidden) document.querySelectorAll("video").forEach(v => v.pause()); });
