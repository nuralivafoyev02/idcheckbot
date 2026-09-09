(function () {
    'use strict';

    var SUPPORTED_LANGS = ['uz', 'ru', 'kz'];
    var DEFAULT_LANG = 'uz';
    var LANG_LABELS = { uz: 'UZ', ru: 'RU', kz: 'KZ' };

    function loadTranslations(lang) {
        return fetch('./lang/' + lang + '.json').then(function (res) {
            if (!res.ok) throw new Error('lang not found');
            return res.json();
        });
    }

    function applyTranslations(translations) {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[key]) {
                el.textContent = translations[key];
            }
        });
    }

    function setLang(lang) {
        if (SUPPORTED_LANGS.indexOf(lang) === -1) {
            lang = DEFAULT_LANG;
        }
        // Format document lang for UZ special case
        var htmlLang = lang === 'kz' ? 'kk' : lang;
        document.documentElement.lang = htmlLang;

        document.querySelectorAll('.lang-option').forEach(function (opt) {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });

        document.getElementById('langLabel').textContent = LANG_LABELS[lang];

        loadTranslations(lang).then(function (data) {
            applyTranslations(data);
        }).catch(function () {
            loadTranslations(DEFAULT_LANG).then(applyTranslations);
        });

        try {
            localStorage.setItem('mlbb-lang', lang);
        } catch (e) { /* ignore */ }
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('mlbb-theme', theme);
        } catch (e) { /* ignore */ }
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    function initTheme() {
        var saved = null;
        try {
            saved = localStorage.getItem('mlbb-theme');
        } catch (e) { /* ignore */ }
        if (!saved) {
            saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        setTheme(saved);
    }

    function initLang() {
        var saved = null;
        try {
            saved = localStorage.getItem('mlbb-lang');
        } catch (e) { /* ignore */ }
        if (!saved) {
            var navLang = (navigator.language || DEFAULT_LANG).toLowerCase();
            if (navLang.indexOf('ru') === 0) saved = 'ru';
            else if (navLang.indexOf('kk') === 0 || navLang.indexOf('kz') === 0) saved = 'kz';
            else saved = DEFAULT_LANG;
        }
        setLang(saved);
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Scroll reveal for sections
    function initReveal() {
        var sections = document.querySelectorAll('.section, .cta-section');
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        sections.forEach(function (s) {
            s.classList.add('reveal');
            observer.observe(s);
        });
    }

    function initNavClickOutside() {
        document.addEventListener('click', function (e) {
            var switcher = document.getElementById('langSwitcher');
            var dropdown = document.getElementById('langDropdown');
            if (switcher && dropdown && !switcher.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    function init() {
        initTheme();
        initLang();
        initSmoothScroll();
        initReveal();
        initNavClickOutside();

        document.getElementById('themeBtn').addEventListener('click', toggleTheme);

        var langBtn = document.getElementById('langBtn');
        var langDropdown = document.getElementById('langDropdown');
        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            langDropdown.classList.toggle('open');
        });

        document.querySelectorAll('.lang-option').forEach(function (opt) {
            opt.addEventListener('click', function () {
                setLang(opt.getAttribute('data-lang'));
                langDropdown.classList.remove('open');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
