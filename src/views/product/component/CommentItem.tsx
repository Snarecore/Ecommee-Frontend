'use client';
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import type { Comment } from "./CommentsSection";
import useOutsideClick from "./useOutsideClick";
import { MdVerified } from "react-icons/md";
import { useEffect, useRef } from "react";

type Props = {
  comment: Comment;
  userPlaceholderImg: string;
  formatDate: (iso: string) => string;
  replyingToId: string | null;
  onStartReply: (commentId: string) => void;
  onChangeReply: (commentId: string, text: string) => void;
  onSendReply: (parentId: string) => void;
  setReplyingToId: (id: string | null) => void;
  vendorId: string;
};

const MAX_TA_HEIGHT = 240; // px; adjust or remove for unlimited growth
function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "0px";
  const next = MAX_TA_HEIGHT ? Math.min(el.scrollHeight, MAX_TA_HEIGHT) : el.scrollHeight;
  el.style.height = next + "px";
  el.style.overflowY = MAX_TA_HEIGHT && el.scrollHeight > MAX_TA_HEIGHT ? "auto" : "hidden";
}

export default function CommentItem({
  comment,
  userPlaceholderImg,
  formatDate,
  replyingToId,
  onStartReply,
  onChangeReply,
  onSendReply,
  setReplyingToId,
  vendorId,
}: Props) {
  const isReplyingHere = replyingToId === comment.id;

  const containerRef = useOutsideClick<HTMLDivElement>(() => {
    if (isReplyingHere) setReplyingToId(null);
  });

  // one ref for the reply textarea
  const replyTaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isReplyingHere && replyTaRef.current) {
      // initialize height when the box opens
      requestAnimationFrame(() => autoGrow(replyTaRef.current!));
      replyTaRef.current.focus();
    }
  }, [isReplyingHere]);

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <Image src={comment?.user?.profileImage || userPlaceholderImg} alt={comment?.user?.name || ""} className="w-10 h-10 p-1 rounded-full border border-[var(--color-green-primary)] object-cover" width={40} height={40} />

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-md font-semibold flex items-center gap-1">
              {comment?.user?.name}
              {comment.user.id === vendorId && (
                <MdVerified className="text-[var(--color-green-primary)]" size={16} />
              )}
            </p>
            <span className="text-xs text-gray-500">{formatDate(comment?.createdAt)}</span>
          </div>

          <p className="text-[15px] text-gray-700 mt-2">{comment.body ?? "—"}</p>

          <button
            type="button"
            onClick={() => onStartReply(comment.id)}
            className="inline-flex items-center gap-1 text-[var(--color-green-primary)] text-sm font-semibold cursor-pointer hover:text-[var(--color-green-secondary)] transition-all ease-in-out duration-300"
          >
            Reply
          </button>

          {isReplyingHere && (
            <div ref={containerRef} className="mt-2 rounded-lg border border-gray-200 bg-white">
              <div className="p-3">
                <textarea
                  ref={replyTaRef}
                  rows={1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                             focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)]
                             overflow-hidden whitespace-pre-wrap break-words"
                  placeholder="Write a reply…"
                  onInput={(e) => autoGrow(e.currentTarget)}
                  onChange={(e) => onChangeReply(comment.id, e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 p-2">
                <button
                  type="button"
                  onClick={() => onSendReply(comment.id)}
                  title="Reply"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-green-primary)] to-green-400 text-white font-bold px-4 py-2 rounded-lg shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  <IoSend size={18} /> Reply
                </button>
              </div>
            </div>
          )}

          {comment.replies?.length ? (
            <div className="mt-3 ml-6 space-y-3">
              {comment.replies.map((r) => (
                <div key={r.id} className="relative">
                  <span className="absolute -left-4 top-3 h-4 w-4 border-l-2 border-b-2 border-gray-300 rounded-bl-sm"></span>

                  <div className="flex items-start gap-3">
                    <Image src={r?.user?.profileImage || userPlaceholderImg} alt={r?.user?.name || ""} className="w-8 h-8 rounded-full border object-cover p-1" width={32} height={32} />

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold flex items-center gap-1">
                          {r?.user?.name}
                          {r?.user?.id === vendorId && (
                            <MdVerified size={14} className="text-[var(--color-green-primary)]" />
                          )}
                        </p>
                        <span className="text-xs text-gray-500">{formatDate(r?.createdAt)}</span>
                      </div>

                      <p className="text-sm text-gray-700 mt-1">{r.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
