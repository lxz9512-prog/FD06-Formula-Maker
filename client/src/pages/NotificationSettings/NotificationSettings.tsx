import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, AlertCircle } from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import { useTranslation } from "@client/src/hooks/useTranslation";

interface NotificationItem {
  key: string;
  labelKey: string;
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  { key: "lowWater", labelKey: "notificationSettings.lowWater" },
  { key: "lowPowder", labelKey: "notificationSettings.lowPowder" },
  { key: "powderClean", labelKey: "notificationSettings.powderClean" },
  { key: "tubeClean", labelKey: "notificationSettings.tubeClean" },
  { key: "waterCalibration", labelKey: "notificationSettings.waterCalibration" },
];

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_ITEMS.map((item) => [item.key, true]))
  );

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <IPhoneFrame background="#F7F7F7">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-6 pb-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft className="h-6 w-6" style={{ color: "#1A1A1A" }} />
          </motion.button>
          <h1
            className="text-[16px] font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            {t("notificationSettings.title")}
          </h1>
          <div className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Tip */}
          <div
            className="mb-4 flex items-start gap-2 rounded-[10px] p-3"
            style={{ backgroundColor: "#FFF9F5" }}
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "#8B4A1B" }}
            />
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "#8B4A1B" }}
            >
              {t("notificationSettings.tip")}
            </p>
          </div>

          {/* Notification List */}
          <div className="overflow-hidden rounded-[10px] bg-white">
            {NOTIFICATION_ITEMS.map((item, index) => (
              <div
                key={item.key}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  index < NOTIFICATION_ITEMS.length - 1
                    ? "border-b border-[#EEEEEE]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell
                    className="h-4 w-4"
                    style={{ color: "#888888" }}
                  />
                  <span
                    className="text-[14px]"
                    style={{ color: "#1A1A1A" }}
                  >
                    {t(item.labelKey)}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(item.key)}
                  className="relative h-[22px] w-[40px] rounded-full p-[2px] transition-colors duration-300"
                  style={{
                    backgroundColor: toggles[item.key]
                      ? "#8B4A1B"
                      : "#E0E0E0",
                  }}
                >
                  <motion.div
                    className="h-[18px] w-[18px] rounded-full bg-white"
                    style={{
                      boxShadow: toggles[item.key]
                        ? "none"
                        : "inset 0 0 0 1px rgba(0,0,0,0.08)",
                    }}
                    animate={{ x: toggles[item.key] ? 16 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
};

export default NotificationSettings;
