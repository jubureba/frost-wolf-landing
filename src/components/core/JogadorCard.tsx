"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

export function JogadorCard({
  jogador,
  loading = false,
}: {
  jogador: Jogador;
  loading?: boolean;
}) {
  const [position, setPosition] = useState<"top" | "left" | "right">("top");
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <li className="relative flex flex-col items-start w-16">
      <Popover className="relative">
        {({ open }) => {
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
              <PopoverButton ref={buttonRef} className="focus:outline-none">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden border border-[#444]
                  cursor-pointer transition-transform duration-200 hover:scale-105 bg-[#121212] flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : jogador.avatar ? (
                    <Image
                      src={jogador.avatar}
                      alt={jogador.nome}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#666] text-xl font-bold">
                      ?
                    </div>
                  )}
                </div>
              </PopoverButton>

              <div className="mt-1 text-left w-full max-w-[72px]">
                <p
                  className="font-semibold text-[12px] truncate"
                  style={{ color: jogador.color ?? "#e2e2e2" }}
                  title={jogador.nome}
                >
                  {jogador.nome}
                </p>
                <p className="text-[#999] text-[9px] truncate">
                  {jogador.classe ?? "??"}
                </p>
                <p className="text-[#999] text-[9px] truncate">
                  {jogador.spec ?? "??"}
                </p>
              </div>

              {open && (
                <PopoverPanel
                  className={`
                    absolute z-50 w-[280px] sm:w-[300px]
                    rounded-2xl bg-[#202020cc] backdrop-blur-md
                    border border-[#444] shadow-xl
                    flex flex-col gap-6 p-6
                    ${
                      position === "top"
                        ? "left-1/2 -translate-x-1/2 bottom-full mb-6"
                        : position === "left"
                        ? "right-full mr-6 top-1/2 -translate-y-1/2"
                        : "left-full ml-6 top-1/2 -translate-y-1/2"
                    }
                  `}
                >
                  {/* Setinha */}
                  <div
                    className={`
                      absolute
                      ${
                        position === "top"
                          ? "top-[calc(100%-11px)] left-1/2 -translate-x-1/2 rotate-225"
                          : position === "left"
                          ? "top-1/2 right-[-13px] -translate-y-1/2 rotate-45"
                          : "top-1/2 left-[-13px] -translate-y-1/2 -rotate-45"
                      }
                      w-6 h-6
                      bg-[#202020cc] backdrop-blur-md
                      border-l border-t border-[#444]
                      z-[-1]
                    `}
                  ></div>

                  {/* Conteúdo */}
                  <div className="flex flex-col gap-1 text-center">
                    <p
                      className="font-semibold text-lg"
                      style={{ color: jogador.color ?? "#e2e2e2" }}
                    >
                      {jogador.nome}
                    </p>
                    <p className="text-xs text-gray-400">
                      {jogador.spec} - {jogador.classe}
                    </p>
                    <p className="text-xs text-gray-400">{jogador.realm}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <InfoLabel
                      label="Nível"
                      value={jogador.level?.toString() ?? "??"}
                    />
                    <InfoLabel
                      label="iLvl"
                      value={jogador.ilvl?.toString() ?? "??"}
                    />
                    <InfoLabel label="Role" value={jogador.role ?? "??"} />
                    <InfoLabel label="Spec" value={jogador.spec ?? "??"} />
                  </div>

                  {jogador.discord && (
                    <div className="flex items-center gap-2 text-sm text-[#5865F2]">
                      <Image
                        src="/assets/icons/discord.png"
                        alt="Discord"
                        width={16}
                        height={16}
                      />
                      <span className="truncate">{jogador.discord}</span>
                    </div>
                  )}

                  {jogador.battletag && (
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <Image
                        src="/assets/icons/battlenet.png"
                        alt="Battle.net"
                        width={16}
                        height={16}
                      />
                      <span className="truncate">{jogador.battletag}</span>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center">
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
                      <div
                        key={link.label}
                        className="flex flex-col items-center gap-1"
                      >
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] transition"
                        >
                          <Image
                            src={link.img}
                            alt={link.label}
                            width={20}
                            height={20}
                          />
                        </a>
                        <span className="text-[10px] text-gray-400">
                          {link.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverPanel>
              )}
            </>
          );
        }}
      </Popover>
    </li>
  );
}

function InfoLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
