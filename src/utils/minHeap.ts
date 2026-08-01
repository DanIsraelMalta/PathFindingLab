export interface HeapItem<T> {
  key: number;
  priorityKey2?: number; // Secondary key for tie-breaking (e.g., in D* Lite tuple comparisons)
  value: T;
}

export class MinHeap<T> {
  private heap: HeapItem<T>[] = [];

  constructor() {}

  public get size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public clear(): void {
    this.heap = [];
  }

  public insert(value: T, key: number, priorityKey2: number = 0): void {
    this.heap.push({ value, key, priorityKey2 });
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): HeapItem<T> | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return min;
  }

  public peek(): HeapItem<T> | undefined {
    return this.heap[0];
  }

  private compare(a: HeapItem<T>, b: HeapItem<T>): number {
    if (a.key !== b.key) {
      return a.key - b.key;
    }
    return (a.priorityKey2 ?? 0) - (b.priorityKey2 ?? 0);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;

      if (
        leftIndex < length &&
        this.compare(this.heap[leftIndex], this.heap[smallest]) < 0
      ) {
        smallest = leftIndex;
      }
      if (
        rightIndex < length &&
        this.compare(this.heap[rightIndex], this.heap[smallest]) < 0
      ) {
        smallest = rightIndex;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
