export const environment = {
  production: false,
  // Con il proxy di ng serve (proxy.conf.json) le chiamate /api vengono
  // inoltrate a localhost:5007, quindi in dev si usa l'origine relativa.
  apiUrl: ''
};
