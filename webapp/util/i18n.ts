import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'


import de from "../locales/de";
import en from "../locales/en";
import es from "../locales/es";
import fr from "../locales/fr";
import id from "../locales/id";
import it from "../locales/it";
import ja from "../locales/ja";
import ko from "../locales/ko";
import nl from "../locales/nl";
import pt from "../locales/pt";
import ro from "../locales/ro";
import ru from "../locales/ru";
import tr from "../locales/tr";
import vi from "../locales/vi";
import zh_CN from "../locales/zh_CN";
import zh_TW from "../locales/zh_TW";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            "de": {
                translation: de
            },
            "en": {
                translation: en
            },
            "es": {
                translation: es
            },
            "fr": {
                translation: fr
            },
            "id": {
                translation: id
            },
            "it": {
                translation: it
            },
            "ja": {
                translation: ja
            },
            "ko": {
                translation: ko
            },
            "nl": {
                translation: nl
            },
            "pt": {
                translation: pt
            },
            "ro": {
                translation: ro
            },
            "ru": {
                translation: ru
            },
            "tr": {
                translation: tr
            },
            "vi": {
                translation: vi
            },
            "zh_CN": {
                translation: zh_CN
            },
            "zh_TW": {
                translation: zh_TW
            }
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;