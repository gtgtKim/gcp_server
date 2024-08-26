// (function (w, d, s, l, i) {
//   w[l] = w[l] || [];
//   w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
//   var f = d.getElementsByTagName(s)[0],
//     j = d.createElement(s),
//     dl = l != "dataLayer" ? "&l=" + l : "";
//   j.async = true;
//   j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
//   f.parentNode.insertBefore(j, f);
// })(window, document, "script", "dataLayer", "GTM-WJDNXLDH");
// Debug mode state. True means we should debug the page.
var debug = true;
var hasAPIs = false; // No Chrome APIs available in vanilla JavaScript

// URLs to check for
var GA_HTTP = "http://www.google-analytics.com/ga.js";
var GA_HTTPS = "https://ssl.google-analytics.com/ga.js";
var DC_HTTP = "*://stats.g.doubleclick.net/dc.js";
var UA_HTTP = "*://www.google-analytics.com/analytics.js";
var GTAG_HTTP = "*://www.googletagmanager.com/gtag/js*";

var GA_HTTP_D = "http://www.google-analytics.com/u/ga_debug.js";
var GA_HTTPS_D = "https://ssl.google-analytics.com/u/ga_debug.js";
var DC_HTTP_D = "://stats.g.doubleclick.net/dc_debug.js";
var UA_HTTP_D = "://www.google-analytics.com/analytics_debug.js";

var COOKIE_HEADER = "Cookie";
var GTAG_DEBUG_COOKIE = "gtm_debug";
var GTAG_DEBUG_COOKIE_VALUE = "LOG=x";
(function () {
  var originalXHR = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (debug) {
      if (url === GA_HTTP) {
        url = GA_HTTP_D;
      } else if (url === GA_HTTPS) {
        url = GA_HTTPS_D;
      } else if (url.indexOf("dc.js") > 0) {
        url = url.replace(/(http[s]?):\/\//, "$1" + DC_HTTP_D);
      } else if (url.indexOf("analytics.js") > 0) {
        url = url.replace(/(http[s]?):\/\//, "$1" + UA_HTTP_D);
      } else if (url.indexOf("/gtag/js") > 0 && url.indexOf("dbg=") < 0) {
        var separator = url.indexOf("?") > 0 ? "&" : "?";
        url = url + separator + "dbg=" + generateCacheBuster();
      }
    }
    originalXHR.apply(this, arguments);
  };
})();

/**
 * Intercept fetch requests to add debugging cookies if needed.
 */
(function () {
  var originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (debug && typeof input === "string" && input.indexOf(GTAG_HTTP) > -1) {
      var headers = init && init.headers ? init.headers : new Headers();
      var cookieHeader = headers.get(COOKIE_HEADER);
      headers.set(COOKIE_HEADER, addOrReplaceCookie(cookieHeader || "", GTAG_DEBUG_COOKIE, GTAG_DEBUG_COOKIE_VALUE));

      init = init || {};
      init.headers = headers;
    }
    return originalFetch(input, init);
  };
})();

/**
 * Searches the given cookie string for a cookie named cookieName.
 * If found, replaces the cookie's value with cookieValue.
 * Otherwise, appends a new cookie with the name and value.
 *
 * @param {string} cookieString
 * @param {string} cookieName
 * @param {string} cookieValue
 * @return {string} The modified cookie string.
 */
function addOrReplaceCookie(cookieString, cookieName, cookieValue) {
  var cookieMatcher = new RegExp("^(.*;\\s*)?" + cookieName + "\\s*(=[^;]*)?(\\s*;.*)?$");
  var cookieStrParts = cookieMatcher.exec(cookieString);
  if (cookieStrParts === null) {
    return (cookieString ? cookieString + ";" : "") + cookieName + "=" + cookieValue;
  } else {
    return (cookieStrParts[1] ? cookieStrParts[1] : "") + cookieName + "=" + cookieValue + (cookieStrParts[3] ? cookieStrParts[3] : "");
  }
}

/**
 * Generates a randomized cache buster.
 *
 * @return {number} The random cache buster.
 */
function generateCacheBuster() {
  return Math.floor(Math.random() * 10000);
}
