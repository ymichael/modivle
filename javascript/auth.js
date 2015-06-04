var storage = require("./storage.js");
var utils = require('./utils.js');

// http://stackoverflow.com/a/901144/1070617
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

(function() {
  storage.check();

  // Check for user token.
  var isLoggedIn = storage.isLoggedIn();
  var isWelcomePage = utils.isWelcomePage();
  if (!isLoggedIn && !isWelcomePage) {

    // Check for token
    var token = getParameterByName("token");
    if (token) {
      storage.saveToken(token);
      utils.redirectToMainPage();
      return; 
    } else {
      utils.redirectToWelcomePage();
      return;
    }
  }

  if (isLoggedIn && isWelcomePage) {
    utils.redirectToMainPage();
    return; 
  }
})();