export type ElevatorAction =
    | { type: 'SET_ELEVATOR_MOVING'; elevatorIndex: number; isMoving: boolean }
    | { type: 'SET_ELEVATOR_BOTTOM'; elevatorIndex: number; bottom: number }
    | { type: 'SET_ELEVATOR_CURRENT_FLOOR'; elevatorIndex: number; currentFloor: number }
    | { type: 'REMOVE_ELEVATOR_TARGET'; elevatorIndex: number; floorIndex: number }
    | { type: 'SET_FLOOR_STATUS'; floorIndex: number; status: 'Call' | 'Waiting' | 'Arrived' }
    | { type: 'SET_FLOOR_ESTIMATED'; floorIndex: number; estimated: number }
    | { type: 'ADD_ELEVATOR_TARGET'; elevatorIndex: number; targetFloor: number };

export function elevatorReducer(
    elevators: IElevator[],
    action: ElevatorAction
): IElevator[] {
    switch (action.type) {
        case 'SET_ELEVATOR_MOVING':
            return elevators.map((elevator, index) =>
                index === action.elevatorIndex
                    ? { ...elevator, isMoving: action.isMoving }
                    : elevator
            );
        case 'SET_ELEVATOR_BOTTOM':
            return elevators.map((elevator, index) =>
                index === action.elevatorIndex
                    ? { ...elevator, bottom: action.bottom }
                    : elevator
            );
        case 'SET_ELEVATOR_CURRENT_FLOOR':
            return elevators.map((elevator, index) =>
                index === action.elevatorIndex
                    ? { ...elevator, currentFloor: action.currentFloor }
                    : elevator
            );
        case 'REMOVE_ELEVATOR_TARGET':
            return elevators.map((elevator, index) =>
                index === action.elevatorIndex
                    ? {
                        ...elevator,
                        targetFloors: elevator.targetFloors.filter(
                            (target) => target !== action.floorIndex
                        ),
                    }
                    : elevator
            );
        case 'ADD_ELEVATOR_TARGET':
            return elevators.map((elevator, index) =>
                index === action.elevatorIndex
                    ? { ...elevator, targetFloors: [...elevator.targetFloors, action.targetFloor] }
                    : elevator
            );
        default:
            return elevators;
    }
}

export type FloorAction =
    | { type: 'SET_FLOOR_STATUS'; floorIndex: number; status: 'Call' | 'Waiting' | 'Arrived' }
    | { type: 'SET_FLOOR_ESTIMATED'; floorIndex: number; estimated: number };

export function floorReducer(floors: IFloor[], action: FloorAction): IFloor[] {
    switch (action.type) {
        case 'SET_FLOOR_STATUS':
            return floors.map((floor, index) =>
                index === action.floorIndex ? { ...floor, status: action.status } : floor
            );
        case 'SET_FLOOR_ESTIMATED':
            return floors.map((floor, index) =>
                index === action.floorIndex ? { ...floor, estimated: action.estimated } : floor
            );
        default:
            return floors;
    }
}
