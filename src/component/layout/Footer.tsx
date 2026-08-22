import Image from "next/image";
import visaCard from "../../assets/visaCard.svg";
import mastardCard from "../../assets/masterCard.svg";
import americanCard from "../../assets/dls-logo-bluebox-solid.svg";
import playStore from "../../assets/google-playStore.svg";
import appleStore from "../../assets/apple-playStore.svg";
import discoveLog from "../../assets/discover-logo.png";
import paypal from "../../assets/paypal-svgrepo-com.svg";
import { useAtom } from "jotai";
import { headerFooterAtom, socialLinksAtom } from "../../store/global-store";
import Link from "next/link";;

type Social = {
    icon: string;
    link: string;
}

const Footer = () => {
    const [headerFooterData] = useAtom(headerFooterAtom);
    const [socialLinksData] = useAtom(socialLinksAtom);
    
    const footerSectionTwo = Array.isArray(headerFooterData?.footerSectionTwo)
                                ? headerFooterData.footerSectionTwo
                                : headerFooterData?.footerSectionTwo
                                ? JSON.parse(headerFooterData.footerSectionTwo)
                                : [];

    const footerSectionThree = Array.isArray(headerFooterData?.footerSectionThree)
                                ? headerFooterData.footerSectionThree
                                : headerFooterData?.footerSectionThree
                                ? JSON.parse(headerFooterData.footerSectionThree)
                                : [];

    return (
        <div className="bg-[var(--color-green-secondary)] py-12 mt-8 text-black">
            <footer className="max-w-screen-2xl mx-auto px-4">
                <div className="flex flex-wrap lg:flex-nowrap gap-10 lg:gap-20">
                    <div className="w-full lg:w-1/4">
                        <div className="flex items-center mb-6">
                            <Image src={headerFooterData?.footerLogo || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt="BazarBound" className="w-64 object-contain" width={256} height={64} />
                        </div>
                        <p className="mb-6 leading-relaxed text-justify">
                            {headerFooterData?.footerDescription}
                        </p>
                        <div className="flex gap-5">
                            {
                                Array.isArray(socialLinksData) && socialLinksData?.map((social: Social) => (
                                    <Link key={social.link} href={social.link} target="_blank">
                                        <Image src={social.icon || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"} alt={social.link} width={30} height={500} />
                                    </Link>
                                ))
                            }
                        </div>
                    </div>

                    <div className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-4">
                        <div>
                            <p className="font-bold text-lg mb-6">{headerFooterData?.footerSectionTwoTitle}</p>
                            <ul className="flex flex-col gap-3">
                                {
                                    footerSectionTwo.map((sec: any, idx: number) => (
                                        <li key={sec.link || idx}>
                                            <Link href={`${sec.link}`} className="hover:underline text-sm">
                                                {sec.value}
                                            </Link>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>

                        <div>
                            <h6 className="font-bold text-lg mb-6">{headerFooterData?.footerSectionThreeTitle}</h6>
                            <ul className="flex flex-col gap-3">
                                {
                                    footerSectionThree?.map((sec :any, idx: number) => (
                                        <li key={sec.link || idx}>
                                            <Link href={`${sec.link}`} className="hover:underline text-sm">
                                                {sec.value}
                                            </Link>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold text-lg mb-6">Contact Us</p>
                            <div className="flex flex-col gap-3">
                                <a href={`mailto:${headerFooterData?.contactEmail}`} target="_blank" rel="noopener noreferrer">
                                    Email: {headerFooterData?.contactEmail}
                                </a>
                                <p>Phone: {headerFooterData?.contactPhone}</p>
                                <p>Address: {headerFooterData?.contactAddress}</p>
                            </div>
                        </div>

                        <div className="flex flex-col flex-wrap lg:ml-10">
                            <p className="font-bold text-lg mb-6">Download it from</p>
                            <div className="flex flex-col gap-4">
                                <Image src={playStore} alt="Play Store" className="w-36" width={144} height={44} />
                                <Image src={appleStore} alt="App Store" className="w-36" width={144} height={44} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[var(--color-green-primary)] mt-12 pt-8 flex sm:flex-row flex-col-reverse items-center justify-between">
                    <p className="text-sm text-center">
                        {headerFooterData?.copyrightText}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap lg:gap-6 mb-4 sm:mb-0">
                        <Image src={visaCard} alt="Visa" className="h-12" width={72} height={48} />
                        <Image src={mastardCard} alt="Mastercard" className="h-12" width={72} height={48} />
                        <Image src={americanCard} alt="American Express" className="" width={72} height={48} />
                        <Image src={discoveLog} alt="Discover" className="w-20" width={80} height={48} />
                        <Image src={paypal} alt="Paypal" className="h-12" width={72} height={48} />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
