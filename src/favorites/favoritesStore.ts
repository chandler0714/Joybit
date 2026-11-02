type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> };
const KEY = 'joybit.guestFavorites';

export class FavoritesStore {
  private ids: string[] = [];
  private loaded = false;
  private loading: Promise<void> | null = null;
  private mutation: Promise<void> = Promise.resolve();
  private listeners = new Set<(ids: string[]) => void>();
  constructor(private readonly storage: Storage) {}

  async load(): Promise<string[]> {
    await this.mutation;
    await this.read();
    return [...this.ids];
  }

  private async read(): Promise<void> {
    if (!this.loaded) {
      if (!this.loading) this.loading = this.storage.getItem(KEY).then(saved => {
        try {
          const parsed: unknown = saved ? JSON.parse(saved) : [];
          this.ids = Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string'))] : [];
        } catch { this.ids = []; }
        this.loaded = true;
      }).finally(() => { this.loading = null; });
      await this.loading;
    }
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.mutation.then(operation);
    this.mutation = next.then(() => {}, () => {});
    return next;
  }

  async toggle(id: string): Promise<string[]> {
    return this.enqueue(async () => {
      await this.read();
      const next = this.ids.includes(id) ? this.ids.filter((item) => item !== id) : [...this.ids, id];
      await this.storage.setItem(KEY, JSON.stringify(next));
      this.ids = next;
      this.listeners.forEach((listener) => listener([...next]));
      return [...next];
    });
  }

  async replace(ids: string[]): Promise<string[]> {
    return this.enqueue(async () => {
      await this.read();
      const next = [...new Set(ids)];
      await this.storage.setItem(KEY, JSON.stringify(next));
      this.ids = next;
      this.loaded = true;
      this.listeners.forEach((listener) => listener([...next]));
      return [...next];
    });
  }

  subscribe(listener: (ids: string[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
