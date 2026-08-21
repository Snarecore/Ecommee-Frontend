import Link from "next/link";;
import Marquee from 'react-fast-marquee';
import { headerFooterAtom } from "../../../../store/global-store";
import { useAtom } from "jotai";

const Header = () => {
    const [headerFooterData] = useAtom(headerFooterAtom);

    return (
        <header className="py-2 w-full">
            <div className="max-w-screen-2xl mx-auto px-4">
                <div className="flex items-center justify-between gap-4 sm:gap-0">
                    <div className="hidden sm:block text-center flex-1">
                        <Marquee
                            speed={100}
                            gradient={false}
                            pauseOnHover={true}
                            className="text-sm md:text-base font-medium"
                        >
                            <p className="flex text-[var(--color-green-primary)] gap-x-8">
                                {headerFooterData?.bannerText}
                            </p>
                        </Marquee>
                    </div>

                    <div className="hidden sm:flex sm:flex-row pl-4 items-center justify-center md:justify-end gap-6 text-sm w-auto">
                        <Link
                            href="/login" 
                            className="transition-all duration-300 text-[var(--color-green-primary)] hover:text-[var(--color-green-primary)]/80 hover:underline"
                        >
                            Sign In / Register
                        </Link>

                        <p
                            className="cursor-pointer transition-all duration-300 text-[var(--color-green-primary)] hover:text-[var(--color-green-primary)]/80 flex items-center gap-2"
                            onClick={() => window.location.href = 'tel:+8801810172434'}
                        >
                            <span className="font-medium">Helpline:</span> {headerFooterData?.contactPhone}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
