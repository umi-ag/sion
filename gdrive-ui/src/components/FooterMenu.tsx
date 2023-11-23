import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { IoCarSportOutline } from 'react-icons/io5';
import { LuMailPlus } from 'react-icons/lu';
import { PiCertificate } from 'react-icons/pi';
import { SlPresent } from 'react-icons/sl';

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}> = ({ icon, label, href, isActive }) => {
  const containerClass = clsx(
    'flex flex-col gap-1 justify-center items-center relative',
    // isActive && '!text-accent-700',
  );

  return (
    <Link href={href}>
      <div className={containerClass}>
        <span className="text-4xl h-8">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
        {isActive && (
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-700 rounded-full" />
        )}
      </div>
    </Link>
  );
};

export const FooterMenu: React.FC = () => {
  const items = [
    { icon: <PiCertificate />, label: '証明書', href: '/certificates' },
    { icon: <IoCarSportOutline />, label: '走行データ', href: '/personal-data' },
    { icon: <SlPresent />, label: '特典', href: '/rewards' },
    { icon: <LuMailPlus />, label: 'シェア', href: '/share' },
  ];
  const pathname = usePathname();

  return (
    <div className="flex justify-around pt-4 pb-8 bg-white bg-opacity-70">
      {items.map((item) => (
        <MenuItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} />
      ))}
    </div>
  );
};
