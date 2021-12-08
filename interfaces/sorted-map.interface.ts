export default interface SortedMapInterface<T> {
    pushItem(item: T): void;
    shiftItem(): T | undefined;
    getMapSize(): number;
}
