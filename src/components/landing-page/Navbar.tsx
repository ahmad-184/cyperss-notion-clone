"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useWindowScroll } from "@mantine/hooks";

import { cn } from "@/lib/utils";

import { Button } from "../ui/Button";
import AppLogo from "../AppLogo";
import { useTranslation } from "react-i18next";
import MobileNavbar from "./MobileNavbar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageChanger from "../LanguageChanger";
import { UserSession } from "@/types";

const Navbar = ({ user }: { user: UserSession["user"] }) => {
  const [scroll] = useWindowScroll();
  const { t } = useTranslation();

  const [openMobileNav, setOpenMobileNav] = useState<boolean>(false);

  const handleOpenMobileNav = () => {
    setOpenMobileNav((prev) => !prev);
  };

  const navLinks = useMemo(
    () =>
      [
        {
          text: t("navbar:features"),
          id: "features",
        },
        {
          text: t("navbar:testimonials"),
          id: "testimonials",
        },
        {
          text: t("navbar:pricing"),
          id: "pricing",
        },
      ] as { text: string; id: string }[],
    []
  );

  return (
    <div
      className={cn(
        "flex justify-center items-center w-full fixed top-0 left-0 right-0 z-20 bg-background/50 backdrop-blur-[11px]",
        {
          "bg-gradient-to-l from-slate-100/40 to-purple-200/40 dark:from-background/40 dark:to-purple-950/40":
            scroll.y > 10,
        }
      )}
    >
      <div className="flex justify-between items-center w-full py-4 px-4 md:px-12">
        <AppLogo t={t} showLogoName={true} />

        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map((link, i) => (
            <p
              key={
                i +
                new Date().getFullYear() +
                new Date().getTime() +
                Math.floor(Math.random() * 100000000)
              }
              onClick={() => {
                const el = document.getElementById(link.id);
                if (el?.scrollIntoView) el.scrollIntoView();
              }}
              className="text-sm dark:text-slate-200 cursor-pointer  transition-all duration-150 dark:hover:text-primary hover:text-primary"
            >
              {link.text}
            </p>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-7">
          <div className="flex items-center gap-2">
            <ThemeToggle btn_variant="ghost" />
            <LanguageChanger btn_variant="ghost" />
          </div>
          <div className="flex items-center gap-1">
            {user ? (
              <>{/* TODO show user avatar */}</>
            ) : (
              <Link href={"/signin"}>
                <Button variant="btn-primary">{t("navbar:signin")}</Button>
              </Link>
            )}
          </div>
        </div>

        <MobileNavbar
          openMobileNav={openMobileNav}
          handleOpenMobileNav={handleOpenMobileNav}
          navLinks={navLinks}
        />
      </div>
    </div>
  );
};

export default Navbar;
