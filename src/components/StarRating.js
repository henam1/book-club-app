"use client";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating, onChange, size = "text-2xl", ariaLabel }) {
  const handleClick = (e, star) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const isHalf = x < width / 2;
    const newRating = isHalf ? star - 0.5 : star;
    onChange(newRating);
  };

  return (
    <div className="flex space-x-1" aria-label={ariaLabel}>
      {[1, 2, 3, 4, 5].map((star) => {
        let icon;
        if (rating >= star) {
          icon = <FaStar className={`text-yellow-500 ${size}`} />;
        } else if (rating >= star - 0.5) {
          icon = <FaStarHalfAlt className={`text-yellow-500 ${size}`} />;
        } else {
          icon = <FaRegStar className={`text-yellow-500 ${size}`} />;
        }

        return (
          <span
            key={star}
            onClick={(e) => handleClick(e, star)}
            className="cursor-pointer"
          >
            {icon}
          </span>
        );
      })}
    </div>
  );
}