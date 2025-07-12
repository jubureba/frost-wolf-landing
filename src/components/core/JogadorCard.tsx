"use client";
import React, { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import clsx from "clsx";

const popoverVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.95 },
};

export function JogadorCard({ jogador, loading = false }: { jogador: Jogador; loading?: boolean }) {
  const [position, setPosition] = useState<"top" | "left" | "right">("top");
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <li className="relative flex flex-col items-start w-16">
      <Popover className="relative">
        {({ open }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (open && buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect();
              const vw = window.innerWidth;

              if (rect.right + 320 > vw) setPosition("left");
              else if (rect.left < 320) setPosition("right");
              else setPosition("top");
            }
          }, [open]);

          return (
            <>
              <PopoverButton
                ref={buttonRef}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="focus:outline-none flex flex-col items-center cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-full overflow-hidden border border-[#444]
                  bg-[#121212] flex items-center justify-center
                  transition-transform duration-300 hover:scale-110 hover:shadow-lg"
                >
                  {loading ? (
                    <div className="w-full h-full rounded-full shimmer"></div>
                  ) : jogador.avatar ? (
                    <Image
                      src={jogador.avatar}
                      alt={jogador.nome}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666] text-xl font-bold">
                      ?
                    </div>
                  )}
                </div>

                {/* Nome e spec */}
                <div className="mt-1 text-center w-full max-w-[72px]">
                  <p
                    className="text-[15px] truncate font-saira"
                    style={{ color: jogador.color ?? "#e2e2e2" }}
                    title={jogador.nome}
                  >
                    {jogador.nome}
                  </p>

                  <div className="flex justify-center items-center gap-1">
                    <p className="text-gray-400 text-[10px] font-roboto">
                      {jogador.spec ?? "??"}
                    </p>
                  </div>

                  <p className="text-gray-500 text-[10px] font-roboto">
                    {jogador.classe ?? "??"}
                  </p>
                </div>
              </PopoverButton>

              <AnimatePresence>
                {open && (
                  <PopoverPanel static>
                    <JogadorPopoverContent jogador={jogador} position={position} />
                  </PopoverPanel>
                )}
              </AnimatePresence>
            </>
          );
        }}
      </Popover>
    </li>
  );
}

function JogadorPopoverContent({
  jogador,
  position,
}: {
  jogador: Jogador;
  position: "top" | "left" | "right";
}) {
  const popoverClass = clsx(
    "absolute z-50 w-[280px] sm:w-[320px] rounded-2xl bg-[#1a1a1a] backdrop-blur-md border border-neutral-700 shadow-[inset_0_1px_4px_#00000066] flex flex-col gap-4 p-4 popover-with-arrow",
    {
      "popover-top left-1/2 -translate-x-1/2 bottom-full mb-6": position === "top",
      "popover-left right-full mr-6 top-1/2 -translate-y-1/2": position === "left",
      "popover-right left-full ml-6 top-1/2 -translate-y-1/2": position === "right",
    }
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={popoverVariants}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={popoverClass}
      role="tooltip"
    >
      {/* 🔥 Título */}
      <div className="border-b border-neutral-700 pb-2">
        <p
          className="font-semibold text-xl truncate font-saira"
          style={{ color: jogador.color ?? "#e2e2e2" }}
          title={jogador.nome}
        >
          {jogador.nome} - {jogador.realm}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          {jogador.specIcon && (
            <div className="w-7 h-7 rounded-full border border-neutral-700 p-[2px] bg-black flex items-center justify-center">
              <Image
                src={jogador.specIcon}
                alt={jogador.spec ?? "Spec"}
                width={28}
                height={28}
                className="rounded-full"
                unoptimized
              />
            </div>
          )}
          <span className="font-saira">
            {jogador.spec} - {jogador.classe}
          </span>
        </div>
      </div>

      {/* 🏷️ Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm border border-neutral-800 rounded-xl p-3 bg-[#141414cc] shadow-inner">
        <InfoLabel label="Nível" value={jogador.level?.toString() ?? "??"} />
        <InfoLabel label="iLvl" value={jogador.ilvl?.toString() ?? "??"} />
        <InfoLabel label="Role" value={jogador.role ?? "??"} />
        <InfoLabel label="Spec" value={jogador.spec ?? "??"} />
      </div>

      {/* 📞 Contatos */}
      {(jogador.discord || jogador.battletag || jogador.twitch) && (
        <div className="flex flex-col gap-2">
          {jogador.discord && (
            <ContactInfo icon="/assets/icons/discord.png" text={jogador.discord} color="text-[#5865F2]" />
          )}
          {jogador.battletag && (
            <ContactInfo icon="/assets/icons/battlenet.png" text={jogador.battletag} color="text-blue-300" />
          )}
          {jogador.twitch && (
            <ContactInfo
              icon="/assets/icons/twitch.png"
              text={jogador.twitch}
              href={`https://twitch.tv/${jogador.twitch}`}
              color="text-purple-400"
            />
          )}
        </div>
      )}

      {/* 🌐 Links externos */}
      <div className="flex gap-4 justify-center border-t border-neutral-800 pt-3">
        {[
          {
            href: `https://worldofwarcraft.com/pt-br/character/us/${jogador.realm}/${jogador.nome}`,
            img: "/assets/icons/armory.png",
            label: "Armory",
          },
          {
            href: `https://www.warcraftlogs.com/character/us/${jogador.realm}/${jogador.nome}`,
            img: "/assets/icons/warcraftlogs.png",
            label: "WCL",
          },
          {
            href: `https://raider.io/characters/us/${jogador.realm}/${jogador.nome}`,
            img: "/assets/icons/raiderio.png",
            label: "Raider.io",
          },
        ].map((link) => (
          <div key={link.label} className="flex flex-col items-center gap-1">
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] hover:shadow-[0_0_10px_#84cc16aa] transition cursor-pointer"
              aria-label={link.label}
            >
              <Image src={link.img} alt={link.label} width={20} height={20} unoptimized/>
            </a>
            <span className="text-[10px] text-gray-400">{link.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// eslint-disable-next-line react/display-name
const InfoLabel = memo(({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-gray-400 text-xs">{label}</span>
    <span className="font-medium truncate">{value}</span>
  </div>
));

// eslint-disable-next-line react/display-name
const ContactInfo = memo(
  ({
    icon,
    text,
    href,
    color,
  }: {
    icon: string;
    text: string;
    href?: string;
    color: string;
  }) => {
    const content = (
      <>
        <Image src={icon} alt="icon" width={16} height={16} className="flex-shrink-0" unoptimized/>
        <span className="truncate">{text}</span>
      </>
    );

    return href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 text-sm ${color} truncate hover:underline`}
      >
        {content}
      </a>
    ) : (
      <div className={`flex items-center gap-2 text-sm ${color} truncate`}>{content}</div>
    );
  }
);
