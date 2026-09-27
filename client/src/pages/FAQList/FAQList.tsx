import { PageBackIcon } from '@/components/PageNavigation';
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, AlertTriangle, Droplets } from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import { useTranslation } from "@client/src/hooks/useTranslation";

interface FAQItem {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "mixing-chamber-cleaning",
    titleKey: "faqList.mixingChamberCleaning",
    icon: <Droplets className="h-4 w-4" style={{ color: "#E8842B" }} />,
  },
  {
    id: "powder-output-error",
    titleKey: "faqList.powderOutputError",
    icon: <AlertTriangle className="h-4 w-4" style={{ color: "#E8842B" }} />,
  },
];

const FAQList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <IPhoneFrame background="#F7F7F7">
      <div className="flex h-full flex-col">
        <div className="fd06-page-nav">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/device-assistant")}
            className="fd06-page-back" aria-label={t('common.back')}
          >
            <PageBackIcon />
          </motion.button>
          <h1
            className="text-[16px] font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            {t("faqList.title")}
          </h1>
          <div className="h-8 w-8" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="overflow-hidden rounded-[10px] bg-white">
            {FAQ_ITEMS.map((item, index) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/faq/${item.id}`)}
                className={`flex w-full items-center justify-between px-4 py-3.5 ${
                  index < FAQ_ITEMS.length - 1
                    ? "border-b border-[#EEEEEE]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#FFF5EE" }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-[14px]"
                    style={{ color: "#1A1A1A" }}
                  >
                    {t(item.titleKey)}
                  </span>
                </div>
                <ChevronRight
                  className="h-5 w-5"
                  style={{ color: "#CCCCCC" }}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
};

export default FAQList;
