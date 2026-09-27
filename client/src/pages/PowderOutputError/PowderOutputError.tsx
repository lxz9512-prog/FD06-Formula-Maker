import { PageBackIcon } from '@/components/PageNavigation';
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import { Image } from "@client/src/components/ui/image";
import { useTranslation } from "@client/src/hooks/useTranslation";
import powderBinMinImage from '@/assets/powder-bin-min.png';
import powderOutletCleaningImage from '@/assets/powder-outlet-cleaning.png';
import mixingChamberLidCleaningImage from '@/assets/mixing-chamber-lid-cleaning.png';

const IMG_POWDER_BIN_MIN = powderBinMinImage;
const IMG_CLEAN_OUTLET = powderOutletCleaningImage;
const IMG_CLEAN_LID = mixingChamberLidCleaningImage;

const StepHeader: React.FC<{
  step: number;
  title: string;
}> = ({ step, title }) => (
  <div className="mb-3 flex items-center gap-2">
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold text-white"
      style={{ backgroundColor: "#8B4A1B" }}
    >
      {step}
    </span>
    <span
      className="text-[15px] font-medium"
      style={{ color: "#1A1A1A" }}
    >
      {title}
    </span>
  </div>
);

const PowderOutputError: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <IPhoneFrame background="#F7F7F7">
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="fd06-page-nav">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="fd06-page-back" aria-label={t('common.back')}
          >
            <PageBackIcon />
          </motion.button>
          <h1
            className="text-[16px] font-semibold"
            style={{ color: "#1A1A1A" }}
          >
            {t("powderOutputError.title")}
          </h1>
          <div className="h-8 w-8" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Step 1 */}
          <div className="mb-5 overflow-hidden rounded-[10px] bg-white p-4">
            <StepHeader step={1} title={t("powderOutputError.step1Title")} />
            <p
              className="mb-3 text-[13px] leading-relaxed"
              style={{ color: "#666666" }}
            >
              {t("powderOutputError.step1Desc")}
            </p>
            <div className="overflow-hidden rounded-lg">
              <div className="aspect-[4/3] w-full">
                <Image
                  src={IMG_POWDER_BIN_MIN}
                  alt="粉仓MIN线位置"
                  className="h-full w-full bg-white object-contain"
                />
              </div>
            </div>
            <p
              className="mt-2 text-center text-[11px]"
              style={{ color: "#999999" }}
            >
              {t("powderOutputError.step1Caption")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="mb-5 overflow-hidden rounded-[10px] bg-white p-4">
            <StepHeader step={2} title={t("powderOutputError.step2Title")} />
            <p
              className="mb-3 text-[13px] leading-relaxed"
              style={{ color: "#666666" }}
            >
              {t("powderOutputError.step2Desc")}
            </p>
            {/* Video Placeholder */}
            <div
              className="relative flex items-center justify-center overflow-hidden rounded-lg"
              style={{ backgroundColor: "#1A1A1A", aspectRatio: "16/9" }}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Play
                    className="h-5 w-5 text-white"
                    fill="white"
                  />
                </div>
                <span className="text-[11px] text-white/60">
                  {t("powderOutputError.videoLabel")}
                </span>
              </div>
            </div>
            <p
              className="mt-2 text-center text-[11px]"
              style={{ color: "#999999" }}
            >
              {t("powderOutputError.step2Caption")}
            </p>
          </div>

          {/* Step 3 */}
          <div className="mb-5 overflow-hidden rounded-[10px] bg-white p-4">
            <StepHeader step={3} title={t("powderOutputError.step3Title")} />
            <p
              className="mb-3 text-[13px] leading-relaxed"
              style={{ color: "#666666" }}
            >
              {t("powderOutputError.step3Desc")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="overflow-hidden rounded-lg">
                <div className="aspect-[4/3] w-full">
                  <Image
                    src={IMG_CLEAN_OUTLET}
                    alt="清洗粉仓出粉口"
                    className="h-full w-full bg-white object-contain"
                  />
                </div>
                <p
                  className="mt-1.5 text-center text-[11px]"
                  style={{ color: "#999999" }}
                >
                  {t("powderOutputError.cleanOutlet")}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg">
                <div className="aspect-[4/3] w-full">
                  <Image
                    src={IMG_CLEAN_LID}
                    alt="清洗混合仓上盖"
                    className="h-full w-full bg-white object-contain"
                  />
                </div>
                <p
                  className="mt-1.5 text-center text-[11px]"
                  style={{ color: "#999999" }}
                >
                  {t("powderOutputError.cleanLid")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Contact Button */}
        <div
          className="absolute right-0 bottom-0 left-0 border-t px-4 py-3"
          style={{ borderColor: "#EEEEEE", backgroundColor: "white" }}
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/device-assistant")}
            className="flex w-full items-center justify-center rounded-[26px] h-[52px]"
            style={{ backgroundColor: "#8B4A1B" }}
          >
            <span className="text-[14px] font-medium text-white">
              {t("powderOutputError.contactSupport")}
            </span>
          </motion.button>
        </div>
      </div>
    </IPhoneFrame>
  );
};

export default PowderOutputError;
