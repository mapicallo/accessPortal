(function () {
  var STORAGE_LANG = 'accessportal-locale';

  function setLang(lang) {
    var isEs = lang === 'es';
    document.documentElement.lang = lang;

    var select = document.getElementById('lang-select');
    if (select) select.value = lang;
    if (select) {
      select.setAttribute('aria-labelledby', isEs ? 'lang-label-es' : 'lang-label-en');
    }

    document.title = isEs
      ? 'Política de privacidad — AccessPortal'
      : 'Privacy Policy — AccessPortal';

    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        isEs
          ? 'Política de privacidad de AccessPortal (PWA y extensión Chrome con IA integrada en el dispositivo).'
          : 'Privacy policy for AccessPortal (PWA and Chrome extension with on-device built-in AI).',
      );
    }
  }

  function langFromQuery() {
    var params = new URLSearchParams(location.search);
    var q = params.get('lang');
    return q === 'es' || q === 'en' ? q : null;
  }

  function langFromNavigator() {
    return navigator.language && navigator.language.toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  function persistLang(lang) {
    try {
      localStorage.setItem(STORAGE_LANG, lang);
    } catch (e) {
      /* ignore */
    }
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ accessportal_locale: lang });
      }
    } catch (e) {
      /* ignore */
    }
  }

  function loadStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_LANG);
      if (stored === 'es' || stored === 'en') return stored;
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function updateUrl(lang) {
    try {
      var url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    } catch (err) {
      /* ignore */
    }
  }

  function init() {
    var select = document.getElementById('lang-select');
    if (select) {
      select.addEventListener('change', function (e) {
        var next = e.target.value === 'es' ? 'es' : 'en';
        setLang(next);
        persistLang(next);
        updateUrl(next);
      });
    }

    var lang = langFromQuery() || loadStoredLang() || langFromNavigator();
    setLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
