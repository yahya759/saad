import React from 'react';

interface AvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ seed, size = 40, className = "" }) => {
  const width = size;
  const height = size;

  switch (seed.toLowerCase()) {
    case 'abu-ahmad': // Chef / Cook (طباخ التكية)
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" className={`rounded-full ${className}`}>
          {/* Background */}
          <circle cx="50" cy="50" r="50" fill="#DCFCE7" />
          {/* Face */}
          <circle cx="50" cy="52" r="26" fill="#EDC5A5" />
          {/* Chef Hat */}
          <path d="M34 32C34 22 42 16 50 16C58 16 66 22 66 32V38H34V32Z" fill="#FFFFFF" />
          <path d="M40 18C42 14 46 12 50 12C54 12 58 14 60 18" stroke="#E2E8F0" strokeWidth="2" />
          <rect x="32" y="34" width="36" height="6" rx="2" fill="#E2E8F0" />
          {/* Eyes */}
          <circle cx="41" cy="48" r="3" fill="#1E293B" />
          <circle cx="59" cy="48" r="3" fill="#1E293B" />
          {/* Beard / moustache (Traditional) */}
          <path d="M35 52C38 50 44 49 50 49C56 49 62 50 65 52" stroke="#4A3728" strokeWidth="2.5" />
          <path d="M35 54C37 66 43 72 50 72C57 72 63 66 65 54C61 58 56 58 50 58C44 58 39 58 35 54ZM50 71C49 71 47 71 46 70C47 70 48 70 50 70C52 70 53 70 54 70C53 71 51 71 50 71Z" fill="#4A3728" />
          {/* Nose */}
          <path d="M48 51C48 50 52 50 52 51" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" />
          {/* Smile */}
          <path d="M45 61C48 64 52 64 55 61" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );

    case 'om-mohammad': // Administrative Manager / Chef (أم محمد)
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" className={`rounded-full ${className}`}>
          {/* Background */}
          <circle cx="50" cy="50" r="50" fill="#FCE7F3" />
          {/* Hijab Wrapper (White/Light Rose) */}
          <path d="M22 45C22 28 32 18 50 18C68 18 78 28 78 45C78 68 62 82 50 82C38 82 22 68 22 45Z" fill="#FFFFFF" />
          {/* Face */}
          <ellipse cx="50" cy="48" rx="21" ry="24" fill="#FEEBC8" />
          {/* Inside Hijab framing (elegant look) */}
          <path d="M29 45C29 33 38 24 50 24C62 24 71 33 71 45C71 58 64 68 50 68C36 68 29 58 29 45Z" fill="#FEEBC8" />
          <path d="M31 34C35 28 42 25 50 25C58 25 65 28 69 34" fill="none" stroke="#E2E8F0" strokeWidth="3" />
          {/* Eyes */}
          <circle cx="42" cy="46" r="3" fill="#1E293B" />
          <circle cx="58" cy="46" r="3" fill="#1E293B" />
          {/* Eyebrows */}
          <path d="M36 41C39 39 44 41 44 41" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M64 41C61 39 56 41 56 41" stroke="#1A202C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Blush */}
          <circle cx="36" cy="53" r="3" fill="#EC4899" opacity="0.4" />
          <circle cx="64" cy="53" r="3" fill="#EC4899" opacity="0.4" />
          {/* Smile */}
          <path d="M44 57C47 60 53 60 56 57" stroke="#9C4221" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'khaled': // Central Store Manager (مسؤول المخزن خالد)
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" className={`rounded-full ${className}`}>
          {/* Background */}
          <circle cx="50" cy="50" r="50" fill="#DBEAFE" />
          {/* Face */}
          <circle cx="50" cy="50" r="27" fill="#E0A96D" />
          {/* Hair / Beard */}
          <path d="M22 45C22 30 35 18 50 18C65 18 78 30 78 45H22Z" fill="#1A202C" />
          <path d="M32 50V58C32 68 40 76 50 76C60 76 68 68 68 58V50" fill="none" stroke="#1A202C" strokeWidth="6" strokeLinecap="round" />
          {/* Mustache */}
          <path d="M40 54C43 51 57 51 60 54" stroke="#1A202C" strokeWidth="3" strokeLinecap="round" />
          {/* Eyes with Glasses */}
          <circle cx="40" cy="46" r="2.5" fill="#1E293B" />
          <circle cx="60" cy="46" r="2.5" fill="#1E293B" />
          <circle cx="40" cy="46" r="9" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <circle cx="60" cy="46" r="9" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <line x1="49" y1="46" x2="51" y2="46" stroke="#3B82F6" strokeWidth="2" />
          {/* Smile */}
          <path d="M46 62C48 64 52 64 54 62" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'yousef': // Mobilization Dispatch / Driver (سائق التوصيل يوسف)
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" className={`rounded-full ${className}`}>
          {/* Background */}
          <circle cx="50" cy="50" r="50" fill="#FFEDD5" />
          {/* Face */}
          <circle cx="50" cy="50" r="26" fill="#F3A97E" />
          {/* Cap (سائق) */}
          <path d="M24 38C24 28 35 20 50 20C65 20 76 28 76 38H24Z" fill="#15803D" />
          <path d="M20 38C20 38 35 34 50 34C65 34 80 38 80 38C80 38 78 42 50 42C22 42 20 38 20 38Z" fill="#166534" />
          {/* Eyes */}
          <circle cx="40" cy="49" r="3" fill="#1E293B" />
          <circle cx="60" cy="49" r="3" fill="#1E293B" />
          {/* Mustache stubble */}
          <path d="M42 56C45 58 55 58 58 56" stroke="#5C4033" strokeWidth="1.5" strokeLinecap="round" />
          {/* Smile */}
          <path d="M44 60C48 64 52 64 56 60" stroke="#7B341E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'yasmin': // Administrative Manager / System Admin (ياسمين)
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" className={`rounded-full ${className}`}>
          {/* Background */}
          <circle cx="50" cy="50" r="50" fill="#E0F2FE" />
          {/* Hijab */}
          <path d="M22 45C22 28 32 18 50 18C68 18 78 28 78 45C78 68 62 82 50 82C38 82 22 68 22 45Z" fill="#3B82F6" />
          {/* Face */}
          <ellipse cx="50" cy="48" rx="20" ry="23" fill="#FFDFC4" />
          <path d="M29 45C29 34 38 25 50 25C62 25 71 34 71 45C71 57 63 66 50 66C37 66 29 57 29 45Z" fill="#FFDFC4" />
          {/* Hijab Inner Frame */}
          <path d="M31 35C35 29 42 26 50 26C58 26 65 29 69 35" fill="none" stroke="#2563EB" strokeWidth="2.5" />
          {/* Eyes */}
          <ellipse cx="41" cy="46" rx="2.5" ry="3" fill="#1A202C" />
          <ellipse cx="59" cy="46" rx="2.5" ry="3" fill="#1A202C" />
          {/* Elegant glasses */}
          <rect x="33" y="41" width="15" height="10" rx="2.5" stroke="#000000" strokeWidth="1.5" fill="none" />
          <rect x="52" y="41" width="15" height="10" rx="2.5" stroke="#000000" strokeWidth="1.5" fill="none" />
          {/* Smile */}
          <path d="M45 56C47 59 53 59 55 56" stroke="#9C4221" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      // Fallback nice initials indicator
      const char = seed.charAt(0).toUpperCase();
      return (
        <div 
          style={{ width, height }} 
          className={`flex items-center justify-center rounded-full text-white font-extrabold text-sm bg-emerald-700 ${className}`}
        >
          {char}
        </div>
      );
  }
};
