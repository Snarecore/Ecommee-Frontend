import Link from "next/link";
import Marquee from 'react-fast-marquee';
import { headerFooterAtom } from "../../../../store/global-store";
import { useAtom } from "jotai";
import { FiPhoneCall, FiUser, FiZap } from "react-icons/fi";

const Header = () => {
    const [headerFooterData] = useAtom(headerFooterAtom);

    return (
        <header className="bg-[#fbf9f5] text-slate-700 border-b border-gray-200/80 text-xs py-2 w-full transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Marquee Banner */}
                    <div className="hidden sm:flex items-center gap-2 flex-1 overflow-hidden">
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                            <FiZap className="text-emerald-600 dark:text-emerald-400 animate-pulse" /> Offer
                        </span>
                        <Marquee
                            speed={65}
                            gradient={false}
                            pauseOnHover={true}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                            <span className="text-emerald-800 dark:text-emerald-300 font-semibold px-4">
                                {headerFooterData?.bannerText || "Welcome to Bazaarbound - Special Discounts Available Today!"}
                            </span>
                        </Marquee>
                    </div>

                    {/* Quick Access Links */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto text-xs font-medium">
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-200 py-0.5 group"
                        >
                            <FiUser className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                            <span>Sign In / Register</span>
                        </Link>

                        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

                        {headerFooterData?.contactPhone && (
                            <a
                                href={`tel:${headerFooterData.contactPhone}`}
                                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-200 py-0.5 group"
                            >
                                <FiPhoneCall className="text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-200" />
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
