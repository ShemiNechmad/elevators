
import React, { ReactNode } from "react";

interface BuildingLayoutProps {
    children: ReactNode;
}

export default function BuildingLayout({ children }: BuildingLayoutProps) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#EEEEEE] flex flex-col items-center pb-[30px]">

            <div className="text-2xl text-center my-18 font-['Courier_New',_Courier,_monospace, bold]">Elevator Exercise</div>

            <main className="h-full overflow-hidden">{children}</main>

        </div>
    );
}