interface IFloor {
    status: 'Call' | 'Waiting' | 'Arrived';
    estimated: number;
}

interface IElevator {
    currentFloor: number;
    targetFloors: number[];
    bottom: number;
    isMoving: boolean;
}