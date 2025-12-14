import { useRef, useCallback, useEffect } from "react";
import { useMain } from "@/app/context/MainContext";
import { chooseClosestElevator } from "./utils";
import { elevatorReducer, floorReducer } from "./elevatorReducer";

export function useElevatorEngine() {
    const { elevators, setElevators, floors, setFloors } = useMain();
    const elevatorsRef = useRef(elevators);
    const floorsRef = useRef(floors);
    const timersRef = useRef<Record<number, number[]>>({});
    const intervalRef = useRef<number | null>(null);
    elevatorsRef.current = elevators;
    floorsRef.current = floors;

    function callElevator(floorIndex: number) {
        let F = [...floorsRef.current];
        let E = [...elevatorsRef.current];
        F = changeFloorStatus(F, floorIndex, 'Waiting');
        const { elevatorIndex, estimated } = chooseClosestElevator(F, E, floorIndex);
        F = changeFloorEstimated(F, floorIndex, estimated);
        E = changeElevatorTargets(E, elevatorIndex, floorIndex);
        updateElevators(E);
        updateFloors(F);
        const elevator = E[elevatorIndex];
        if (!elevator.isMoving) {
            processNextFloor(elevatorIndex);
        }
    }

    function changeFloorStatus(floors: IFloor[], floorIndex: number, status: 'Call' | 'Waiting' | 'Arrived'): IFloor[] {
        return floors.map((floor, index) =>
            index === floorIndex ? { ...floor, status } : floor
        );
    }

    function changeFloorEstimated(floors: IFloor[], floorIndex: number, estimated: number): IFloor[] {
        return floors.map((floor, index) =>
            index === floorIndex ? { ...floor, estimated } : floor
        );
    }

    function changeElevatorTargets(elevators: IElevator[], elevatorIndex: number, targetFloor: number): IElevator[] {
        return elevators.map((elevator, index) =>
            index === elevatorIndex ? { ...elevator, targetFloors: [...elevator.targetFloors, targetFloor] } : elevator
        );
    }

    const processNextFloor = useCallback((elevatorIndex: number) => {
        const currElevators = elevatorsRef.current;
        const currFloors = floorsRef.current;
        const elevator = currElevators[elevatorIndex];

        if (elevator.targetFloors.length === 0) return;
        if (elevator.isMoving) return;

        const floorIndex = elevator.targetFloors[0];
        const estimatedTime = currFloors[floorIndex].estimated;

        let movingElevators = elevatorReducer(currElevators, {
            type: 'SET_ELEVATOR_MOVING',
            elevatorIndex,
            isMoving: true,
        });
        movingElevators = elevatorReducer(movingElevators, {
            type: 'SET_ELEVATOR_BOTTOM',
            elevatorIndex,
            bottom: floorIndex * 70,
        });
        updateElevators(movingElevators);

        const timerId1 = window.setTimeout(() => {
            const freshElevators = elevatorsRef.current;
            const freshFloors = floorsRef.current;

            let arrivedFloors = floorReducer(freshFloors, {
                type: 'SET_FLOOR_STATUS',
                floorIndex,
                status: 'Arrived',
            });
            updateFloors(arrivedFloors);

            let arrivedElevators = elevatorReducer(freshElevators, {
                type: 'SET_ELEVATOR_CURRENT_FLOOR',
                elevatorIndex,
                currentFloor: floorIndex,
            });
            updateElevators(arrivedElevators);

            playAudioNotification();

            const timerId2 = window.setTimeout(() => {
                const finalElevators = elevatorsRef.current;
                const finalFloors = floorsRef.current;

                let resetFloors = floorReducer(finalFloors, {
                    type: 'SET_FLOOR_STATUS',
                    floorIndex,
                    status: 'Call',
                });
                resetFloors = floorReducer(resetFloors, {
                    type: 'SET_FLOOR_ESTIMATED',
                    floorIndex,
                    estimated: 0,
                });

                let resetElevators = elevatorReducer(finalElevators, {
                    type: 'REMOVE_ELEVATOR_TARGET',
                    elevatorIndex,
                    floorIndex,
                });

                resetElevators = elevatorReducer(resetElevators, {
                    type: 'SET_ELEVATOR_MOVING',
                    elevatorIndex,
                    isMoving: false,
                });

                updateElevators(resetElevators);
                updateFloors(resetFloors);

                timersRef.current[elevatorIndex] = (timersRef.current[elevatorIndex] || [])
                    .filter(id => id !== timerId1 && id !== timerId2);

                processNextFloor(elevatorIndex);
            }, 2000);

            timersRef.current[elevatorIndex] = [...(timersRef.current[elevatorIndex] || []), timerId2];

        }, estimatedTime * 1000);

        timersRef.current[elevatorIndex] = [...(timersRef.current[elevatorIndex] || []), timerId1];

    }, [setElevators, setFloors]);

    function playAudioNotification() {
        const audio = new Audio('/audio/door-opens.mp3');
        audio.currentTime = 0;
        audio.play();
    }

    useEffect(() => {
        const decrementEstimates = () => {
            const currentFloors = floorsRef.current;
            const newFloors = currentFloors.map(floor => {
                if (floor.estimated > 0) {
                    return {
                        ...floor,
                        estimated: floor.estimated - 1
                    };
                }
                return floor;
            });
            setFloors(newFloors);
            floorsRef.current = newFloors;
        };
        intervalRef.current = window.setInterval(decrementEstimates, 1000);
        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [setFloors]);

    function updateElevators(elevators: IElevator[]) {
        setElevators(elevators);
        elevatorsRef.current = elevators;
    }

    function updateFloors(floors: IFloor[]) {
        setFloors(floors);
        floorsRef.current = floors;
    }

    useEffect(() => {
        return () => {
            Object.values(timersRef.current).flat().forEach(timerId => {
                clearTimeout(timerId);
            });
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return { callElevator };
}