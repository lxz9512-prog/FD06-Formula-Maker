import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import { useTranslation } from "@client/src/hooks/useTranslation";

type CalibrationState = "step1" | "step2";
type ModalType = "calibrating" | "success" | null;

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  const { t } = useTranslation();
  return (
  <div className="mb-6 flex items-center justify-center gap-3">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div key={step} className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{
              backgroundColor:
                step < currentStep
                  ? "#8B4A1B"
                  : step === currentStep
                    ? "#8B4A1B"
                    : "#E8E8E8",
              color:
                step <= currentStep ? "white" : "#999999",
            }}
          >
            {step < currentStep ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              step
            )}
          </div>
          <span
            className="text-[13px]"
            style={{
              color: step === currentStep ? "#1A1A1A" : "#999999",
              fontWeight: step === currentStep ? 500 : 400,
            }}
          >
            {step === 1 ? t("waterCalibration.prepare") : t("waterCalibration.calibrate")}
          </span>
        </div>
        {step < totalSteps && (
          <div
            className="h-[1px] w-8"
            style={{
              backgroundColor:
                step < currentStep ? "#8B4A1B" : "#E8E8E8",
            }}
          />
        )}
      </div>
    ))}
  </div>
  );
};

// 校准中弹窗
const CalibratingModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center rounded-[16px] bg-white px-10 py-10"
            style={{ minWidth: "240px" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mb-6"
            >
              <Loader2
                className="h-12 w-12"
                style={{ color: "#8B4A1B" }}
              />
            </motion.div>
            <h2
              className="mb-2 text-[18px] font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              {t("waterCalibration.calibrating")}
            </h2>
            <p
              className="text-[14px]"
              style={{ color: "#999999" }}
            >
              {t("waterCalibration.calibratingDesc")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 校准完成弹窗
const SuccessModal: React.FC<{ isOpen: boolean; onComplete: () => void }> = ({
  isOpen,
  onComplete,
}) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center rounded-[16px] bg-white px-10 py-10"
            style={{ minWidth: "240px" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#52C41A" }}
            >
              <Check className="h-8 w-8 text-white" />
            </motion.div>
            <h2
              className="mb-2 text-[18px] font-semibold"
              style={{ color: "#1A1A1A" }}
            >
              {t("waterCalibration.complete")}
            </h2>
            <p
              className="mb-6 text-[14px]"
              style={{ color: "#999999" }}
            >
              {t("waterCalibration.completeDesc")}
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onComplete}
              className="flex w-full items-center justify-center rounded-[26px] h-[52px]"
              style={{ backgroundColor: "#8B4A1B" }}
            >
              <span className="text-[15px] font-medium text-white">
                {t("common.done")}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const WaterCalibration: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [state, setState] = useState<CalibrationState>("step1");
  const [modalType, setModalType] = useState<ModalType>(null);

  useEffect(() => {
    if (modalType === "calibrating") {
      const timer = setTimeout(() => {
        setModalType("success");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [modalType]);

  const handleStartCalibration = () => {
    setModalType("calibrating");
  };

  const handleComplete = () => {
    navigate("/device-settings");
  };

  return (
    <IPhoneFrame
      background="#F7F7F7"
      overlay={
        modalType === "calibrating" ? (
          <CalibratingModal isOpen />
        ) : modalType === "success" ? (
          <SuccessModal isOpen onComplete={handleComplete} />
        ) : null
      }
    >
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
            {t("waterCalibration.title")}
          </h1>
          <div className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-4 pb-6">
          <AnimatePresence mode="wait">
            {state === "step1" && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-1 flex-col"
              >
                <StepIndicator currentStep={1} totalSteps={2} />

                <div className="flex-1 overflow-hidden rounded-[10px] bg-white p-5">
                  <div
                    className="mb-4 inline-block rounded-full px-3 py-1 text-[12px] font-medium"
                    style={{
                      backgroundColor: "#FFF5EE",
                      color: "#8B4A1B",
                    }}
                  >
                    {t("waterCalibration.step1")}
                  </div>
                  <h2
                    className="mb-3 text-[16px] font-semibold"
                    style={{ color: "#1A1A1A" }}
                  >
                    {t("waterCalibration.preparation")}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: "#8B4A1B" }}
                      >
                        1
                      </div>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "#333333" }}
                      >
                        {t("waterCalibration.placeBottleBefore")}
                        <span className="font-semibold" style={{ color: "#8B4A1B" }}>
                          200ML
                        </span>
                        {t("waterCalibration.placeBottleAfter")}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: "#8B4A1B" }}
                      >
                        2
                      </div>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "#333333" }}
                      >
                        {t("waterCalibration.ensureWaterBefore")}
                        <span className="font-semibold" style={{ color: "#8B4A1B" }}>
                          120ML
                        </span>
                        {t("waterCalibration.ensureWaterAfter")}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setState("step2")}
                  className="mt-4 flex w-full items-center justify-center rounded-[26px] h-[52px]"
                  style={{ backgroundColor: "#8B4A1B" }}
                >
                  <span className="text-[15px] font-medium text-white">
                    {t("waterCalibration.next")}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {state === "step2" && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-1 flex-col"
              >
                <StepIndicator currentStep={2} totalSteps={2} />

                <div className="flex-1 overflow-hidden rounded-[10px] bg-white p-5">
                  <div
                    className="mb-4 inline-block rounded-full px-3 py-1 text-[12px] font-medium"
                    style={{
                      backgroundColor: "#FFF5EE",
                      color: "#8B4A1B",
                    }}
                  >
                    {t("waterCalibration.step2")}
                  </div>
                  <h2
                    className="mb-3 text-[16px] font-semibold"
                    style={{ color: "#1A1A1A" }}
                  >
                    {t("waterCalibration.startTitle")}
                  </h2>
                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: "#FFF9F5" }}
                  >
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: "#333333" }}
                    >
                      {t("waterCalibration.calibrationInfoBefore")}
                      <span className="font-semibold" style={{ color: "#8B4A1B" }}>
                        4OZ / 120ML
                      </span>
                      {t("waterCalibration.calibrationInfoAfter")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState("step1")}
                    className="flex flex-1 items-center justify-center rounded-[26px] border h-[52px]"
                    style={{ borderColor: "#DDDDDD" }}
                  >
                    <span
                      className="text-[15px] font-medium"
                      style={{ color: "#666666" }}
                    >
                      {t("waterCalibration.previous")}
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartCalibration}
                    className="flex flex-1 items-center justify-center rounded-[26px] h-[52px]"
                    style={{ backgroundColor: "#8B4A1B" }}
                  >
                    <span className="text-[15px] font-medium text-white">
                    {t("waterCalibration.startCalibrating")}
                  </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </IPhoneFrame>
  );
};

export default WaterCalibration;
