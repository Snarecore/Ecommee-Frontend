import React from "react";

interface ButtonProps {
  label?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  buttonClass?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  color?: string; 
  hoverColor?: string; 
  icon?: React.ReactNode; 
}

const Button: React.FC<ButtonProps> = ({
  label = "",
  type = "button",
  disabled = false,
  isLoading = false,
  buttonClass = "",
  onClick,
  children,
  color = "#FE9F43",
  hoverColor = "#e68a2c",
  icon,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center px-2.5 py-1.5 text-[14px] text-white rounded-md transition-all duration-300 ease-in-out cursor-pointer
        ${buttonClass} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
      style={{
        backgroundColor: color,
        borderColor: color,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
        e.currentTarget.style.borderColor = hoverColor;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = color;
        e.currentTarget.style.borderColor = color;
      }}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {isLoading ? "Loading..." : label}
      {children}
    </button>
  );
};

export default Button;