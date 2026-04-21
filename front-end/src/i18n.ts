import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import I18NextHttpBackend from "i18next-http-backend";

i18next
  .use(I18NextHttpBackend)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.VITE_APP_ENV === "development",
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    partialBundledLanguages: true,
    ns: [],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
  })
  .catch(() => {
    void 0;
  });
export default i18next;
