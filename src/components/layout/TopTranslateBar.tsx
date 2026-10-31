'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Megaphone } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

interface TopTranslateBarProps {
  announcementText?: string;
  showAnnouncement?: boolean;
}

const LANG_STORAGE_KEY = 'khashala_lang';

function clearAllGoogTransCookies() {
  if (typeof document === 'undefined') return;

  const host = window.location.hostname;
  const hostParts = host.split('.');
  const domains: (string | null)[] = [null, host, `.${host}`];

  for (let i = 0; i < hostParts.length - 1; i++) {
    const sub = hostParts.slice(i).join('.');
    domains.push(sub);
    domains.push(`.${sub}`);
  }

  const paths = ['/', window.location.pathname || '/'];
  const expiry = 'Thu, 01 Jan 1970 00:00:00 GMT';

  for (const d of domains) {
    for (const p of paths) {
      if (d) {
        document.cookie = `googtrans=; expires=${expiry}; path=${p}; domain=${d};`;
      } else {
        document.cookie = `googtrans=; expires=${expiry}; path=${p};`;
      }
    }
  }
}

function setEnglishGoogTransCookie() {
  if (typeof document === 'undefined') return;
  clearAllGoogTransCookies();
  const host = window.location.hostname;
  document.cookie = 'googtrans=/ar/en; path=/;';
  if (host && host !== 'localhost') {
    document.cookie = `googtrans=/ar/en; path=/; domain=${host};`;
    document.cookie = `googtrans=/ar/en; path=/; domain=.${host};`;
  }
}

function loadAndTriggerGoogleTranslateToEnglish() {
  if (typeof window === 'undefined') return;

  setEnglishGoogTransCookie();
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'en';

  const triggerCombo = () => {
    const combo = document.querySelector(
      '.goog-te-combo'
    ) as HTMLSelectElement | null;
    if (combo) {
      combo.value = 'en';
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  };

  if (triggerCombo()) {
    return;
  }

  window.googleTranslateElementInit = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'ar',
          includedLanguages: 'en,ar',
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setTimeout(triggerCombo, 250);
      setTimeout(triggerCombo, 700);
    }
  };

  const existingScript = document.getElementById('google-translate-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  } else if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit();
  }
}

export const TopTranslateBar: React.FC<TopTranslateBarProps> = ({
  announcementText,
  showAnnouncement,
}) => {
  const [activeLang, setActiveLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    let savedLang: 'ar' | 'en' = 'ar';
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === 'en') {
        savedLang = 'en';
      }
    } catch {}

    if (savedLang === 'en') {
      setActiveLang('en');
      loadAndTriggerGoogleTranslateToEnglish();
    } else {
      // Ensure 100% pure native Arabic when savedLang is 'ar'
      clearAllGoogTransCookies();
      setActiveLang('ar');
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  }, []);

  const switchLanguage = (targetLang: 'ar' | 'en') => {
    if (targetLang === 'ar') {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, 'ar');
      } catch {}
      clearAllGoogTransCookies();
      setActiveLang('ar');
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.documentElement.classList.remove(
        'translated-ltr',
        'translated-rtl'
      );

      // Reload without loading Google Translate script so page returns to 100% native Arabic
      window.location.reload();
      return;
    }

    // Switching to English ('en')
    try {
      localStorage.setItem(LANG_STORAGE_KEY, 'en');
    } catch {}
    setActiveLang('en');
    loadAndTriggerGoogleTranslateToEnglish();
  };

  return (
    <div className="bg-[#111827] text-white border-b border-slate-800 text-[11px] sm:text-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-between gap-2">
        {/* Right Side: Announcement or Welcome Tagline */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showAnnouncement && announcementText ? (
            <>
              <Megaphone className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
              <span className="font-bold text-slate-100 truncate">
                {announcementText}
              </span>
            </>
          ) : (
            <span className="font-bold text-slate-300 truncate">
              مرحباً بكم في منصة خشاله للإعلانات المبوبة
            </span>
          )}
        </div>

        {/* Left Side: Google Translate Bar (Arabic <-> English) */}
        <div
          className="flex items-center gap-2 shrink-0 notranslate"
          translate="no"
        >
          <div className="hidden sm:flex items-center gap-1 text-slate-300 text-[11px] font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Google Translate:</span>
          </div>

          <div className="inline-flex items-center rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => switchLanguage('ar')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-colors cursor-pointer ${
                activeLang === 'ar'
                  ? 'bg-[#e00000] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLang === 'en'
                  ? 'bg-[#e00000] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3 sm:hidden" />
              <span>English</span>
            </button>
          </div>

          {/* Hidden Mount Point for Official Google Translate Engine */}
          <div
            id="google_translate_element"
            className="google-translate-container"
          />
        </div>
      </div>
    </div>
  );
};
