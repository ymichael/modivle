var store = require('store');

module.exports = {
  check: function() {
    // Make sure that localstorage works in the current browser.
    if (!store.enabled) {
      alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
      return;
    }
  },
  isLoggedIn: function() {
    return !!store.get('token');
  },
  getToken: function() {
    return store.get('token');
  },
  saveToken: function(token) {
    store.set('token', token);
  },
  logout: function() {
    store.clear();
  },
  saveState: function(state) {
    return store.set('state', state);
  },
  getState: function() {
    return store.get('state');
  }
}