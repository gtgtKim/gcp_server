//쿠키동의
(function (url, callback) {
  var script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
})("//cdn.cookie-script.com/s/a85c0b372031d72359d2525b66a62169.js", function () {
  console.log("Cookie Script loaded successfully!");
});

//GTM
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://tagmanager.gyutae.xyz/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-WBNJQ6F9");
