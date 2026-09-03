'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
  FiX,
  FiPhoneCall,
  FiZap,
  FiChevronDown,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiShoppingBag,
  FiArrowRight
} from 'react-icons/fi';

import { MainCategory } from '../../../../interface/nested-category.interface';
import { headerFooterAtom, megaDiscountAtom } from '../../../../store/global-store';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mainCategories: MainCategory[];
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  mainCategories,
}) => {
  const router = useRouter();
  const [headerFooterData] = useAtom(headerFooterAtom);
  const [megaDiscount] = useAtom(megaDiscountAtom);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme === 'dark') {
      setTheme('dark');
    }
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Soft Dimmed Backdrop Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Close navigation drawer backdrop"
      />

      {/* Slide-out Drawer Panel: Clean White / Dark Slate Aesthetic */}
      <aside
        className={`absolute top-0 bottom-0 left-0 w-[85vw] max-w-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out border-r border-gray-200 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 group">
            {headerFooterData?.headerLogo ? (
              <Image
                src={headerFooterData.headerLogo}
                alt="Brand Logo"
                className="w-32 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
                width={150}
                height={38}
                priority
              />
            ) : (
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                Fashion Time
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <FiMoon className="text-base" />
              ) : (
                <FiSun className="text-base text-amber-400" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close menu"
              aria-label="Close navigation drawer"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
          {/* Clean "All Products" Link */}
          <Link
            href="/shop"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#218DAE]/10 dark:bg-[#218DAE]/20 border border-[#218DAE]/30 dark:border-[#218DAE]/40 hover:bg-[#218DAE]/20 dark:hover:bg-[#218DAE]/30 text-[#218DAE] dark:text-[#218DAE] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FiShoppingBag className="text-[#218DAE] dark:text-[#218DAE] text-lg" />
              <span className="text-sm font-semibold tracking-wide">All Products</span>
            </div>
            <FiChevronRight className="text-[#218DAE] dark:text-[#218DAE] text-base group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Promotional Mega Discount Banner (if active) */}
          {megaDiscount?.isActive && (
            <Link
              href="/shop?discountOnly=true&pageNumber=1"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-sm active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-950 leading-tight">
                    {megaDiscount.menuText || 'Special Sale'}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-900">
                    Up to {megaDiscount.discountPercentage}% OFF
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-black text-white px-2.5 py-1 rounded-lg flex items-center gap-0.5">
                Shop <FiChevronRight className="text-xs" />
              </span>
            </Link>
          )}

          {/* Clean Minimalist Category Section */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                Categories
              </span>
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                {mainCategories.length} items
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {[...mainCategories]
                .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999))
                .map((main, idx) => {
                const firstCategories = [...(main.firstCategories || [])].sort(
                  (a, b) => (a.position ?? 9999) - (b.position ?? 9999)
                );
                const catKey = main.id || `main-${idx}`;
                const isExpanded = !!expandedCategories[catKey];
                const hasChildren = firstCategories.length > 0;

                return (
                  <div key={catKey} className="py-1">
                    {/* Category Header Row */}
                    <div
                      onClick={() => {
                        if (hasChildren) {
                          toggleCategory(catKey);
                        } else {
                          onClose();
                          router.push(`/shop?mainCategoryId=${main.id}&pageNumber=1`);
                        }
                      }}
                      className="flex items-center justify-between py-2.5 px-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 active:bg-gray-100 dark:active:bg-slate-800 transition-colors group"
                    >
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#218DAE] dark:group-hover:text-[#218DAE] transition-colors uppercase tracking-wide">
                        {main.name}
                      </span>

                      <div className="flex items-center gap-2">
                        {hasChildren && (
                          <span className="text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            {firstCategories.length}
                          </span>
                        )}
                        {hasChildren ? (
                          <FiChevronDown
                            className={`text-gray-400 text-sm transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#218DAE] dark:text-[#218DAE]' : ''
                            }`}
                          />
                        ) : (
                          <FiChevronRight className="text-gray-400 text-sm" />
                        )}
                      </div>
                    </div>

                    {/* Subcategories Clean Accordion List */}
                    {hasChildren && isExpanded && (
                      <div className="ml-3 pl-3 border-l-2 border-[#218DAE]/40 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                        {/* Explore All Category Link */}
                        <Link
                          href={`/shop?mainCategoryId=${main.id}&pageNumber=1`}
                          onClick={onClose}
                          className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-bold text-[#218DAE] dark:text-[#218DAE] hover:bg-[#218DAE]/10 dark:hover:bg-[#218DAE]/20 transition-colors"
                        >
                          <span>Explore All in {main.name}</span>
                          <FiChevronRight className="text-xs" />
                        </Link>

                        {/* First-Level Subcategories */}
                        {firstCategories.map((first, fIdx) => (
                          <Link
                            key={first.id || fIdx}
                            href={`/shop?firstCategoryId=${first.id}&pageNumber=1`}
                            onClick={onClose}
                            className="block py-2 px-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {first.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Bottom Helpline Footer */}
        {headerFooterData?.contactPhone && (
          <div className="p-3.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/50 flex-shrink-0">
            <a
              href={`tel:${headerFooterData.contactPhone}`}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#218DAE] dark:hover:text-[#218DAE] transition-colors"
            >
              <FiPhoneCall className="text-[#218DAE] dark:text-[#218DAE] text-sm" />
              <span>Helpline: <strong className="font-semibold">{headerFooterData.contactPhone}</strong></span>
            </a>
          </div>
        )}
      </aside>
    </div>
  );
};

export default MobileNavDrawer;
