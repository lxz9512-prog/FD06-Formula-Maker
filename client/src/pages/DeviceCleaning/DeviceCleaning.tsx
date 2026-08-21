import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Droplets,
  Thermometer,

  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Beaker,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';
import { useTranslation } from "@client/src/hooks/useTranslation";
import {
  formatVolumeFromMl,
  useVolumeUnit,
} from "@client/src/contexts/VolumeUnitContext";

type CleaningMode = "descaling" | "sterilization";
type CleaningStep = "select" | "prepare" | "running" | "pause" | "complete";
type RunningPhase = "phase1" | "phase2" | null;

interface CleaningStatus {
  temperature: number;
  waterOutput: number;
  fanRunning: boolean;
  currentCycle: number;
  totalCycles: number;
  remainingTime: number;
  powerFlashing: boolean;
}

interface StepInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const getDescalingSteps = (t: (key: string, params?: Record<string, string | number>) => string): StepInfo[] => [
  {
    title: t("cleaning.stepDescaling1"),
    description: t("cleaning.stepDescaling1Desc"),
    icon: <Beaker className="h-5 w-5" />,
  },
  {
    title: t("cleaning.stepPlaceContainer"),
    description: t("cleaning.stepPlaceContainerDesc"),
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    title: t("cleaning.stepStartDescaling"),
    description: t("cleaning.stepStartDescalingDesc"),
    icon: <Play className="h-5 w-5" />,
  },
];

const getSterilizationSteps = (t: (key: string, params?: Record<string, string | number>) => string): StepInfo[] => [
  {
    title: t("cleaning.stepAddWater"),
    description: t("cleaning.stepAddWaterDesc"),
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    title: t("cleaning.stepPlaceContainer"),
    description: t("cleaning.stepPlaceContainer2Desc"),
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    title: t("cleaning.stepStartSterilization"),
    description: t("cleaning.stepStartSterilizationDesc"),
    icon: <Thermometer className="h-5 w-5" />,
  },
];

const DeviceCleaning: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { unit } = useVolumeUnit();
  const formatUnitText = (value: string) => {
    if (unit === "ml") return value;
    return value.replace(/(\d+(?:\.\d+)?)mL/g, (_, amount: string) =>
      formatVolumeFromMl(Number(amount), unit),
    );
  };
  const unitAwareT = (
    key: string,
    params?: Record<string, string | number>,
  ) => formatUnitText(t(key, params));
  const [selectedMode, setSelectedMode] = useState<CleaningMode | null>(null);
  const [currentStep, setCurrentStep] = useState<CleaningStep>("select");
  const [runningPhase, setRunningPhase] = useState<RunningPhase>(null);
  const [status, setStatus] = useState<CleaningStatus>({
    temperature: 26,
    waterOutput: 0,
    fanRunning: false,
    currentCycle: 0,
    totalCycles: 5,
    remainingTime: 0,
    powerFlashing: false,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const location = useLocation();
  const hasAutoStarted = useRef(false);
  const [tubeStatus, setTubeStatus] = useState(() => Math.floor(Math.random() * 301));

  const clearCleaningTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const simulateDescalingPhase1 = useCallback(() => {
    let cycle = 0;
    let subStep = 0;
    let temp = 26;
    let waterOut = 0;

    timerRef.current = setInterval(() => {
      setStatus((prev) => {
        let newTemp = prev.temperature;
        let newWater = prev.waterOutput;
        let newFan = prev.fanRunning;
        let newCycle = prev.currentCycle;
        let remaining = prev.remainingTime;
        let statusText = "";

        if (subStep === 0) {
          newTemp = Math.min(50, prev.temperature + 2);
          newFan = false;
          if (newTemp >= 50) {
            subStep = 1;
          }
        } else if (subStep === 1) {
          newWater = prev.waterOutput + 30;
          newFan = true;
          subStep = 2;
          remaining = 180;
        } else if (subStep === 2) {
          remaining = Math.max(0, prev.remainingTime - 60);
          newFan = true;
          if (remaining <= 0) {
            cycle++;
            if (cycle < 5) {
              subStep = 1;
              newCycle = cycle;
            } else {
              subStep = 3;
              newCycle = 5;
            }
          }
        } else if (subStep === 3) {
          newWater = prev.waterOutput + 200;
          newFan = true;
          clearCleaningTimer();
          setRunningPhase("phase2");
          setCurrentStep("pause");
          return {
            ...prev,
            temperature: 50,
            waterOutput: newWater,
            fanRunning: false,
            currentCycle: 5,
            remainingTime: 0,
            powerFlashing: true,
          };
        }

        return {
          ...prev,
          temperature: newTemp,
          waterOutput: newWater,
          fanRunning: newFan,
          currentCycle: newCycle,
          remainingTime: remaining,
        };
      });
    }, 100);
  }, []);

  useEffect(() => {
    const state = location.state as { autoStartDescaling?: boolean } | null;
    if (state?.autoStartDescaling && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setSelectedMode("descaling");
      setCurrentStep("running");
      setRunningPhase("phase1");
      setStatus((prev) => ({
        ...prev,
        waterOutput: 0,
        currentCycle: 0,
        powerFlashing: false,
      }));
      simulateDescalingPhase1();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, simulateDescalingPhase1]);

  const simulateDescalingPhase2 = useCallback(() => {
    let subStep = 0;
    let targetTemp = 45;

    timerRef.current = setInterval(() => {
      setStatus((prev) => {
        let newTemp = prev.temperature;
        let newWater = prev.waterOutput;
        let newFan = prev.fanRunning;

        if (subStep === 0) {
          newTemp = Math.min(targetTemp, prev.temperature + 3);
          newFan = false;
          if (newTemp >= targetTemp) {
            subStep = 1;
          }
        } else if (subStep === 1) {
          newWater = prev.waterOutput + 350;
          newFan = true;
          clearCleaningTimer();
          setCurrentStep("complete");
          return {
            ...prev,
            temperature: targetTemp,
            waterOutput: newWater,
            fanRunning: false,
            powerFlashing: false,
          };
        }

        return {
          ...prev,
          temperature: newTemp,
          waterOutput: newWater,
          fanRunning: newFan,
        };
      });
    }, 100);
  }, []);

  const simulateSterilization = useCallback(() => {
    let cycle = 0;
    let subStep = 0;
    let temp = 26;

    timerRef.current = setInterval(() => {
      setStatus((prev) => {
        let newTemp = prev.temperature;
        let newWater = prev.waterOutput;
        let newFan = prev.fanRunning;
        let newCycle = prev.currentCycle;
        let remaining = prev.remainingTime;

        if (subStep === 0) {
          newWater = 150;
          newFan = true;
          subStep = 1;
        } else if (subStep === 1) {
          newTemp = Math.min(70, prev.temperature + 5);
          newFan = false;
          if (newTemp >= 70) {
            subStep = 2;
            remaining = 180;
          }
        } else if (subStep === 2) {
          remaining = Math.max(0, prev.remainingTime - 1);
          newFan = true;
          if (remaining <= 0) {
            cycle++;
            if (cycle < 3) {
              subStep = 3;
              newCycle = cycle;
            } else {
              subStep = 4;
              newCycle = 3;
            }
          }
        } else if (subStep === 3) {
          newTemp = 26;
          subStep = 1;
        } else if (subStep === 4) {
          newTemp = Math.max(40, prev.temperature - 5);
          newFan = false;
          if (newTemp <= 40) {
            subStep = 5;
          }
        } else if (subStep === 5) {
          newWater = prev.waterOutput + 50;
          newFan = true;
          clearCleaningTimer();
          setCurrentStep("complete");
          return {
            ...prev,
            temperature: 40,
            waterOutput: newWater,
            fanRunning: false,
            currentCycle: 3,
          };
        }

        return {
          ...prev,
          temperature: newTemp,
          waterOutput: newWater,
          fanRunning: newFan,
          currentCycle: newCycle,
          remainingTime: remaining,
        };
      });
    }, 100);
  }, []);

  const handleStartCleaning = () => {
    setCurrentStep("running");
    setStatus((prev) => ({
      ...prev,
      waterOutput: 0,
      currentCycle: 0,
      powerFlashing: false,
    }));

    if (selectedMode === "descaling") {
      setRunningPhase("phase1");
      simulateDescalingPhase1();
    } else {
      setRunningPhase(null);
      simulateSterilization();
    }
  };

  const handleContinuePhase2 = () => {
    setStatus((prev) => ({
      ...prev,
      temperature: 26,
      powerFlashing: false,
    }));
    setCurrentStep("running");
    simulateDescalingPhase2();
  };

  const handleReset = () => {
    clearCleaningTimer();
    if (selectedMode === "descaling" && currentStep === "complete") {
      setTubeStatus(0);
    }
    setCurrentStep("select");
    setSelectedMode(null);
    setRunningPhase(null);
    setStatus({
      temperature: 26,
      waterOutput: 0,
      fanRunning: false,
      currentCycle: 0,
      totalCycles: 5,
      remainingTime: 0,
      powerFlashing: false,
    });
  };

  useEffect(() => {
    return () => {
      clearCleaningTimer();
    };
  }, []);


  const getCurrentStatusText = (): string => {
    if (currentStep === "complete") return t("cleaning.statusComplete");
    if (currentStep === "pause") return t("cleaning.statusWaiting");
    if (status.temperature < 50 && selectedMode === "descaling" && runningPhase === "phase1") {
      return t("cleaning.statusHeating");
    }
    if (status.fanRunning && status.remainingTime > 0) {
      return t("cleaning.statusHolding");
    }
    if (status.fanRunning) {
      return t("cleaning.statusPumping");
    }
    return t("cleaning.statusStandby");
  };

  const getTubeStatusInfo = (value: number) => {
    if (value <= 200) return { label: t("cleaning.tubeExcellent"), color: "#52C41A", bg: "#F6FFED" };
    if (value <= 250) return { label: t("cleaning.tubeGood"), color: "#FAAD14", bg: "#FFFBE6" };
    return { label: t("cleaning.tubeFair"), color: "#FF4D4F", bg: "#FFF2F0" };
  };

  const renderModeSelect = () => {
    const tubeInfo = getTubeStatusInfo(tubeStatus);
    return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <div
        className="mb-4 flex items-center justify-between rounded-[14px] p-4"
        style={{ backgroundColor: tubeInfo.bg, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div>
          <p className="text-[12px]" style={{ color: "#888888" }}>{t("cleaning.sinceLastClean")}</p>
          <p className="mt-1 text-[20px] font-bold leading-none" style={{ color: tubeInfo.color }}>
            {t("cleaning.bottlesMade", { count: tubeStatus })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="rounded-full px-3 py-1 text-[13px] font-semibold text-white"
            style={{ backgroundColor: tubeInfo.color }}
          >
            {tubeInfo.label}
          </span>

        </div>
      </div>
      <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "#1A1A1A" }}>
        {t("cleaning.selectMode")}
      </h2>
      <div className="space-y-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedMode("descaling");
            setCurrentStep("prepare");
          }}
          className="flex w-full items-center gap-4 rounded-[16px] bg-white p-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]"
            style={{ background: "#FFF7ED" }}
          >
            <Beaker className="h-6 w-6" style={{ color: "#F97316" }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-semibold" style={{ color: "#1A1A1A" }}>
              {t("cleaning.descaling")}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: "#888888" }}>
              {t("cleaning.descalingDesc")}
            </p>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: "#CCCCCC" }} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedMode("sterilization");
            setCurrentStep("prepare");
          }}
          className="flex w-full items-center gap-4 rounded-[16px] bg-white p-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]"
            style={{ background: "#FEF2F2" }}
          >
            <Sparkles className="h-6 w-6" style={{ color: "#EF4444" }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-semibold" style={{ color: "#1A1A1A" }}>
              {t("cleaning.sterilizationMode")}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: "#888888" }}>
              {t("cleaning.sterilizationDesc")}
            </p>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: "#CCCCCC" }} />
        </motion.button>
      </div>

      <div className="mt-6 rounded-[12px] bg-white/60 p-4">
        <p className="mb-2 text-[13px] font-medium" style={{ color: "#1A1A1A" }}>
          {t("cleaning.tips")}
        </p>
        <ul className="space-y-2 text-[12px]" style={{ color: "#666666" }}>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-400" />
            <span>{t("cleaning.tip1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
            <span>{t("cleaning.tip2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
            <span>{t("cleaning.tip3")}</span>
          </li>
        </ul>
      </div>
    </div>
    );
  };

  const renderPrepareSteps = () => {
    const steps = selectedMode === "descaling" ? getDescalingSteps(unitAwareT) : getSterilizationSteps(unitAwareT);
    const modeTitle = selectedMode === "descaling" ? t("cleaning.descalingModeLabel") : t("cleaning.sterilizationModeLabel");
    const modeColor = selectedMode === "descaling" ? "#F97316" : "#EF4444";

    return (
      <div className="flex flex-1 flex-col px-5 pt-4">
        <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "#1A1A1A" }}>
          {t("cleaning.prepareSteps", { mode: modeTitle })}
        </h2>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-[14px] bg-white p-4"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: index === 2 ? `${modeColor}15` : "#F5F5F5" }}
              >
                <span style={{ color: index === 2 ? modeColor : "#888888" }}>
                  {step.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium" style={{ color: "#1A1A1A" }}>
                  {index + 1}. {step.title}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "#666666" }}>
                  {step.description}
                </p>
                {selectedMode === "descaling" && index === 0 && (
                  <UniversalLink
                    to="https://www.momcozy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1.5"
                    style={{ background: "#FFF7ED" }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" style={{ color: "#F97316" }} />
                    <span className="text-[12px] font-medium" style={{ color: "#F97316" }}>
                      {t("cleaning.buyDescaling")}
                    </span>
                  </UniversalLink>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex-1" />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStartCleaning}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-[26px] h-[52px]"
          style={{ background: modeColor }}
        >
          <Play className="h-5 w-5 text-white" />
            <span className="text-[15px] font-semibold text-white">
              {t("cleaning.startClean")}
            </span>
        </motion.button>
      </div>
    );
  };

  const renderRunningStatus = () => {
    const modeColor = selectedMode === "descaling" ? "#F97316" : "#EF4444";
    const isPhase2 = runningPhase === "phase2";

    return (
      <div className="flex flex-1 flex-col px-5 pt-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold" style={{ color: "#1A1A1A" }}>
            {isPhase2 ? t("cleaning.runningPhase2") : t("cleaning.runningInProgress")}
          </h2>
          {status.powerFlashing && (
            <span className="text-[12px] font-medium" style={{ color: modeColor }}>
              {t("cleaning.powerFlash")}
            </span>
          )}
        </div>

        <div
          className="mb-6 rounded-[20px] p-5"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px]" style={{ color: "#666666" }}>
              {t("cleaning.currentStatus")}
            </span>
            <span className="text-[13px] font-medium" style={{ color: modeColor }}>
              {getCurrentStatusText()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[12px] bg-white p-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="mb-1 flex items-center gap-1.5">
                <Thermometer className="h-4 w-4" style={{ color: modeColor }} />
                <span className="text-[12px]" style={{ color: "#888888" }}>{t("cleaning.waterTemp")}</span>
              </div>
              <p className="text-[24px] font-bold" style={{ color: "#1A1A1A" }}>
                {status.temperature}°C
              </p>
            </div>

            <div className="rounded-[12px] bg-white p-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="mb-1 flex items-center gap-1.5">
                <Droplets className="h-4 w-4" style={{ color: "#3B82F6" }} />
                <span className="text-[12px]" style={{ color: "#888888" }}>{t("cleaning.waterOutput")}</span>
              </div>
              <p className="text-[24px] font-bold" style={{ color: "#1A1A1A" }}>
                {formatVolumeFromMl(status.waterOutput, unit)}
              </p>
            </div>



            <div className="rounded-[12px] bg-white p-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="mb-1 flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" style={{ color: modeColor }} />
                <span className="text-[12px]" style={{ color: "#888888" }}>{t("cleaning.cycles")}</span>
              </div>
              <p className="text-[14px] font-medium" style={{ color: "#1A1A1A" }}>
                {status.currentCycle} / {selectedMode === "descaling" ? 5 : 3} {t("cleaning.cycleUnit")}
              </p>
            </div>
          </div>

          {status.remainingTime > 0 && (
            <div className="mt-4 rounded-[10px] p-3" style={{ background: `${modeColor}10` }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "#666666" }}>{t("cleaning.countdown")}</span>
                <span className="text-[14px] font-bold" style={{ color: modeColor }}>
                  {Math.floor(status.remainingTime / 60)}:{String(status.remainingTime % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {selectedMode === "descaling" && runningPhase === "phase1" && (
          <div
            className="mb-4 rounded-[12px] p-3"
            style={{ background: "#FEF3C7" }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#D97706" }} />
              <p className="text-[12px] leading-relaxed" style={{ color: "#92400E" }}>
                {formatUnitText(t("cleaning.phase1Tip"))}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPauseScreen = () => {
    const modeColor = selectedMode === "descaling" ? "#F97316" : "#EF4444";

    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: `${modeColor}15` }}
        >
          <Pause className="h-10 w-10" style={{ color: modeColor }} />
        </div>

        <h2 className="mb-2 text-[20px] font-semibold" style={{ color: "#1A1A1A" }}>
          {runningPhase === "phase2" ? t("cleaning.pausePreparePhase2") : t("cleaning.pauseTitle")}
        </h2>

        <p className="mb-8 text-center text-[14px]" style={{ color: "#666666" }}>
          {runningPhase === "phase2"
            ? formatUnitText(t("cleaning.pausePhase2Desc"))
            : formatUnitText(t("cleaning.pauseDesc"))}
        </p>

        {runningPhase === "phase2" ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinuePhase2}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[26px] h-[52px]"
            style={{ background: modeColor }}
          >
            <Play className="h-5 w-5 text-white" />
            <span className="text-[15px] font-semibold text-white">{t("cleaning.continueClean")}</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setCurrentStep("running");
              if (selectedMode === "descaling") {
                simulateDescalingPhase1();
              } else {
                simulateSterilization();
              }
            }}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[26px] h-[52px]"
            style={{ background: modeColor }}
          >
            <Play className="h-5 w-5 text-white" />
            <span className="text-[15px] font-semibold text-white">{t("cleaning.continueClean")}</span>
          </motion.button>
        )}

      </div>
    );
  };

  const renderCompleteScreen = () => {
    const modeColor = selectedMode === "descaling" ? "#F97316" : "#EF4444";

    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "#DCFCE7" }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: "#22C55E" }} />
        </motion.div>

        <h2 className="mb-2 text-[20px] font-semibold" style={{ color: "#1A1A1A" }}>
        {t("cleaning.completeTitle")}
      </h2>

        <p className="mb-8 text-center text-[14px]" style={{ color: "#666666" }}>
          {selectedMode === "descaling"
            ? t("cleaning.completeDescaling")
            : t("cleaning.completeSterilization")}
        </p>


        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/device-settings")}
          className="flex w-full items-center justify-center gap-2 rounded-[26px] border h-[52px]"
          style={{ borderColor: "#E5E5E5", background: "white" }}
        >
          <span className="text-[15px] font-medium" style={{ color: "#666666" }}>
                {t("cleaning.backToSettings")}
          </span>
        </motion.button>
      </div>
    );
  };

  return (
    <IPhoneFrame background="#F7F7F7">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 pt-6 pb-3">
              {currentStep !== "running" ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <ArrowLeft className="h-6 w-6" style={{ color: "#1A1A1A" }} />
                </motion.button>
              ) : (
                <div className="h-8 w-8" />
              )}
          <h1 className="text-[16px] font-semibold" style={{ color: "#1A1A1A" }}>
            {t("cleaning.title")}
          </h1>
          <div className="h-8 w-8" />
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {renderModeSelect()}
            </motion.div>
          )}

          {currentStep === "prepare" && (
            <motion.div
              key="prepare"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-1 flex-col"
            >
              {renderPrepareSteps()}
            </motion.div>
          )}

          {currentStep === "running" && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {renderRunningStatus()}
            </motion.div>
          )}

          {currentStep === "pause" && (
            <motion.div
              key="pause"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {renderPauseScreen()}
            </motion.div>
          )}

          {currentStep === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {renderCompleteScreen()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IPhoneFrame>
  );
};

export default DeviceCleaning;
