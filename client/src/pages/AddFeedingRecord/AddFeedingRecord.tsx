import { PageBackIcon } from '@/components/PageNavigation';
import React from "react";
import { useTranslation } from "@client/src/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import IPhoneFrame from "@client/src/components/IPhoneFrame";
import FeedingRecordForm from "@client/src/pages/AddFeedingRecord/FeedingRecordForm";

const AddFeedingRecord: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <IPhoneFrame background="linear-gradient(to bottom, hsl(39, 50%, 95%), hsl(39, 30%, 97%))">
      <div className="flex h-full flex-col">
        <div className="fd06-page-nav">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/feeding-stats")}
            className="fd06-page-back"
             aria-label={t('common.back')}
          >
            <PageBackIcon />
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
