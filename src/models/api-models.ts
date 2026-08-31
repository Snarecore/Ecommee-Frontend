export interface ApiRequestProps {
    url: string;
    token?: string;
}

export interface GetDataProps extends ApiRequestProps {
    noCache?: boolean; // true = no-store (user-specific), false/undefined = cacheable (public)
}

export interface PostDataProps extends ApiRequestProps {
    body: Record<string, unknown>;
}

export interface PatchDataProps extends PostDataProps { }

export interface DeleteDataProps extends ApiRequestProps { }

export interface FormDataProps extends ApiRequestProps {
    body: FormData;
}
