export interface ApiRequestProps {
    url: string;
    token?: string;
}

export interface GetDataProps extends ApiRequestProps { }

export interface PostDataProps extends ApiRequestProps {
    body: Record<string, unknown>;
}

export interface PatchDataProps extends PostDataProps { }

export interface DeleteDataProps extends ApiRequestProps { }

export interface FormDataProps extends ApiRequestProps {
    body: FormData;
}
