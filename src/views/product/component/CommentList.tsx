import CommentItem from "./CommentItem";
import type { Comment } from "./CommentsSection";

type Props = {
  comments: Comment[];
  userPlaceholderImg: string;
  formatDate: (iso: string) => string;
  replyingToId: string | null;
  onStartReply: (commentId: string) => void;
  onChangeReply: (commentId: string, text: string) => void;
  onSendReply: (parentId: string) => void;
  setReplyingToId: (id: string | null) => void;
  vendorId: string;
};

export default function CommentList({
  comments,
  userPlaceholderImg,
  formatDate,
  replyingToId,
  onStartReply,
  onChangeReply,
  onSendReply,
  setReplyingToId,
  vendorId
}: Props) {
  return (
    <div className="space-y-5">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          userPlaceholderImg={userPlaceholderImg}
          formatDate={formatDate}
          replyingToId={replyingToId}
          onStartReply={onStartReply}
          onChangeReply={onChangeReply}
          onSendReply={onSendReply}
          setReplyingToId={setReplyingToId}
          vendorId={vendorId}
        />
      ))}
    </div>
  );
}
