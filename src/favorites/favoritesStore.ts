type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> };
const KEY = 'joybit.guestFavorites';

export class FavoritesStore {
  private ids: string[] = [];
  private loaded = false;
  private listeners = new Set<(ids: string[]) => void>();
  constructor(private readonly storage: Storage) {}

  async load(): Promise<string[]> {
    if (!this.loaded) {
      const saved = await this.storage.getItem(KEY);
      try {
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        this.ids = Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === 'string'))] : [];
      } catch { this.ids = []; }
      this.loaded = true;
    }
    return [...this.ids];
  }

  async toggle(id: string): Promise<string[]> {
    await this.load();
    const next = this.ids.includes(id) ? this.ids.filter((item) => item !== id) : [...this.ids, id];
    await this.storage.setItem(KEY, JSON.stringify(next));
    this.ids = next;
    this.listeners.forEach((listener) => listener([...next]));
    return [...next];
  }

  async replace(ids: string[]): Promise<string[]> {
    const next = [...new Set(ids)];
    await this.storage.setItem(KEY, JSON.stringify(next));
    this.ids = next;
    this.loaded = true;
    this.listeners.forEach((listener) => listener([...next]));
    return [...next];
  }

  subscribe(listener: (ids: string[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
