export interface SecondCategory {
    id: string;
    name: string;
    slug: string;
    bannerImage: string;
    status: boolean;
    mainCategoryId: string;
    firstCategoryId: string;
    position?: number;
}

export interface FirstCategory {
    id: string;
    name: string;
    slug: string;
    bannerImage: string;
    status: boolean;
    mainCategoryId: string;
    secondCategories: SecondCategory[];
    position?: number;
}

export interface MainCategory {
    id: string;
    name: string;
    slug: string;
    image: string;
    bannerImage: string;
    status: boolean;
    firstCategories: FirstCategory[];
    position?: number;
}

export interface NestedCategory {
    mainCategories: MainCategory[];
}