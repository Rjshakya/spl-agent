import { cn } from "@/lib/utils";

const STANDARD_STYLE = "size-5";
export const StopIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox={`0 0 24 24`}
      className={cn(` fill-white`, STANDARD_STYLE, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4418_4367)">
        <path
          opacity="0.4"
          d="M11.9702 22C17.4931 22 21.9702 17.5228 21.9702 12C21.9702 6.47715 17.4931 2 11.9702 2C6.44737 2 1.97021 6.47715 1.97021 12C1.97021 17.5228 6.44737 22 11.9702 22Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M10.77 16.2295H13.23C14.89 16.2295 16.23 14.8895 16.23 13.2295V10.7695C16.23 9.10953 14.89 7.76953 13.23 7.76953H10.77C9.11002 7.76953 7.77002 9.10953 7.77002 10.7695V13.2295C7.77002 14.8895 9.11002 16.2295 10.77 16.2295Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_4367">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const SendIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox={`0 0 24 24`}
      className={cn(``, STANDARD_STYLE, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3261_13204)">
        <path
          opacity="0.4"
          d="M19.6 13.98C19.55 13.89 19.51 13.8 19.48 13.7L19.2 12.68L19.17 12.58C18.98 12.08 18.53 11.74 17.97 11.74C17.42 11.74 16.94 12.07 16.75 12.57L16.69 12.74L16.43 13.69C16.29 14.19 15.92 14.56 15.41 14.71L14.45 14.96C13.85 15.13 13.47 15.63 13.47 16.24C13.47 16.66 13.67 17.03 13.98 17.27L8.99 19.77C3.23 22.65 0.88 20.29 3.76 14.54L4.63 12.81C4.88 12.3 4.88 11.71 4.63 11.2L3.76 9.46001C0.88 3.71001 3.24 1.35001 8.99 4.23001L17.55 8.51001C20.5 9.98001 21.17 12.17 19.6 13.98Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M15.07 12C15.07 12.41 14.73 12.75 14.32 12.75H8.91998C8.50998 12.75 8.16998 12.41 8.16998 12C8.16998 11.59 8.50998 11.25 8.91998 11.25H14.32C14.73 11.25 15.07 11.59 15.07 12Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M21.47 16.26C21.47 16.33 21.43 16.49 21.24 16.55L20.26 16.82C19.41 17.05 18.77 17.69 18.54 18.54L18.28 19.5C18.22 19.72 18.05 19.74 17.97 19.74C17.89 19.74 17.72 19.72 17.66 19.5L17.4 18.53C17.17 17.69 16.52 17.05 15.68 16.82L14.71 16.56C14.5 16.5 14.48 16.32 14.48 16.25C14.48 16.17 14.5 15.99 14.71 15.93L15.69 15.67C16.53 15.43 17.17 14.79 17.4 13.95L17.68 12.93C17.75 12.76 17.91 12.73 17.97 12.73C18.03 12.73 18.2 12.75 18.26 12.91L18.54 13.94C18.77 14.78 19.42 15.42 20.26 15.66L21.26 15.94C21.46 16.02 21.47 16.2 21.47 16.26Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
      </g>
      <defs>
        <clipPath id="clip0_3261_13204">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const HomeIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(``, STANDARD_STYLE, className)}
      viewBox="0 0 24 24"
      fill="#fff"
    >
      <g clip-path="url(#clip0_3261_13080)">
        <path
          opacity="0.4"
          d="M15.6799 21.7099C15.4899 21.0299 14.9599 20.4999 14.2699 20.3099L12.8599 19.9299C12.0099 19.6899 11.4399 18.9399 11.4399 18.0499C11.4399 17.1599 12.0099 16.3999 12.8899 16.1499L14.2499 15.7899C14.9499 15.5899 15.4699 15.0699 15.6599 14.3799L16.0299 13.0299L16.1099 12.7699C16.4099 12.0199 17.1199 11.5399 17.9299 11.5399C18.7499 11.5399 19.4799 12.0199 19.7599 12.7599L20.1999 14.3599C20.2899 14.6899 20.4599 14.9699 20.6899 15.2099V6.96995L13.8999 2.24995C12.8899 1.53995 11.5499 1.52995 10.5199 2.21995L3.42993 6.94995V17.7099C3.42993 19.9199 5.22993 21.7099 7.42993 21.7099H15.6799Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M22.9399 18.06C22.9299 18.16 22.8899 18.39 22.6199 18.48L21.2099 18.87C19.9999 19.2 19.0799 20.12 18.7499 21.33L18.3699 22.7C18.2799 23.01 18.0399 23.04 17.9299 23.04C17.8199 23.04 17.5799 23.01 17.4899 22.7L17.1099 21.31C16.7799 20.11 15.8499 19.19 14.6499 18.86L13.2599 18.48C12.9599 18.39 12.9299 18.14 12.9299 18.04C12.9299 17.93 12.9599 17.67 13.2599 17.59L14.6599 17.22C15.8599 16.88 16.7799 15.96 17.1099 14.76L17.5099 13.31C17.6099 13.06 17.8299 13.03 17.9299 13.03C18.0299 13.03 18.2599 13.06 18.3499 13.29L18.7499 14.76C19.0799 15.96 20.0099 16.88 21.2099 17.22L22.6399 17.61C22.9299 17.72 22.9399 17.98 22.9399 18.06Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M0.989962 9.33001C0.749962 9.33001 0.509962 9.21001 0.369962 9.00001C0.139962 8.66001 0.229962 8.19001 0.579962 7.96001L10.1 1.60001C11.39 0.740007 13.05 0.750007 14.33 1.64001L23.43 7.97001C23.77 8.21001 23.85 8.67001 23.62 9.01001C23.38 9.35001 22.91 9.43001 22.58 9.20001L13.48 2.87001C12.72 2.34001 11.72 2.33001 10.94 2.85001L1.41996 9.21001C1.27996 9.29001 1.12996 9.33001 0.989962 9.33001Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
      </g>
      <defs>
        <clipPath id="clip0_3261_13080">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const DotGridIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn(``, STANDARD_STYLE, className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4418_4093)">
        {/* Central Column */}
        <path
          d="M12 3.19922V3.20922"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.69922V7.70922"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 11.6992V11.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 15.6992V15.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 19.1992V19.2092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22.1992V22.2092"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Outer Columns */}
        <path
          d="M3.5 7.69922V7.70922"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 7.69922V7.70922"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 11.6992V11.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 11.6992V11.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 14.6992V14.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 17.6992V17.7092"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 14.6992V14.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 17.6992V17.7092"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Columns */}
        <path
          d="M7.80078 9.69922V9.70922"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.75 5.5V5.51"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.1992 9.69922V9.70922"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.25 5.5V5.51"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.80078 13.6992V13.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.80078 16.6992V16.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.80078 19.6992V19.7092"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.1992 13.6992V13.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.1992 16.6992V16.7092"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.1992 19.6992V19.7092"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_4093">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const ChatIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(` fill-foreground`, STANDARD_STYLE, className)}
      viewBox="0 0 24 24"
    >
      <g clip-path="url(#clip0_4418_4527)">
        <path
          opacity="0.4"
          d="M17.98 10.79V14.79C17.98 15.05 17.97 15.3 17.94 15.54C17.71 18.24 16.12 19.58 13.19 19.58H12.79C12.54 19.58 12.3 19.7 12.15 19.9L10.95 21.5C10.42 22.21 9.56 22.21 9.03 21.5L7.82999 19.9C7.69999 19.73 7.41 19.58 7.19 19.58H6.79001C3.60001 19.58 2 18.79 2 14.79V10.79C2 7.86001 3.35001 6.27001 6.04001 6.04001C6.28001 6.01001 6.53001 6 6.79001 6H13.19C16.38 6 17.98 7.60001 17.98 10.79Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M9.99023 14C9.43023 14 8.99023 13.55 8.99023 13C8.99023 12.45 9.44023 12 9.99023 12C10.5402 12 10.9902 12.45 10.9902 13C10.9902 13.55 10.5502 14 9.99023 14Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M13.4902 14C12.9302 14 12.4902 13.55 12.4902 13C12.4902 12.45 12.9402 12 13.4902 12C14.0402 12 14.4902 12.45 14.4902 13C14.4902 13.55 14.0402 14 13.4902 14Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M6.5 14C5.94 14 5.5 13.55 5.5 13C5.5 12.45 5.95 12 6.5 12C7.05 12 7.5 12.45 7.5 13C7.5 13.55 7.05 14 6.5 14Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          d="M21.98 6.79001V10.79C21.98 13.73 20.63 15.31 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.60001 16.38 6 13.19 6H6.79004C6.53004 6 6.28004 6.01001 6.04004 6.04001C6.27004 3.35001 7.86004 2 10.79 2H17.19C20.38 2 21.98 3.60001 21.98 6.79001Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_4527">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const FolderIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(` `, STANDARD_STYLE, className)}
      viewBox="0 0 24 24"
      fill="#fff"
    >
      <g clipPath="url(#clip0_4418_4295)">
        <path
          d="M22 11.0704V16.6504C22 19.6004 19.6 22.0004 16.65 22.0004H7.35C4.4 22.0004 2 19.6004 2 16.6504V9.44043H21.74C21.89 9.89043 21.97 10.3504 21.99 10.8404C22 10.9104 22 11.0004 22 11.0704Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          opacity="0.4"
          d="M21.74 9.44H2V6.42C2 3.98 3.98 2 6.42 2H8.75C10.38 2 10.89 2.53 11.54 3.4L12.94 5.26C13.25 5.67 13.29 5.73 13.87 5.73H16.66C19.03 5.72 21.05 7.28 21.74 9.44Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_4295">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const CloudIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(` `, STANDARD_STYLE, className)}
      viewBox="0 0 24 24"
      fill="#fff"
    >
      <g clipPath="url(#clip0_4418_4277)">
        <path
          d="M20.4798 10.6899L2.00977 15.7199C2.11977 14.1299 3.10977 12.4599 5.10977 11.9699C4.51977 9.63986 5.01977 7.44986 6.53977 5.85986C8.26977 4.04986 11.0298 3.32986 13.4098 4.06986C15.5998 4.73986 17.1398 6.53986 17.6898 9.03986C18.7798 9.28986 19.7498 9.85986 20.4798 10.6899Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
        <path
          opacity="0.4"
          d="M20.17 18.7404C19.13 19.6904 17.77 20.2204 16.35 20.2204H5.97C3.23 20.0204 2 17.9104 2 16.0304C2 15.9304 2 15.8304 2.01 15.7204L20.48 10.6904C21.05 11.3004 21.48 12.0504 21.74 12.9104C22.4 15.0804 21.8 17.3104 20.17 18.7404Z"
          fill="white"
          style={{ fill: "var(--fillg)" }}
        />
      </g>
      <defs>
        <clipPath id="clip0_4418_4277">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
