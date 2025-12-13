"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface MainContext {
    floors: IFloor[];
    elevators: IElevator[];
    setFloors: React.Dispatch<React.SetStateAction<IFloor[]>>;
    setElevators: React.Dispatch<React.SetStateAction<IElevator[]>>;
}

const MainContext = createContext<MainContext | undefined>(undefined);

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [floors, setFloors] = useState<IFloor[]>([]);
    const [elevators, setElevators] = useState<IElevator[]>([]);

    const value = useMemo(() => ({ floors, elevators, setFloors, setElevators }), [floors, elevators]);

    return (
        <MainContext.Provider value={value}>
            {children}
        </MainContext.Provider>
    );
}

export const useMain = (): MainContext => {
    const context = useContext(MainContext);
    if (!context) {
        throw new Error("useMainContext must be used within a MainProvider");
    }
    return context;
}