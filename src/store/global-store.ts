import { atom } from "jotai";
import { MainCategory } from "../interface/main-category.interface";
import { NestedCategory } from "../interface/nested-category.interface";
import { Faq } from "../interface/faq.interface";
import { HeaderFooter } from "../interface/header-footer.interface";
import { SocialLinks } from "../interface/social-links.inteface";
import { MetaData } from "../interface/meta.interface";

export interface MegaDiscount {
    isActive: boolean;
    discountPercentage: number;
    menuText: string;
}

export const isLoadingAtom = atom<boolean>(false);
export const mainCategoriesAtom = atom<MainCategory[]>([]);
export const nestedCategoriesAtom = atom<NestedCategory[]>([]);
export const faqAtom = atom<Faq[]>([]);
export const headerFooterAtom = atom<HeaderFooter>();
export const socialLinksAtom = atom<SocialLinks>();
export const metaDataAtom = atom<MetaData[]>([]);
export const megaDiscountAtom = atom<MegaDiscount | undefined>(undefined);