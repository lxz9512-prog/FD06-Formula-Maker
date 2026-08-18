import { useContext } from "react";
import { LanguageContext, type Language } from "@client/src/i18n/LanguageContext";

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  return { t: ctx.t, language: ctx.language, setLanguage: ctx.setLanguage };
}

export type { Language };
