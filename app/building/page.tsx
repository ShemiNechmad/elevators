"use client";

import { useEffect } from "react";
import { useMain } from "../context/MainContext";
import { useRouter } from "next/navigation";
import { useElevatorEngine } from "./hooks/useElevatorEngine";
import { formatTime } from "./hooks/utils";


export default function BuildingPage() {
    const { floors, elevators } = useMain();
    const router = useRouter();
    const { callElevator } = useElevatorEngine();
    useEffect(() => {
        if (floors.length === 0 || elevators.length === 0) router.push("/");
    }, []);

    const getTransitionDuration = (elevator: IElevator) => {
        if (elevator.targetFloors.length === 0) return 5;
        const nextTargetFloor = elevator.targetFloors[0];
        const floorDifference = Math.abs(elevator.currentFloor - nextTargetFloor);
        return floorDifference * 5;
    };

    const icon_colors = {
        'default': 'none',
        'green': 'invert(49%) sepia(35%) saturate(700%) hue-rotate(85deg) brightness(98%) contrast(90%)',
        'red': 'invert(24%) sepia(91%) saturate(1510%) hue-rotate(334deg) brightness(88%) contrast(99%)',
    };

    const getIconColor = (elevator: IElevator) => {
        if (elevator.targetFloors.length === 0) return icon_colors['default'];
        const nextTargetFloor = elevator.targetFloors[0];
        if (nextTargetFloor !== elevator.currentFloor) return icon_colors['red'];
        return icon_colors['green'];
    }

    if (elevators.length === 0 || floors.length === 0) return null;

    return (
        <div className="h-full flex flex-col-reverse overflow-auto">
            {floors.map((floor, index) => (
                <div className="flex" key={index}>

                    <div className="w-[130px] h-[70px] p-4 flex items-center justify-end font-bold text-[15px]">
                        {(() => {
                            if (index === 0) return "Ground Floor";
                            if (index === 1) return "1st";
                            if (index === 2) return "2nd";
                            if (index === 3) return "3rd";
                            return `${index}th`;
                        })()}
                    </div>

                    {elevators.map((elevator, eIndex) => (
                        <div key={eIndex} className="relative w-[130px] h-[70px] p-2 border border-[#EEEEEE] bg-white flex items-center justify-center">
                            {(() => {
                                if (floor.estimated > 0 && elevator.targetFloors.includes(index)) return (
                                    <div className="absolute top-2">{formatTime(floor.estimated)}</div>
                                )
                            })()}

                            {(() => {
                                if (index === 0) {
                                    const duration = getTransitionDuration(elevator);
                                    const filterStyle = getIconColor(elevator);
                                    return (
                                        <div
                                            className="absolute bottom-0 left-0 right-0 mx-auto w-fit z-10 bg-white rounded p-[5px_40px]"
                                            style={{ bottom: elevator.bottom + 15, transition: `bottom ${duration}s ease-in-out` }}>
                                            <img src="icons/elevator.svg" className="w-8 h-8 block" style={{ filter: filterStyle, WebkitFilter: filterStyle }} />
                                        </div>
                                    )
                                }
                            })()}
                        </div>
                    ))}

                    <div className="w-[130px] h-[70px] p-2 flex items-center justify-center">
                        <button onClick={() => callElevator(index)}
                            disabled={floor.status !== "Call"}
                            className={`w-[100px] h-9 rounded-md 
                            ${floor.status === "Call" ? "bg-[#5BCD88] text-white cursor-pointer" : ""}
                            ${floor.status === "Waiting" ? "bg-[#ED484D] text-white" : ""}
                            ${floor.status === "Arrived" ? "bg-transparent border border-[#ED484D] text-[#ED484D]" : ""}`}>
                            {floor.status}
                        </button>
                    </div>

                </div>
            ))}

        </div>
    );
}