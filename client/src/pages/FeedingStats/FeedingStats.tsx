import React, { useState, useMemo } from "react";
import { useTranslation } from "@client/src/hooks/useTranslation";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, BookOpen, ChevronRight as ChevronRightIcon } from "lucide-react";
import dayjs from "dayjs";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import FeedingRecordForm from "@client/src/pages/AddFeedingRecord/FeedingRecordForm";
import {
  ML_PER_OZ,
  formatVolumeFromMl,
  roundVolume,
  useVolumeUnit,
  type VolumeUnit,
} from "@client/src/contexts/VolumeUnitContext";

type TimeTab = "Daily" | "Weekly" | "Monthly";

const TABS: TimeTab[] = ["Daily", "Weekly", "Monthly"];

const DAILY_DATA = [30, 60, 120, 90, 150, 120, 180];
const DAILY_LABELS = ["0:00", "6:00", "9:00", "12:00", "15:00", "18:00", "21:00"];

const WEEKLY_DATA = [480, 540, 600, 510, 570, 630, 480];
const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHLY_DATA = [3200, 3360, 3570, 3780, 3600, 3900, 4100];
const MONTHLY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const TODAY_TOTAL = 720;
const TODAY_COUNT = 6;
const AVG_PER_FEED = 120;

function buildLineOption(
  labels: string[],
  data: number[],
  unit: VolumeUnit,
): EChartsOption {
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#FFFFFF",
      borderColor: "#F0EFEE",
      borderWidth: 1,
      textStyle: {
        color: "#221122",
        fontSize: 13,
      },
    },
    grid: {
      left: 40,
      right: 16,
      top: 24,
      bottom: 32,
      containLabel: false,
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { show: true, lineStyle: { color: "#E8E8E8" } },
      axisTick: { show: false },
      axisLabel: {
        color: "#999497",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      name: unit,
      nameLocation: "end",
      nameTextStyle: {
        color: "#999497",
        fontSize: 11,
        padding: [0, 0, 0, -20],
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: "#F0EFEE",
          type: "solid",
        },
      },
      axisLabel: {
        color: "#999497",
        fontSize: 11,
      },
    },
    series: [
      {
        type: "line",
        data,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          color: "#5DB97E",
          width: 2,
        },
        itemStyle: {
          color: "#FFFFFF",
          borderColor: "#5DB97E",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#5DB97E33" },
              { offset: 1, color: "#5DB97E05" },
            ],
          },
        },
      },
    ],
  };
  return option;
}

interface FeedRecord {
  id: string;
  type: "亲喂" | "瓶喂" | "奶粉";
  amount?: number;
  durationMinutes?: number;
  time: string;
  feeder: string;
}

const MOCK_RECORDS: FeedRecord[] = [
  { id: "1", type: "奶粉", amount: 30, time: "07/05 21:09", feeder: "祖父母" },
  { id: "2", type: "亲喂", durationMinutes: 18, time: "07/05 18:30", feeder: "妈妈" },
  { id: "3", type: "瓶喂", amount: 45, time: "07/05 15:20", feeder: "爸爸" },
  { id: "4", type: "奶粉", amount: 20, time: "07/05 12:00", feeder: "亲友" },
];

const STAT_CARD_SHADOW = "0px 4px 12px rgba(0,0,0,0.04)";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub }) => (
  <div
    className="flex flex-1 flex-col items-center rounded-[20px] bg-white px-2 py-3"
    style={{ boxShadow: STAT_CARD_SHADOW }}
  >
    <span className="text-[12px]" style={{ color: "#999497" }}>
      {label}
    </span>
    <span
      className="mt-1 text-[20px] font-bold leading-tight"
      style={{ color: "#221122" }}
    >
      {value}
    </span>
    <span className="mt-0.5 text-[11px]" style={{ color: "#999497" }}>
      {sub}
    </span>
  </div>
);

const DATE_BTN_STYLE = {
  background: "white",
  boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.9)",
};

const FeedingStats: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { unit } = useVolumeUnit();
  const [activeTab, setActiveTab] = useState<TimeTab>("Daily");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedWeekStart, setSelectedWeekStart] = useState(dayjs().startOf("week"));
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf("month"));
  const [showAddSheet, setShowAddSheet] = useState(false);

  const tabLabels: Record<TimeTab, string> = {
    Daily: t("feedingStats.tab.daily"),
    Weekly: t("feedingStats.tab.weekly"),
    Monthly: t("feedingStats.tab.monthly"),
  };

  const feedTypeLabels: Record<string, string> = {
    "亲喂": t("feedingRecord.type.breastfeed"),
    "瓶喂": t("feedingRecord.type.bottle"),
    "奶粉": t("feedingRecord.type.formula"),
  };

  const feederLabels: Record<string, string> = {
    "妈妈": t("feedingRecord.feeder.mom"),
    "爸爸": t("feedingRecord.feeder.dad"),
    "祖父母": t("feedingRecord.feeder.grandparents"),
    "亲友": t("feedingRecord.feeder.relatives"),
  };

  const weeklyLabels = [
    t("feedingStats.weekday.mon"), t("feedingStats.weekday.tue"),
    t("feedingStats.weekday.wed"), t("feedingStats.weekday.thu"),
    t("feedingStats.weekday.fri"), t("feedingStats.weekday.sat"),
    t("feedingStats.weekday.sun"),
  ];

  const monthlyLabels = [
    t("feedingStats.month.jan"), t("feedingStats.month.feb"),
    t("feedingStats.month.mar"), t("feedingStats.month.apr"),
    t("feedingStats.month.may"), t("feedingStats.month.jun"),
    t("feedingStats.month.jul"),
  ];

  const handleBack = () => {
    navigate("/device");
  };

  const isAtMax = useMemo(() => {
    const now = dayjs();
    if (activeTab === "Daily") return selectedDate.isSame(now, "day");
    if (activeTab === "Weekly") return selectedWeekStart.isSame(now.startOf("week"), "day");
    return selectedMonth.isSame(now.startOf("month"), "month");
  }, [activeTab, selectedDate, selectedWeekStart, selectedMonth]);

  const dateLabel = useMemo(() => {
    if (activeTab === "Daily") {
      if (selectedDate.isSame(dayjs(), "day")) return t("feedingStats.today");
      return selectedDate.format("MMM D, YYYY");
    }
    if (activeTab === "Weekly") {
      const end = selectedWeekStart.add(6, "day");
      return `${selectedWeekStart.format("MMM D")} - ${end.format("MMM D")}`;
    }
    return selectedMonth.format("MMM YYYY");
  }, [activeTab, selectedDate, selectedWeekStart, selectedMonth]);

  const handlePrev = () => {
    if (activeTab === "Daily") setSelectedDate((d) => d.subtract(1, "day"));
    else if (activeTab === "Weekly") setSelectedWeekStart((d) => d.subtract(1, "week"));
    else setSelectedMonth((d) => d.subtract(1, "month"));
  };

  const handleNext = () => {
    if (activeTab === "Daily") setSelectedDate((d) => d.add(1, "day"));
    else if (activeTab === "Weekly") setSelectedWeekStart((d) => d.add(1, "week"));
    else setSelectedMonth((d) => d.add(1, "month"));
  };

  const getChartOption = (): EChartsOption => {
    const convertData = (data: number[]) =>
      unit === "ml" ? data : data.map((value) => roundVolume(value / ML_PER_OZ));
    if (activeTab === "Daily") {
      return buildLineOption(DAILY_LABELS, convertData(DAILY_DATA), unit);
    }
    if (activeTab === "Weekly") {
      return buildLineOption(weeklyLabels, convertData(WEEKLY_DATA), unit);
    }
    return buildLineOption(monthlyLabels, convertData(MONTHLY_DATA), unit);
  };

  return (
    <IPhoneFrame background="linear-gradient(to bottom, #FFE29F 0%, #F8F7F5 40%)">
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
            {t("feedingStats.title")}
          </h1>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          <div className="flex gap-3">
            <StatCard label={t("feedingStats.today")} value={`${unit === "ml" ? TODAY_TOTAL : roundVolume(TODAY_TOTAL / ML_PER_OZ)}`} sub={t("feedingStats.mlTotal", { unit })} />
            <StatCard label={t("feedingStats.feedings")} value={`${TODAY_COUNT}`} sub={t("feedingStats.times")} />
            <StatCard label={t("feedingStats.average")} value={`${unit === "ml" ? AVG_PER_FEED : roundVolume(AVG_PER_FEED / ML_PER_OZ)}`} sub={t("feedingStats.mlPerFeed", { unit })} />
          </div>

          <div
            className="flex h-[40px] rounded-[20px] p-1"
            style={{ background: "#F0EFEE" }}
          >
            {TABS.map((tab) => (
              <motion.button
                key={tab}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                className="relative flex flex-1 items-center justify-center rounded-[16px] text-[13px] transition-all duration-200"
                style={
                  activeTab === tab
                    ? {
                        background: "white",
                        boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
                        color: "#221122",
                        fontWeight: 600,
                      }
                    : {
                        background: "transparent",
                        color: "#999497",
                        fontWeight: 400,
                      }
                }
                >
                {tabLabels[tab]}
              </motion.button>
            ))}
          </div>

          {/* Date Selector */}
          <div className="flex items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full"
              style={DATE_BTN_STYLE}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: "#999497" }} />
            </motion.button>
            <span
              className="min-w-[140px] text-center text-[13px] font-medium"
              style={{ color: "#221122" }}
            >
              {dateLabel}
            </span>
            <motion.button
              whileTap={isAtMax ? undefined : { scale: 0.9 }}
              onClick={isAtMax ? undefined : handleNext}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full"
              style={isAtMax ? { ...DATE_BTN_STYLE, opacity: 0.3 } : DATE_BTN_STYLE}
            >
              <ChevronRight className="h-4 w-4" style={{ color: "#999497" }} />
            </motion.button>
          </div>

          <div
            className="rounded-[18px] bg-white p-4"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            <p
              className="mb-2 text-[15px] font-semibold"
              style={{ color: "#221122" }}
            >
              {activeTab === "Daily" && t("feedingStats.chart.dailyTitle")}
              {activeTab === "Weekly" && t("feedingStats.chart.weeklyTitle")}
              {activeTab === "Monthly" && t("feedingStats.chart.monthlyTitle")}
            </p>
            <ReactECharts
              option={getChartOption()}
              theme="ud"
              className="h-[260px]"
              opts={{ renderer: "svg" }}
            />
          </div>

          {/* Feeding Guide Entry */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/feeding-stats/guide")}
            className="flex items-center justify-between rounded-[18px] bg-white p-4"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full"
                style={{ background: "hsl(24, 67%, 32%, 0.1)" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#8B4A1B" }} />
              </div>
              <div>
                <p className="text-[15px] font-semibold" style={{ color: "#221122" }}>
                  {t("feedingStats.guideTitle")}
                </p>
                <p className="text-[12px]" style={{ color: "#999497" }}>
                  {t("feedingStats.guideDesc")}
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-5 w-5" style={{ color: "#999497" }} />
          </motion.div>

          {/* Feeding Records */}
          <div
            className="rounded-[20px] bg-white p-4"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[15px] font-semibold" style={{ color: "#221122" }}>
                {t("feedingStats.recordsTitle")}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddSheet(true)}
                className="flex items-center gap-1 rounded-[14px] px-3 py-1.5 text-[13px] font-medium text-white"
                style={{ background: "#8B4A1B" }}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("feedingStats.add")}
              </motion.button>
            </div>
            <div>
              {MOCK_RECORDS.map((record, index) => (
                <div
                  key={record.id}
                  className={`flex items-center gap-3 py-3 ${
                    index < MOCK_RECORDS.length - 1 ? "border-b border-[#F5F5F5]" : ""
                  }`}
                >
                  <div
                    className="flex items-center justify-center rounded-[10px] px-2.5 py-1 text-[12px] font-medium text-white"
                    style={{
                      background: record.type === "奶粉" ? "#96692E" : record.type === "亲喂" ? "#8B4A1B" : "#5DB97E",
                      minWidth: 42,
                    }}
                    >
                    {feedTypeLabels[record.type] || record.type}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium" style={{ color: "#221122" }}>
                      {record.type === "亲喂"
                        ? t("feedingStats.minutes", { count: record.durationMinutes })
                        : formatVolumeFromMl(record.amount || 0, unit)}
                    </div>
                    <div className="mt-0.5 text-[12px]" style={{ color: "#999497" }}>
                      {record.time}
                    </div>
                  </div>
                  <span className="text-[13px]" style={{ color: "#666" }}>
                    {feederLabels[record.feeder] || record.feeder}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sheet - Add Feeding Record */}
        <AnimatePresence>
          {showAddSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-30"
                style={{ background: "rgba(0,0,0,0.3)" }}
                onClick={() => setShowAddSheet(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-40 flex max-h-[88%] flex-col rounded-t-[24px]"
                style={{ background: "linear-gradient(to bottom, hsl(39, 50%, 95%), hsl(39, 30%, 97%))" }}
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <h2 className="text-[18px] font-semibold" style={{ color: "#221122" }}>
                    {t("feedingStats.addRecord")}
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddSheet(false)}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white"
                    style={{ boxShadow: "0px 2px 6px rgba(0,0,0,0.06)" }}
                  >
                    <Plus className="h-4 w-4 rotate-45" style={{ color: "#221122" }} />
                  </motion.button>
                </div>
                <FeedingRecordForm onClose={() => setShowAddSheet(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </IPhoneFrame>
  );
};

export default FeedingStats;
