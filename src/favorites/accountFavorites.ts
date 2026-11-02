import { FavoritesStore } from './favoritesStore';
import { syncFavorites, setCloudFavorite, type FavoriteRemote } from './syncFavorites';

type Session = { user: { id: string }; access_token: string };
export type AccountFavoritesState = { ids: string[]; status: 'idle' | 'syncing' | 'ready' | 'error' };
type Scope = { generation: number; session: Session; queue: Promise<void> };

export class AccountFavorites {
  private state: AccountFavoritesState = { ids: [], status: 'idle' };
  private generation = 0;
  private scope: Scope | null = null;

  constructor(
    private readonly guest: FavoritesStore,
    private readonly remote: FavoriteRemote,
    private readonly onChange: (state: AccountFavoritesState) => void = () => {},
  ) {}

  snapshot(): AccountFavoritesState { return { ids: [...this.state.ids], status: this.state.status }; }

  private emit(state: AccountFavoritesState) {
    this.state = { ids: [...state.ids], status: state.status };
    this.onChange(this.snapshot());
  }

  private active(scope: Scope) { return this.scope === scope && this.generation === scope.generation; }

  private enqueue(scope: Scope, operation: () => Promise<void>): Promise<void> {
    const next = scope.queue.then(operation);
    scope.queue = next.then(() => {}, () => {});
    return next;
  }

  setSession(session: Session | null): Promise<void> {
    if (session && this.scope?.session.user.id === session.user.id) {
      const changedToken = this.scope.session.access_token !== session.access_token;
      this.scope.session = session;
      return changedToken && this.state.status === 'error' ? this.retry() : Promise.resolve();
    }
    this.generation += 1;
    if (!session) { this.scope = null; this.emit({ ids: [], status: 'idle' }); return Promise.resolve(); }
    const scope: Scope = { generation: this.generation, session, queue: Promise.resolve() };
    this.scope = scope;
    this.emit({ ids: [], status: 'syncing' });
    return this.enqueue(scope, () => this.synchronize(scope));
  }

  private async synchronize(scope: Scope): Promise<void> {
    if (!this.active(scope)) return;
    this.emit({ ids: this.state.ids, status: 'syncing' });
    try {
      const local = await this.guest.load();
      const { user, access_token } = scope.session;
      const ids = await syncFavorites(local, user.id, access_token, this.remote);
      if (!this.active(scope)) return;
      await this.guest.replace([]);
      if (this.active(scope)) this.emit({ ids, status: 'ready' });
    } catch {
      if (this.active(scope)) this.emit({ ids: this.state.ids, status: 'error' });
    }
  }

  retry(): Promise<void> {
    const scope = this.scope;
    if (!scope) return Promise.resolve();
    return this.enqueue(scope, () => this.synchronize(scope));
  }

  toggle(gameId: string): Promise<void> {
    const scope = this.scope;
    if (!scope) return Promise.reject(new Error('请先登录'));
    return this.enqueue(scope, async () => {
      if (!this.active(scope)) return;
      if (this.state.status !== 'ready') await this.synchronize(scope);
      if (!this.active(scope)) return;
      if (this.state.status !== 'ready') throw new Error('收藏同步失败，请重试');
      const selected = !this.state.ids.includes(gameId);
      const { user, access_token } = scope.session;
      await setCloudFavorite(user.id, gameId, selected, this.remote, access_token);
      if (!this.active(scope)) return;
      this.emit({ ids: selected ? [...new Set([...this.state.ids, gameId])] : this.state.ids.filter(id => id !== gameId), status: 'ready' });
    });
  }
}
