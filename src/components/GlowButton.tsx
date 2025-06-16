import React from "react";

interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
}

export function GlowOnHoverButton({
  children,
  loading = false,
  ...props
}: GlowButtonProps) {
  return (
    <button
      {...props}
      className={`
        relative z-0 inline-flex items-center justify-center gap-2 rounded-lg border-none outline-none text-white
        bg-[#111] cursor-pointer w-[140px] h-[50px] select-none px-4
        before:absolute before:top-[-2px] before:left-[-2px] before:w-[calc(100%+4px)] before:h-[calc(100%+4px)]
        before:rounded-lg before:bg-gradient-to-r before:bg-[length:400%_400%]
        before:from-red-500 before:via-yellow-400 before:to-purple-700
        before:opacity-0 before:blur-md before:transition-opacity before:duration-300
        after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[#111] after:rounded-lg
        hover:before:opacity-100
        active:text-black
        disabled:cursor-not-allowed disabled:opacity-50
      `}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 533.5 544.3"
          className="w-5 h-5"
          fill="currentColor"
        >
          <path
            d="M533.5 278.4c0-17.4-1.5-34.2-4.4-50.4H272v95.4h146.7c-6.3 34-25.3 62.8-54 82v68h87.3c51-47 80.5-116.4 80.5-194z"
            fill="#4285F4"
          />
          <path
            d="M272 544.3c73.5 0 135.3-24.3 180.4-65.8l-87.3-68c-24 16.1-54.8 25.7-93.1 25.7-71.4 0-132-48.2-153.5-113.1H27v70.7c45.2 88.3 137.9 151.6 245 151.6z"
            fill="#34A853"
          />
          <path
            d="M118.5 323.1c-10.7-31.5-10.7-65.4 0-96.9V155.5H27c-39.7 77.3-39.7 169.8 0 247.1l91.5-79.5z"
            fill="#FBBC05"
          />
          <path
            d="M272 107.7c39.7-.6 77.6 14.1 106.7 40.6l79.9-79.9C403.3 24.4 337.6-.2 272 0 165 0 72.3 63.3 27 151.6l91.5 70.7c21.5-64.9 82.1-113.1 153.5-113.1z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span className="whitespace-nowrap">{children}</span>

      <style jsx>{`
        button::before {
          content: "";
          background: linear-gradient(
            45deg,
            #ff0000,
            #ff7300,
            #fffb00,
            #48ff00,
            #00ffd5,
            #002bff,
            #7a00ff,
            #ff00c8,
            #ff0000
          );
          background-size: 400% 400%;
          position: absolute;
          top: -2px;
          left: -2px;
          z-index: -1;
          filter: blur(5px);
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          animation: glowing 20s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          border-radius: 10px;
        }
        button:hover::before {
          opacity: 1;
        }
        button:active {
          color: #000;
        }
        button:active::after {
          background: transparent;
        }
        button::after {
          z-index: -1;
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: #111;
          left: 0;
          top: 0;
          border-radius: 10px;
        }
        @keyframes glowing {
          0% {
            background-position: 0 0;
          }
          50% {
            background-position: 400% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
    </button>
  );
}
