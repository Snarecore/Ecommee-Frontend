import Link from "next/link";
import Marquee from 'react-fast-marquee';
import { headerFooterAtom } from "../../../../store/global-store";
import { useAtom } from "jotai";
import { FiPhoneCall, FiUser, FiZap } from "react-icons/fi";

const Header = () => {
    const [headerFooterData] = useAtom(headerFooterAtom);

    return (
        <header className="hidden sm:block bg-[#FBF9F5] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-gray-200/80 dark:border-gray-800 text-xs py-2 w-full transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Marquee Banner */}
                    <div className="hidden sm:flex items-center gap-2 flex-1 overflow-hidden">
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-[#218DAE]/10 dark:bg-[#218DAE]/20 text-[#218DAE] dark:text-[#218DAE] px-2 py-0.5 rounded-full border border-[#218DAE]/30 flex-shrink-0">
                            <FiZap className="text-[#218DAE] animate-pulse" /> Offer
                        </span>
                        <Marquee
                            speed={65}
                            gradient={false}
                            pauseOnHover={true}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                            <span className="text-[#218DAE] dark:text-[#218DAE] font-semibold px-4">
                                {headerFooterData?.bannerText || "Welcome to Fashion Time - Special Discounts Available Today!"}
                            </span>
                        </Marquee>
                    </div>

                    {/* Quick Access Links */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto text-xs font-medium">
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#218DAE] dark:hover:text-[#218DAE] transition-colors duration-200 py-0.5 group"
                        >
                            <FiUser className="text-[#218DAE] group-hover:scale-110 transition-transform duration-200" />
                            <span>Sign In / Register</span>
                        </Link>

                        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

                        {headerFooterData?.contactPhone && (
                            <a
                                href={`tel:${headerFooterData.contactPhone}`}
                                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#218DAE] dark:hover:text-[#218DAE] transition-colors duration-200 py-0.5 group"
                            >
                                <FiPhoneCall className="text-[#218DAE] group-hover:rotate-12 transition-transform duration-200" />
                                <span><strong className="font-semibold text-slate-800 dark:text-slate-400">Helpline:</strong> {headerFooterData?.contactPhone}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
