import Image from "next/image";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/date-utils";

interface BlogCardProps {
  image: string;
  title: string;
  author: string;
  date: string;
  link: string;
}

const BlogCard = ({ image, title, author, date, link }: BlogCardProps) => {
  return (
    <div className="max-w-sm rounded-2xl overflow-hidden transition-shadow duration-300">
      <Link to={link}>
      <Image src={image} alt={title} className="h-[250px] w-full object-cover rounded-t-2xl" width={500} height={500} />
      </Link>

      <div className="py-5">
        <p className="text-xl md:text-2xl font-semibold mb-3 leading-snug">
          {title}
        </p>
        <p className="text-sm text-gray-500">
          <span className="text-gray-400">by</span>{" "}
          <span className="font-medium text-gray-700">{author}</span>
          <span className="text-gray-300 px-2">|</span>
          <span>{formatDate(date)}</span>
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
