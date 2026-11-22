'use client';

import React from 'react';
import { 
  FiCheckCircle, 
  FiPackage, 
  FiTruck, 
  FiHome 
} from 'react-icons/fi';

interface ProductDeliveryProcessProps {
  contentData?: {
    isDeliveryProcessVisible?: boolean;
    deliveryProcessBadge?: string;
    deliveryProcessTitle?: string;
    deliveryProcessDescription?: string;
    deliveryStepOneTitle?: string;
    deliveryStepOneHighlight?: string;
    deliveryStepOneDescription?: string;
    deliveryStepTwoTitle?: string;
    deliveryStepTwoHighlight?: string;
    deliveryStepTwoDescription?: string;
    deliveryStepThreeTitle?: string;
    deliveryStepThreeHighlight?: string;
    deliveryStepThreeDescription?: string;
    deliveryStepFourTitle?: string;
    deliveryStepFourHighlight?: string;
    deliveryStepFourDescription?: string;
  };
}

const ProductDeliveryProcess: React.FC<ProductDeliveryProcessProps> = ({ contentData }) => {
  // If explicitly disabled from CMS, hide the section
  if (contentData?.isDeliveryProcessVisible === false) {
    return null;
  }

  const badge = contentData?.deliveryProcessBadge || "Seamless Fulfillment Journey";
  const title = contentData?.deliveryProcessTitle || "How Your Order Reaches Your Doorstep";

  const steps = [
    {
      step: '01',
      title: contentData?.deliveryStepOneTitle || 'Order & Verification',
      highlight: contentData?.deliveryStepOneHighlight || 'Instant Confirmation',
      description: contentData?.deliveryStepOneDescription || 'Instant order confirmation with real-time digital invoice & tracking ID generated.',
      icon: FiCheckCircle,
    },
    {
      step: '02',
      title: contentData?.deliveryStepTwoTitle || 'Quality Check & Packing',
      highlight: contentData?.deliveryStepTwoHighlight || '100% Inspected',
      description: contentData?.deliveryStepTwoDescription || 'Rigorous 3-tier fabric & seam inspection, hygienic steam press, and eco-friendly packaging.',
      icon: FiPackage,
    },
    {
      step: '03',
      title: contentData?.deliveryStepThreeTitle || 'Express Dispatch & Transit',
      highlight: contentData?.deliveryStepThreeHighlight || '24-48h Fast Dispatch',
      description: contentData?.deliveryStepThreeDescription || 'Dispatched through trusted premier courier networks with live SMS updates and route tracking.',
      icon: FiTruck,
    },
    {
      step: '04',
      title: contentData?.deliveryStepFourTitle || 'Doorstep Delivery & Trial',
      highlight: contentData?.deliveryStepFourHighlight || '7-Day Easy Returns',
      description: contentData?.deliveryStepFourDescription || 'Safe contactless or COD handover at your doorstep with 7 days hassle-free exchange & returns.',
      icon: FiHome,
    },
  ];

  return (
    <section className="px-4 sm:px-6 my-10 sm:my-14" aria-label="Product Delivery Process">
      <div className="max-w-screen-2xl mx-auto">
        {/* Main Container Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 md:p-10 lg:p-12 transition-colors duration-300">
          
          {/* Subtle Ambient Background Accent */}
          <div 
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#218DAE]/5 dark:bg-[#218DAE]/10 blur-3xl pointer-events-none" 
            aria-hidden="true" 
          />
          <div 
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#1D7693]/5 dark:bg-[#1D7693]/10 blur-3xl pointer-events-none" 
            aria-hidden="true" 
          />

          {/* Section Header */}
          <div className="relative text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#218DAE]/10 text-[#218DAE] dark:bg-[#218DAE]/20 dark:text-[#3FA5C7] mb-3">
              {badge}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>

          {/* 4-Step Process Timeline */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {/* Desktop Connecting Line behind steps */}
            <div 
              className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-slate-800 -z-0" 
              aria-hidden="true"
            />

            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step} 
                  className="relative z-10 flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 transition-colors duration-300"
                >
                  {/* Step Number & Icon Circle */}
                  <div className="relative mb-5 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#218DAE] shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#218DAE] text-white shadow-xs">
                      {item.step}
                    </span>
                  </div>

                  {/* Highlight pill */}
                  <span className="text-[11px] font-medium tracking-wide text-[#1D7693] dark:text-[#3FA5C7] bg-[#218DAE]/10 dark:bg-[#218DAE]/20 px-2.5 py-0.5 rounded-md mb-2">
                    {item.highlight}
                  </span>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductDeliveryProcess;
