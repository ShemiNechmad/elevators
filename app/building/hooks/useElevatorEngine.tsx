import { useRef, useCallback } from "react";
import { useMain } from "@/app/context/MainContext";
import { chooseClosestElevator } from "./utils";
import { elevatorReducer, floorReducer } from "./elevatorReducer";

export function useElevatorEngine() {
    const { elevators, setElevators, floors, setFloors } = useMain();
    const elevatorsRef = useRef(elevators);
    const floorsRef = useRef(floors);
    elevatorsRef.current = elevators;
    floorsRef.current = floors;

    function callElevator(floorIndex: number) {
        let F = [...floorsRef.current];
        let E = [...elevatorsRef.current];
        F = changeFloorStatus(F, floorIndex, 'Waiting');
        let { elevatorIndex, estimated } = chooseClosestElevator(F, E, floorIndex);
        F = changeFloorEstimated(F, floorIndex, estimated);
        E = changeElevatorTargets(E, elevatorIndex, floorIndex);
        setElevators(E);
        elevatorsRef.current = E;
        setFloors(F);
        floorsRef.current = F;
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
        setElevators(movingElevators);
        elevatorsRef.current = movingElevators;

        setTimeout(() => {
            const freshElevators = elevatorsRef.current;
            const freshFloors = floorsRef.current;

            let arrivedFloors = floorReducer(freshFloors, {
                type: 'SET_FLOOR_STATUS',
                floorIndex,
                status: 'Arrived',
            });
            setFloors(arrivedFloors);
            floorsRef.current = arrivedFloors;

            let arrivedElevators = elevatorReducer(freshElevators, {
                type: 'SET_ELEVATOR_CURRENT_FLOOR',
                elevatorIndex,
                currentFloor: floorIndex,
            });
            setElevators(arrivedElevators);
            elevatorsRef.current = arrivedElevators;

            setTimeout(() => {
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

                setElevators(resetElevators);
                elevatorsRef.current = resetElevators;
                setFloors(resetFloors);
                floorsRef.current = resetFloors;

                processNextFloor(elevatorIndex);
            }, 2000);
        }, estimatedTime * 1000);
    }, [setElevators, setFloors]);

    return { callElevator };
}