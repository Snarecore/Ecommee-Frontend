export interface HeaderFooter {
    bannerText: string;
    headerLogo: string;
    helpline: string;
    footerLogo: string;
    footerDescription: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    copyrightText: string;
    footerSectionTwoTitle: string;
    footerSectionTwo: Array<{
        link: string;
        value: string;
    }>;
    footerSectionThreeTitle: string;
    footerSectionThree: Array<{
        link: string;
        value: string;
    }>;
}