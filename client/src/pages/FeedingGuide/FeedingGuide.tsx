import React from "react";
import { useTranslation } from "@client/src/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Heart, AlertCircle } from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import {
  ML_PER_OZ,
  roundVolume,
  useVolumeUnit,
} from "@client/src/contexts/VolumeUnitContext";

const STAT_CARD_SHADOW = "0px 4px 12px rgba(0,0,0,0.04)";

interface AgeGroupData {
  range: string;
  tip: string;
  singleAmount: string;
  frequency: string;
  dailyTotal: string;
}

const AGE_GROUPS: AgeGroupData[] = [
  {
    range: "0-7天",
    tip: "按需喂养，间隔2-3小时",
    singleAmount: "30-90ml",
    frequency: "6-8次",
    dailyTotal: "≤960ml",
  },
  {
    range: "8-30天",
    tip: "逐渐建立规律喂养节奏",
    singleAmount: "90-120ml",
    frequency: "8次",
    dailyTotal: "≤960ml",
  },
  {
    range: "1-4个月",
    tip: "夜间可减少一次喂养",
    singleAmount: "120-180ml",
    frequency: "4-5次",
    dailyTotal: "≤960ml",
  },
  {
    range: "4-6个月",
    tip: "可开始尝试添加辅食",
    singleAmount: "180-240ml",
    frequency: "4-5次",
    dailyTotal: "≤960ml",
  },
  {
    range: "7-9个月",
    tip: "辅食占比逐渐增加",
    singleAmount: "175-200ml",
    frequency: "4次",
    dailyTotal: "700-800ml",
  },
  {
    range: "10-12个月",
    tip: "以辅食为主，奶为辅",
    singleAmount: "150-175ml",
    frequency: "4次",
    dailyTotal: "600-700ml",
  },
  {
    range: "1-2岁",
    tip: "逐步过渡到日常饮食",
    singleAmount: "100-150ml",
    frequency: "2-4次",
    dailyTotal: "400-600ml",
  },
  {
    range: "2-3岁",
    tip: "保证营养均衡的日常饮食",
    singleAmount: "100-150ml",
    frequency: "2-4次",
    dailyTotal: "300-500ml",
  },
];

const TIPS = [
  "新生儿期（0-28天）建议按需喂养，不要刻意叫醒熟睡的宝宝喂奶，但间隔不宜超过4小时。",
  "每次喂奶后建议竖抱拍嗝5-10分钟，减少溢奶和肠胀气。",
  "奶粉冲调温度建议40-45℃，过热会破坏营养成分，过冷可能导致溶解不充分。",
  "观察宝宝的饥饿信号：转头寻乳、吮吸手指、烦躁不安等，及时响应有助于建立安全感。",
  "6个月后开始添加辅食，从高铁米粉开始，逐步引入蔬菜泥、水果泥、肉泥。",
];

const WARNINGS = [
  "持续拒奶或食欲明显下降",
  "体重增长缓慢或不增长",
  "频繁吐奶、呕吐或腹泻",
  "对奶粉过敏（皮疹、湿疹加重）",
];

const FeedingGuide: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { unit } = useVolumeUnit();

  const formatGuideVolume = (value: string) => {
    if (unit === "ml") return value;
    return value
      .replace(/\d+(?:\.\d+)?/g, (match) =>
        String(roundVolume(Number(match) / ML_PER_OZ)),
      )
      .replace(/ml/g, "oz");
  };

  const handleBack = () => {
    navigate("/feeding-stats");
  };

  const ageGroupsTranslated = AGE_GROUPS.map((g, i) => ({
    ...g,
    range: t(`feedingGuide.ageRange${i + 1}`),
    tip: t(`feedingGuide.ageTip${i + 1}`),
    frequency: t(`feedingGuide.ageFreq${i + 1}`),
    singleAmount: formatGuideVolume(g.singleAmount),
    dailyTotal: formatGuideVolume(g.dailyTotal),
  }));

  const tipsTranslated = [
    t("feedingGuide.tip1"),
    t("feedingGuide.tip2"),
    t("feedingGuide.tip3"),
    t("feedingGuide.tip4"),
    t("feedingGuide.tip5"),
  ];

  const warningsTranslated = [
    t("feedingGuide.warning1"),
    t("feedingGuide.warning2"),
    t("feedingGuide.warning3"),
    t("feedingGuide.warning4"),
  ];

  return (
    <IPhoneFrame background="linear-gradient(to bottom, hsl(39, 50%, 95%), hsl(39, 30%, 97%))">
      <div className="flex h-full flex-col">
        <div className="flex items-center px-5 pt-6 pb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white"
            style={{ boxShadow: "0px 2px 6px rgba(0,0,0,0.06)" }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: "#221122" }} />
          </motion.button>
          <h1
            className="ml-3 text-[18px] font-semibold"
            style={{ color: "#221122" }}
          >
            {t("feedingGuide.title")}
          </h1>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          {/* Age Groups Section */}
          <div
            className="rounded-[18px] bg-white p-4"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            <div className="mb-2 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                style={{ background: "rgba(232, 133, 61, 0.12)" }}
              >
                <BookOpen className="h-4 w-4" style={{ color: "#E8853D" }} />
              </div>
              <p className="text-[15px] font-semibold" style={{ color: "#221122" }}>
                {t("feedingGuide.ageSectionTitle")}
              </p>
            </div>
            <p className="mb-3 text-[12px] leading-relaxed" style={{ color: "#999497" }}>
              {t("feedingGuide.ageSectionDesc")}
            </p>

            <div className="space-y-2">
              {ageGroupsTranslated.map((group) => (
                <div
                  key={group.range}
                  className="rounded-[14px] p-3"
                  style={{ background: "#FAFAF8" }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[15px] font-semibold" style={{ color: "#221122" }}>
                      {group.range}
                    </span>
                    <span
                      className="rounded-[8px] px-2 py-0.5 text-[11px] font-medium"
                      style={{ color: "#E8853D", background: "rgba(232, 133, 61, 0.1)" }}
                    >
                      {group.tip}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: "#221122" }}>
                        {group.singleAmount}
                      </p>
                      <p className="text-[11px]" style={{ color: "#999497" }}>{t("feedingGuide.singleAmount")}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: "#221122" }}>
                        {group.frequency}
                      </p>
                      <p className="text-[11px]" style={{ color: "#999497" }}>{t("feedingGuide.frequency")}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: "#221122" }}>
                        {group.dailyTotal}
                      </p>
                      <p className="text-[11px]" style={{ color: "#999497" }}>{t("feedingGuide.dailyTotal")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div
            className="rounded-[18px] bg-white p-4"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                style={{ background: "rgba(224, 112, 112, 0.12)" }}
              >
                <Heart className="h-4 w-4" style={{ color: "#E07070" }} />
              </div>
              <p className="text-[15px] font-semibold" style={{ color: "#221122" }}>
                {t("feedingGuide.tipsTitle")}
              </p>
            </div>
            <div className="space-y-2.5">
              {tipsTranslated.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{ color: "#E07070", background: "rgba(224, 112, 112, 0.1)" }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#666" }}>
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Section */}
          <div
            className="rounded-[18px] bg-white p-4"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                style={{ background: "rgba(240, 160, 80, 0.12)" }}
              >
                <AlertCircle className="h-4 w-4" style={{ color: "#F0A050" }} />
              </div>
              <p className="text-[15px] font-semibold" style={{ color: "#221122" }}>
                {t("feedingGuide.warningsTitle")}
              </p>
            </div>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#666" }}>
              {t("feedingGuide.warningsDesc")}
            </p>
            <div className="space-y-1.5">
              {warningsTranslated.map((warning, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "#F0A050" }} />
                  <p className="text-[13px]" style={{ color: "#666" }}>
                    {warning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
};

export default FeedingGuide;
