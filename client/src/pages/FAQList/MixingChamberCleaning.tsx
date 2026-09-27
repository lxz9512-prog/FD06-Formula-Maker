import { PageBackIcon } from '@/components/PageNavigation';
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Droplets, PackageOpen, Wind, CheckCircle2, Play } from 'lucide-react';
import IPhoneFrame from '@client/src/components/IPhoneFrame';
import { useTranslation } from '@client/src/hooks/useTranslation';

// Demo copy only. Replace with approved product instructions and media before release.
const MixingChamberCleaning: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const zh = language === 'zh';
  const steps = [
    {
      title: zh ? '停止工作，取下混合仓' : 'Stop dispensing and remove the chamber',
      description: zh ? '确认设备已停止调奶或出水，按产品说明书完成关机及清洁前准备。待部件冷却后，按说明取下混合仓及可拆卸上盖，请勿强行拆卸。' : 'Ensure dispensing has stopped. Follow the product manual for shutdown and cleaning preparation. Once the parts have cooled, remove the chamber and detachable lid as instructed; do not force them.',
      icon: PackageOpen,
      caption: zh ? '示意：取下混合仓与上盖' : 'Illustration: chamber and lid removal',
    },
    {
      title: zh ? '清除残留，清洗可水洗部件' : 'Remove residue and wash washable parts',
      description: zh ? '倒出残留液体，按照说明书规定的方法清洗可水洗部件，重点检查仓内、上盖及出奶口的奶粉残留。清洁剂、水温和工具以说明书要求为准，不要将机身浸入水中。' : 'Empty any remaining liquid and clean washable parts as directed in the manual. Check the chamber, lid and outlet for formula residue. Use only the specified cleaning products, water temperature and tools. Do not immerse the main unit.',
      icon: Droplets,
      caption: zh ? '示意：清理仓内及出奶口残留' : 'Illustration: removing chamber and outlet residue',
    },
    {
      title: zh ? '冲净并充分晾干' : 'Rinse and dry thoroughly',
      description: zh ? '按说明书要求冲洗干净，确认没有可见奶粉或清洁剂残留。将部件放在清洁通风处充分晾干；是否支持消毒、洗碗机或高温处理，请以产品说明书为准。' : 'Rinse as instructed and check that no visible formula or cleaning product remains. Let the parts dry thoroughly in a clean, ventilated place. Consult the manual before sterilizing or using a dishwasher or high-temperature treatment.',
      icon: Wind,
      caption: zh ? '示意：部件充分晾干后再安装' : 'Illustration: dry parts before reassembly',
    },
    {
      title: zh ? '装回并确认清洁完成' : 'Reassemble and confirm cleaning',
      description: zh ? '按说明书将混合仓及上盖安装到位，确认部件牢固、没有遗漏。完成清洁后检查设备提示和混合仓使用次数；若提醒未解除或次数未更新，请查看说明书或联系设备助手获取帮助。' : 'Reassemble the chamber and lid according to the manual and check that all parts are secure. Check the device prompt and chamber use count after cleaning. If the reminder remains or the count does not update, consult the manual or seek help through the device assistant.',
      icon: CheckCircle2,
      caption: zh ? '示意：检查安装与设备状态' : 'Illustration: check assembly and device status',
    },
  ];

  return (
    <IPhoneFrame background="#F7F7F7">
      <div className="relative flex h-full flex-col">
        <div className="fd06-page-nav">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/faq')} aria-label={zh ? '返回常见问题' : 'Back to FAQ'} className="fd06-page-back" >
            <PageBackIcon />
          </motion.button>
          <h1 className="text-center text-[16px] font-semibold text-[#1A1A1A]">{t('faqList.mixingChamberCleaning')}</h1>
          <div className="h-8 w-8 shrink-0" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <p className="mb-4 rounded-[10px] bg-[#FFF5EE] p-3 text-[12px] leading-relaxed text-[#8B4A1B]">
            {zh ? '示例教程：以下文案与示意仅用于原型展示，非正式清洗指引。实际拆装、清洁及消毒方式请以产品说明书为准。' : 'Sample tutorial: this copy and the illustrations are prototype content, not official cleaning instructions. Follow the product manual for disassembly, cleaning and sterilization.'}
          </p>
          {steps.map((step, index) => (
            <section key={index} className="mb-5 overflow-hidden rounded-[10px] bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B4A1B] text-[12px] font-semibold text-white">{index + 1}</span>
                <h2 className="text-[15px] font-medium text-[#1A1A1A]">{step.title}</h2>
              </div>
              <p className="mb-3 text-[13px] leading-relaxed text-[#666666]">{step.description}</p>
              <div className="flex h-28 items-center justify-center rounded-lg bg-[#FAF5EF]" aria-hidden="true">
                <step.icon className="h-12 w-12 text-[#B18A68]" strokeWidth={1.2} />
              </div>
              <p className="mt-2 text-center text-[11px] text-[#999999]">{step.caption}</p>
              {index === 1 && (
                <div className="mt-3 flex aspect-video flex-col items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] text-white/60">
                  <Play className="h-8 w-8" aria-hidden="true" />
                  <span className="text-[11px]">{zh ? '清洗视频示例占位 · 暂未提供视频' : 'Cleaning video placeholder · video not available'}</span>
                </div>
              )}
            </section>
          ))}
        </div>
        <div className="shrink-0 border-t border-[#EEEEEE] bg-white px-4 py-3">
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/device-assistant')} className="flex h-[52px] w-full items-center justify-center rounded-[26px] bg-[#8B4A1B] text-[14px] font-medium text-white">
            {zh ? '需要帮助？前往设备助手' : 'Need help? Go to Device Assistant'}
          </motion.button>
        </div>
      </div>
    </IPhoneFrame>
  );
};

export default MixingChamberCleaning;
