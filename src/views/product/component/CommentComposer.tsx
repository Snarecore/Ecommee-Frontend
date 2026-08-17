import { IoSend } from "react-icons/io5";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  userAvatar: string;
};

export default function CommentComposer({
  value,
  onChange,
  onSend,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-gray-50 to-gray-100 p-6 sm:p-8 shadow-lg">
      <p className="text-xl font-extrabold text-[var(--color-black-primary)] mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-[var(--color-green-primary)] rounded-full mr-2"></span>
        Write a comment
      </p>

      <div className="flex items-start gap-4">
        <div className="flex-1 relative">
          <textarea
            rows={4}
            name="comment"
            value={value}
            onChange={onChange}
            placeholder="Write a comment..."
            className="w-full border border-gray-200 bg-white/80 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[var(--color-green-primary)] shadow-sm transition"
            style={{ resize: "none" }}
          />
          <div className="mt-3 flex justify-end absolute right-2 top-16">
            <button
              type="button"
              onClick={onSend}
              title="send"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-green-primary)] to-green-400 text-white font-bold px-5 py-2.5 rounded-lg shadow-md transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <IoSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
