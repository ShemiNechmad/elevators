const timeBetweenFloors = 5000;
const timeOpenDoor = 2000;

export function chooseClosestElevator(floors: IFloor[], elevators: IElevator[], requestedFloor: number): { elevatorIndex: number, estimated: number } {
    let bestElevatorIndex = -1;
    let minTime = Infinity;
    elevators.forEach((elevator, idx) => {
        const lastFloor =
            elevator.targetFloors.length > 0
                ? elevator.targetFloors[elevator.targetFloors.length - 1]
                : elevator.currentFloor;
        const waitingTime = floors[lastFloor]?.estimated || 0;
        const travelTime = Math.abs(requestedFloor - lastFloor) * 5;
        const totalEstimated = waitingTime + travelTime + 2;
        if (totalEstimated < minTime) {
            minTime = totalEstimated;
            bestElevatorIndex = idx;
        }
    });
    return { elevatorIndex: bestElevatorIndex, estimated: minTime };
}

export function formatTime(totalSeconds: number): string {
    if (totalSeconds < 60) {
        return `${totalSeconds} sec.`;
    } else {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let timeString = `${minutes} min.`;

        if (seconds > 0) {
            timeString += ` ${seconds} sec.`;
        }

        return timeString;
    }
}