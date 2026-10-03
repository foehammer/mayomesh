/*
 * Auto-sizes the MeshCore telemetry iframe on mayomesh.net.
 * The embedded widget (?embed=1) posts { meshbridgeHeight } to its parent; this resizes the matching iframe.
 * Load once from the site's index.html (Docsify does not run <script> tags inside markdown pages):
 *   a script tag with src="meshcore-autoheight.js" (next to meshtastic-widget.js)
 */
(function () {
  var ALLOWED_ORIGIN = "https://mesh-cloudflare-bridge.john-long2.workers.dev"; // change if you add a custom domain
  var MIN = 300, MAX = 6000;

  window.addEventListener("message", function (e) {
    if (e.origin !== ALLOWED_ORIGIN) return; // ignore anything not from the widget
    var h = e.data && e.data.meshbridgeHeight;
    if (typeof h !== "number" || !isFinite(h)) return;
    var frames = document.querySelectorAll("iframe[data-meshcore-autoheight]");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        frames[i].style.height = Math.max(MIN, Math.min(MAX, Math.ceil(h))) + "px";
      }
    }
  });
})();
