'use client';
import { useEffect, useMemo, useState, ChangeEvent } from "react";
import CommentComposer from "./CommentComposer";
import CommentList from "./CommentList";

type UserLite = { id?: string; name?: string; profileImage?: string | null };
type Reply = {
  id: string;
  body: string;
  createdAt: string;
  user: UserLite;
};
export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: UserLite;
  replies?: Reply[];
};

type Props = {
  productId?: string;
  getCommentsBaseUrl: string;   
  createCommentUrl: string;    
  queryKey: any;              

  usePaginatedQuery: any;      
  handleApiMutation: any;       
  postMutation: any;           

  user: UserLite | null;
  userPlaceholderImg: string;
  formatDate: (iso: string) => string;
  initialLimit?: number;   
  
  vendorId: string;
};

export default function CommentsSection({
  productId,
  getCommentsBaseUrl,
  createCommentUrl,
  queryKey,
  usePaginatedQuery,
  handleApiMutation,
  postMutation,
  user,
  userPlaceholderImg,
  formatDate,
  initialLimit = 10,
  vendorId
}: Props) {
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyTextById, setReplyTextById] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const limit = initialLimit;
  const listUrl = useMemo(
    () => `${getCommentsBaseUrl}/${productId}?page=${currentPageNumber}&limit=${limit}`,
    [getCommentsBaseUrl, productId, currentPageNumber, limit]
  );

  const {
    data: dataList,
    refetch,
    pageCount,
    isFetching,
  } = usePaginatedQuery({
    // @ts-ignore
    queryKey: [queryKey, productId, currentPageNumber, limit],
    url: listUrl,
    enabled: false,
  });

  useEffect(() => {
    if (!productId) return;
    setComments([]);
    setCurrentPageNumber(1);
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    refetch();
  }, [productId, currentPageNumber, refetch]);

  useEffect(() => {
    if (!dataList) return;
    setComments(prev => {
      const seen = new Set(prev.map(c => c.id));
      const toAdd = (dataList as Comment[]).filter(c => !seen.has(c.id));
      return [...prev, ...toAdd];
    });
    setHasMore((pageCount ?? 1) > currentPageNumber);
  }, [dataList, pageCount, currentPageNumber]);

  const isWithinCommentLimit = (s: string) =>
    s.trim().length >= 1 && s.trim().length <= 2000;

  const onChangeComposer = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setNewComment(e.target.value);

  const startReply = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyTextById(prev => ({ ...prev, [commentId]: prev[commentId] ?? "" }));
  };

  const changeReply = (commentId: string, text: string) =>
    setReplyTextById(prev => ({ ...prev, [commentId]: text }));

  const submitComment = async (parentId?: string) => {
    if (!user) return alert("Please log in first.");
    if (!productId) return alert("Product not loaded yet.");
  
    const body = parentId ? (replyTextById[parentId] ?? "") : newComment;
    if (!isWithinCommentLimit(body)) {
      alert("Comment must be between 1 and 2000 characters.");
      return;
    }
  
    const payload: any = { productId, body };
    if (parentId) payload.parentId = parentId;
  
    const result = await handleApiMutation({
      mutation: postMutation,
      url: createCommentUrl,
      body: payload,
      invalidateQueryKey: [queryKey],
      showSuccessMessage: true,
      showErrorMessage: true,
    });
  
    if (result?.success) {
      const createdComment: Comment = {
        id: result.data?.id ?? Math.random().toString(), // fallback id
        body,
        createdAt: new Date().toISOString(),
        user: user,
        replies: [],
      };
  
      if (parentId) {
        // add reply locally
        setComments(prev =>
          prev.map(c =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies ?? []), createdComment] }
              : c
          )
        );
        setReplyTextById(prev => {
          const next = { ...prev };
          delete next[parentId];
          return next;
        });
        setReplyingToId(null);
      } else {
        // add top-level comment at the top
        setComments(prev => [createdComment, ...prev]);
        setNewComment("");
      }
    }
  };
  

  const loadMore = () => {
    if (hasMore && !isFetching) setCurrentPageNumber(p => p + 1);
  };

  return (
    <div className="w-full">
      <CommentComposer
        value={newComment}
        onChange={onChangeComposer}
        onSend={() => submitComment()}
        userAvatar={user?.profileImage || userPlaceholderImg}
      />

      <div className="flex items-center justify-between mt-8">
        <p className="text-xl font-bold text-[var(--color-black-primary)]">
          All Comments
        </p>
      </div>

      {isFetching && comments.length === 0 && (
        <p className="text-gray-500 mt-2">Loading comments…</p>
      )}
      {!isFetching && comments.length === 0 && (
        <p className="text-gray-500 italic mt-2">No comments yet.</p>
      )}

      <CommentList
        comments={comments}
        userPlaceholderImg={userPlaceholderImg}
        formatDate={formatDate}
        replyingToId={replyingToId}
        onStartReply={startReply}
        onChangeReply={changeReply}
        onSendReply={submitComment}
        setReplyingToId={setReplyingToId}
        vendorId={vendorId}
      />

      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={loadMore}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
            disabled={isFetching}
          >
            {isFetching ? "Loading…" : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}
