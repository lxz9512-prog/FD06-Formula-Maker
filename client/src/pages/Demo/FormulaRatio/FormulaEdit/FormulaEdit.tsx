import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import IPhoneFrame from '@client/src/components/IPhoneFrame';
import { useTranslation } from '@client/src/hooks/useTranslation';
import {
  FormulaProfileData,
  readFormulaProfiles,
  readSelectedFormulaId,
  updateFormulaProfile,
} from '../formulaProfiles';

type FormulaData = FormulaProfileData;
type FormulaEditMode = 'recognition' | 'manual' | 'edit';

const RECOGNIZED_FORMULA: FormulaData = {
  brand: 'Kabrita',
  productLine: 'Pro-Total Comfort',
  ageRange: '12+ months',
  powderPerScoop: 8.8,
  waterPerScoop: 2,
};

const MANUAL_FORMULA: FormulaData = {
  brand: '',
  productLine: '',
  ageRange: '',
  powderPerScoop: 8.8,
  waterPerScoop: 2,
};

const getInitialData = (
  mode: FormulaEditMode,
  formulaId: string | null,
): FormulaData => {
  if (mode === 'edit' && formulaId) {
    const profile = readFormulaProfiles().find((item) => item.id === formulaId);
    if (profile) {
      return {
        brand: profile.brand,
        productLine: profile.productLine,
        ageRange: profile.ageRange,
        powderPerScoop: profile.powderPerScoop,
        waterPerScoop: profile.waterPerScoop,
      };
    }
  }

  return mode === 'manual' ? { ...MANUAL_FORMULA } : { ...RECOGNIZED_FORMULA };
};

const FormulaEdit: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const isFirstUse = searchParams.get('source') === 'first-use';
  const isListEdit = searchParams.get('source') === 'list';
  const requestedMode = searchParams.get('mode');
  const mode: FormulaEditMode =
    requestedMode === 'recognition' ||
    requestedMode === 'manual' ||
    requestedMode === 'edit'
      ? requestedMode
      : isListEdit
        ? 'edit'
        : isFirstUse
          ? 'manual'
          : 'recognition';
  const requestedFormulaId = searchParams.get('id');
  const formulaId =
    mode === 'edit' ? requestedFormulaId || readSelectedFormulaId() : null;
  const [data, setData] = useState<FormulaData>(() =>
    getInitialData(mode, formulaId),
  );
  const copyByMode = {
    recognition: {
      title: 'demo.formulaEdit.title',
      heading: 'demo.formulaEdit.analyzedTitle',
      description: 'demo.formulaEdit.analyzedDescription',
      action: 'demo.formulaEdit.confirmRecognition',
    },
    manual: {
      title: 'demo.formulaEdit.addTitle',
      heading: 'demo.formulaEdit.addHeading',
      description: 'demo.formulaEdit.addDescription',
      action: 'demo.formulaEdit.confirmManual',
    },
    edit: {
      title: 'demo.formulaEdit.editTitle',
      heading: 'demo.formulaEdit.editHeading',
      description: 'demo.formulaEdit.editDescription',
      action: 'demo.formulaEdit.saveChanges',
    },
  } as const;
  const copy = copyByMode[mode];

  useEffect(() => {
    setData(getInitialData(mode, formulaId));
  }, [mode, formulaId]);

  const canSave =
    data.brand.trim().length > 0 &&
    data.powderPerScoop > 0 &&
    data.waterPerScoop > 0;

  const handleBack = () => {
    navigate(
      isFirstUse
        ? '/device'
        : mode === 'edit'
          ? '/formula-ratio'
          : mode === 'manual'
            ? '/scan-formula'
            : '/capture-formula-step2',
    );
  };

  const handleDone = () => {
    if (!canSave) return;

    const profile = { ...data, brand: data.brand.trim() };
    if (mode === 'edit' && formulaId) {
      updateFormulaProfile(formulaId, profile);
      navigate('/formula-ratio');
      return;
    }

    localStorage.setItem('formula_profile', JSON.stringify(profile));
    localStorage.setItem('formula_profile_configured', 'true');
    window.dispatchEvent(new Event('formulaProfileUpdated'));
    navigate(isFirstUse ? '/device' : '/formula-ratio');
  };

  const adjustPowder = (delta: number) => {
    setData((prev) => ({
      ...prev,
      powderPerScoop: Math.max(
        0.1,
        Number((prev.powderPerScoop + delta).toFixed(1)),
      ),
    }));
  };

  const adjustWater = (delta: number) => {
    setData((prev) => ({
      ...prev,
      waterPerScoop: Math.min(
        10,
        Math.max(2, Number((prev.waterPerScoop + delta).toFixed(1))),
      ),
    }));
  };

  return (
    <IPhoneFrame background="radial-gradient(ellipse 140% 58% at 50% 0%, #FDE397 0%, #FDE397 30%, transparent 70%), #F7F7F7">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center px-5 pt-6 pb-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: 'hsl(39, 40%, 96%)',
              boxShadow:
                '4px 4px 8px hsl(39 20% 85%), -4px -4px 8px hsl(0 0% 100%)',
            }}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: '#221122' }} />
          </motion.button>
          <div className="flex-1 text-center">
            <span
              className="text-[17px] font-semibold"
              style={{ color: '#221122' }}
            >
              {t(copy.title)}
            </span>
          </div>
          <div className="h-10 w-10" />
        </div>

        {/* Content Card */}
        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
          <div
            className="rounded-[32px] p-6"
            style={{
              background: 'white',
              boxShadow:
                '8px 8px 20px hsl(39 20% 85%), -8px -8px 20px hsl(0 0% 100%)',
            }}
          >
            {/* Header Text */}
            <h2
              className="mb-1 text-[20px] font-semibold"
              style={{ color: '#221122' }}
            >
              {t(copy.heading)}
            </h2>
            <p
              className="mb-6 text-[14px] leading-relaxed"
              style={{ color: 'hsl(300, 3%, 55%)' }}
            >
              {t(copy.description)}
            </p>

            {/* Brand Field */}
            <div className="mb-5">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#221122' }}
              >
                {t('demo.formulaEdit.brand')}{' '}
                <span style={{ color: 'hsl(0, 60%, 50%)' }}>*</span>
              </label>
              <input
                className="flex h-[46px] w-full items-center rounded-[16px] px-4 text-[15px] outline-none"
                style={{
                  background: 'hsl(39, 40%, 96%)',
                  color: '#221122',
                }}
                value={data.brand}
                placeholder={t('demo.formulaEdit.brandPlaceholder')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>

            {/* Product Line Field */}
            <div className="mb-5">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#221122' }}
              >
                {t('demo.formulaEdit.productLine')}
              </label>
              <input
                className="flex h-[46px] w-full items-center rounded-[16px] px-4 text-[15px] outline-none"
                style={{
                  background: 'hsl(39, 40%, 96%)',
                  color: '#221122',
                }}
                value={data.productLine}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData((prev) => ({ ...prev, productLine: e.target.value }))
                }
              />
            </div>

            {/* Age Range Field */}
            <div className="mb-5">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#221122' }}
              >
                {t('demo.formulaEdit.ageRange')}
              </label>
              <input
                className="flex h-[46px] w-full items-center rounded-[16px] px-4 text-[15px] outline-none"
                style={{
                  background: 'hsl(39, 40%, 96%)',
                  color: '#221122',
                }}
                value={data.ageRange}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData((prev) => ({ ...prev, ageRange: e.target.value }))
                }
              />
            </div>

            {/* Powder per Scoop - Stepper */}
            <div className="mb-5">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#221122' }}
              >
                {t('demo.formulaEdit.powderPerScoop')}{' '}
                <span style={{ color: 'hsl(0, 60%, 50%)' }}>*</span>
              </label>
              <div
                className="flex h-[46px] items-center justify-between rounded-[16px] px-1.5"
                style={{
                  background: 'hsl(39, 40%, 96%)',
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => adjustPowder(-0.1)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'white',
                    boxShadow:
                      '3px 3px 6px hsl(39 20% 85%), -3px -3px 6px hsl(0 0% 100%)',
                  }}
                >
                  <Minus className="h-3.5 w-3.5" style={{ color: '#221122' }} />
                </motion.button>
                <span
                  className="text-[15px] font-medium"
                  style={{ color: '#221122' }}
                >
                  {data.powderPerScoop} g
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => adjustPowder(0.1)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'white',
                    boxShadow:
                      '3px 3px 6px hsl(39 20% 85%), -3px -3px 6px hsl(0 0% 100%)',
                  }}
                >
                  <Plus className="h-3.5 w-3.5" style={{ color: '#221122' }} />
                </motion.button>
              </div>
            </div>

            {/* Water per Scoop - Stepper */}
            <div className="mb-5">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: '#221122' }}
              >
                {t('demo.formulaEdit.waterPerScoop')}{' '}
                <span style={{ color: 'hsl(0, 60%, 50%)' }}>*</span>
              </label>
              <div
                className="flex h-[46px] items-center justify-between rounded-[16px] px-1.5"
                style={{
                  background: 'hsl(39, 40%, 96%)',
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => adjustWater(-0.5)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'white',
                    boxShadow:
                      '3px 3px 6px hsl(39 20% 85%), -3px -3px 6px hsl(0 0% 100%)',
                  }}
                >
                  <Minus className="h-3.5 w-3.5" style={{ color: '#221122' }} />
                </motion.button>
                <span
                  className="text-[15px] font-medium"
                  style={{ color: '#221122' }}
                >
                  {data.waterPerScoop} oz
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => adjustWater(0.5)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{
                    background: 'white',
                    boxShadow:
                      '3px 3px 6px hsl(39 20% 85%), -3px -3px 6px hsl(0 0% 100%)',
                  }}
                >
                  <Plus className="h-3.5 w-3.5" style={{ color: '#221122' }} />
                </motion.button>
              </div>
            </div>

            {/* Mixing Ratio Summary */}
            <div className="pt-2">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: 'hsl(300, 3%, 55%)' }}
              >
                {t('demo.formulaEdit.mixingRatio')}
              </label>
              <p
                className="text-[14px] font-medium"
                style={{ color: '#221122' }}
              >
                {t('demo.formulaEdit.mixingRatioDetail', {
                  powder: data.powderPerScoop,
                  water: data.waterPerScoop,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Done Button - Fixed at bottom */}
        <div className="shrink-0 px-4 pb-6 pt-3">
          <motion.button
            whileTap={canSave ? { scale: 0.97 } : {}}
            type="button"
            disabled={!canSave}
            onClick={handleDone}
            className="flex h-[48px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white"
            style={{
              backgroundColor: canSave ? 'hsl(24, 67%, 32%)' : '#C8C3C0',
            }}
          >
            {t(copy.action)}
          </motion.button>
        </div>
      </div>
    </IPhoneFrame>
  );
};

export default FormulaEdit;
