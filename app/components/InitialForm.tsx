"use client";

import { useEffect } from "react";
import { useMain } from "../context/MainContext";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

interface IInitialForm {
    numElevators: number;
    numFloors: number;
}

export default function InitialForm() {
    const { setFloors, setElevators } = useMain();
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<IInitialForm>({ mode: "onChange" });
    const router = useRouter();

    useEffect(() => {
        setElevators([]);
        setFloors([]);
    }, []);

    const onSubmit = (data: IInitialForm) => {
        setFloors(Array.from({ length: data.numFloors + 1 }, () => ({ status: 'Call', estimated: 0 })));
        setElevators(Array.from({ length: data.numElevators }, () => ({ currentFloor: 0, targetFloors: [], bottom: 0, isMoving: false })));
        router.push("/building");
    }

    return (
        <div className="w-[500px] h-[400px] shadow-xl rounded-xl flex flex-col justify-center items-center">

            <div className="text-2xl font-bold mb-8 text-cyan-800">Elevator System Setup</div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                <div>
                    <div>Enter number of floors, 1-9:</div>
                    <input
                        type="number"
                        className="w-[250px] py-1 px-5 rounded-lg border border-[rgb(35,35,35)] outline-none focus:outline-none focus:ring-0"
                        {...register("numFloors", {
                            required: "Required",
                            min: { value: 1, message: "Must be at least 1" },
                            max: { value: 9, message: "Must be up to 9" },
                            valueAsNumber: true,
                        })}
                    />
                    <div className="min-h-[30px]">
                        {errors.numFloors && (
                            <p style={{ color: "red" }}>{errors.numFloors.message}</p>
                        )}
                    </div>

                </div>

                <div>
                    <div>Enter number of elevators, 1-10:</div>
                    <input
                        type="number"
                        className="w-[250px] py-1 px-5 rounded-lg border border-[rgb(35,35,35)] outline-none focus:outline-none focus:ring-0"
                        {...register("numElevators", {
                            required: "Required",
                            min: { value: 1, message: "Must be at least 1" },
                            max: { value: 10, message: "Must be up to 10" },
                            valueAsNumber: true,
                        })}
                    />
                    <div className="min-h-[30px]">
                        {errors.numElevators && (
                            <p style={{ color: "red" }}>{errors.numElevators.message}</p>
                        )}
                    </div>
                </div>

                <button type="submit"
                    className={`rounded-[20px] bg-green-400 text-white font-bold px-6 py-2 transition-opacity duration-200 
                    ${!isValid ? "opacity-60 cursor-not-allowed" : "opacity-100 hover:opacity-90 cursor-pointer"}`}>
                    Enter
                </button>
            </form>
        </div>
    );

}