import { format } from "date-fns";
import { Card } from "./ui/card";
import { Entry } from "@/app/lib/services/types/interfaces";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useRef } from "react";

export const EntryCard = ({ onEntryClick, entry, }: { onEntryClick: (value:string) => void, entry: Entry }) => {
    // const avatarRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const avatar = avatarRef.current;
//     if (!avatar) return;

//     const container = avatar.parentElement?.parentElement; // Get the parent container
//     if (!container) return;
//     const containerWidth = container.offsetWidth;
//     const avatarWidth = avatar.offsetWidth;

//     const handleAnimationIteration = (event) => {
//       if (event.animationName === 'marquee') {
//         avatar.style.animation = 'fallAndBounce 2s ease-out, rollBack 3s linear 2s forwards';
//         avatar.style.transform = ''; // Reset transform
//       }
//     };

//     const handleRollBackEnd = (event) => {
//       if (event.animationName === 'rollBack') {
//         avatar.style.animation = 'marquee 15s linear infinite, rotate 5s linear infinite';
//       }
//     };

//     avatar.addEventListener('animationiteration', handleAnimationIteration);
//     avatar.addEventListener('animationend', handleRollBackEnd);

//     return () => {
//       avatar.removeEventListener('animationiteration', handleAnimationIteration);
//       avatar.removeEventListener('animationend', handleRollBackEnd);
//     };
//   }, []);
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow mt-6"
            onClick={() => onEntryClick(entry.id)}>
            <div className="flex justify-center -mt-10 justify-start">
            </div>
            <div className="px-4 pt-1 mx-auto w-full md:px-[90px]">
                <div className="relative w-full">
                    {/* <div className="absolute" ref={avatarRef}>  */}
                <Avatar  className="h-10 w-10 animate-marquee">
                    <AvatarFallback className="bg-blue-100 text-blue-600 animate-rotate">
                        {entry.title?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                {/* </div> */}
                </div>

                <div className="mb-1 border-t border-b divide-y">
                    <div className="grid py-8 sm:grid-cols-13 gap-4">
                        <div className="mb-4 col-span-4">
                            <div className="space-y-1 text-xs font-semibold tracking-wide uppercase md:ms-8">
                                <a
                                    href="/"
                                    className="transition-colors duration-200 text-indigo-600 dark:text-blue-500 hover:text-indigo-800"
                                    aria-label="Category"
                                >
                                    {entry.mood}
                                </a>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="col-span-9">
                            <div className="mb-3">
                                <a
                                    href="/"
                                    aria-label="Article"
                                    className="inline-block text-gray-800 dark:text-gray-300 transition-colors duration-200 hover:text-deep-purple-accent-700"
                                >
                                    <p className="text-3xl font-extrabold leading-none sm:text-4xl xl:text-4xl">
                                        {entry.title}
                                    </p>
                                </a>
                            </div>

                            <div
                                className="line-clamp-2 text-slate-600 mb-3 dark:text-slate-200"
                                dangerouslySetInnerHTML={{
                                    __html: entry.content.replace(/<[^>]+>/g, ' ').substring(0, 150) + '...',
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <style>
                    {`
                        @keyframes marquee {
                            0% { transform: translateX(0%); }
                            100% { transform: translateX(calc(100vw + 10rem)); }
                        }

                        @keyframes rotate {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes fallAndBounce {
                            0% { transform: translateY(0); }
                            50% { transform: translateY(calc(100% - 10px)); }
                            70% { transform: translateY(calc(100% - 3px)); }
                            85% { transform: translateY(calc(100% - 8px)); }
                            100% { transform: translateY(100%); }
                        }
                        @keyframes rollBack {
                            0% { transform: translateX(calc(100vw + 10rem)); }
                            100% { transform: translateX(0); }
                        }

                        .animate-marquee {
                            animation: marquee 15s linear infinite;
                            white-space: nowrap;
                        }

                        .animate-rotate {
                            animation: rotate 5s linear infinite; /* Adjust 5s for rotation speed */
                        }

                            
                    `}
                </style>
        </Card>
    );
};