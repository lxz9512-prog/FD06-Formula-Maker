import React from "react";
import { useTranslation } from "@client/src/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import FeedingRecordForm from "@client/src/pages/AddFeedingRecord/FeedingRecordForm";

const AddFeedingRecord: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <IPhoneFrame background="linear-gradient(to bottom, hsl(39, 50%, 95%), hsl(39, 30%, 97%))">
      <div className="flex h-full flex-col">
        <div className="flex items-center px-5 pt-6 pb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/feeding-stats")}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white"
            style={{ boxShadow: "0px 2px 6px rgba(0,0,0,0.06)" }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: "#221122" }} />
          </motion.button>
          <h1 className="ml-3 text-[18px] font-semibold" style={{ color: "#221122" }}>
            {t("addFeedingRecord.title")}
          </h1>
        </div>
        <FeedingRecordForm onClose={() => navigate("/feeding-stats")} />
      </div>
    </IPhoneFrame>
  );
};

export default AddFeedingRecord;
