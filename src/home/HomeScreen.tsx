import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Game } from '../catalog/catalog';
import { AdSlot } from './AdSlot';
import { Drawer, type DrawerPanel } from './Drawer';
import { GameCard } from './GameCard';

type Panel = 'home' | DrawerPanel;
type Props = { games: readonly Game[]; favoriteIds: string[]; onToggleFavorite(id: string): void; onOpenGame(id: string): void; account: { displayName: string } | null };

export function HomeScreen({ games, favoriteIds, onToggleFavorite, onOpenGame, account }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('home');
  const visibleGames = panel === 'favorites' ? games.filter((game) => favoriteIds.includes(game.id)) : games;
  const title = panel === 'home' ? '精选游戏' : panel === 'favorites' ? '我的收藏' : panel === 'profile' ? '用户信息' : '设置';

  function openPanel(next: DrawerPanel) { setPanel(next); setDrawerOpen(false); }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}>
      {panel === 'home' ? <Pressable style={s.headerButton} onPress={() => setDrawerOpen(true)} accessibilityLabel="打开菜单">
        <View style={s.menuLine} /><View style={s.menuLine} /><View style={s.menuLineShort} />
      </Pressable> : <Pressable style={s.headerButton} onPress={() => setPanel('home')} accessibilityLabel="返回游戏列表"><Text style={s.backText}>‹</Text></Pressable>}
      <Text style={s.brand}>Joybit<Text style={s.brandDot}>.</Text></Text><View style={s.headerButton} />
    </View>
    <View style={s.content}>
      <Text style={s.eyebrow}>PICK UP & PLAY</Text><Text style={s.heading}>{title}</Text>
      {panel === 'profile' ? <View style={s.panelCard}><Text style={s.panelTitle}>{account?.displayName ?? '访客'}</Text><Text style={s.panelDetail}>{account ? '欢迎来到 Joybit' : '登录后可同步收藏并进入游戏'}</Text></View>
        : panel === 'settings' ? <View style={s.panelCard}><Text style={s.panelTitle}>关于 Joybit</Text><Text style={s.panelDetail}>小游戏，一点就开玩。</Text></View>
        : <FlatList testID="game-grid" data={visibleGames} numColumns={2} keyExtractor={(game) => game.id}
            columnWrapperStyle={s.row} contentContainerStyle={s.grid}
            renderItem={({ item }) => <View style={{ width: cardWidth }}><GameCard game={item} favorite={favoriteIds.includes(item.id)} onOpen={() => onOpenGame(item.id)} onToggleFavorite={() => onToggleFavorite(item.id)} /></View>}
            ListEmptyComponent={<Text style={s.empty}>这里还没有收藏的游戏</Text>} />}
    </View>
    {!drawerOpen && <AdSlot />}
    {drawerOpen && <Drawer account={account} onClose={() => setDrawerOpen(false)} onSelect={openPanel} />}
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F8' },
  header: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17 },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start', gap: 5 },
  menuLine: { width: 21, height: 2, backgroundColor: '#304653', borderRadius: 2 },
  menuLineShort: { width: 15, height: 2, backgroundColor: '#304653', borderRadius: 2 },
  backText: { color: '#304653', fontSize: 36, lineHeight: 40 },
  brand: { color: '#1A2C3D', fontSize: 25, fontWeight: '900', letterSpacing: -1.4 },
  brandDot: { color: '#F6B94F' },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  eyebrow: { color: '#78AEB1', fontSize: 10, fontWeight: '900', letterSpacing: 2.2 },
  heading: { color: '#1C3545', fontSize: 28, fontWeight: '900', marginTop: 5, marginBottom: 20, letterSpacing: -0.8 },
  row: { gap: 12, marginBottom: 12 },
  grid: { paddingBottom: 18 },
  empty: { color: '#94A5AE', fontSize: 14, textAlign: 'center', marginTop: 80 },
  panelCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#E9EEF1' },
  panelTitle: { color: '#1C3545', fontSize: 17, fontWeight: '800' },
  panelDetail: { color: '#81939D', fontSize: 13, marginTop: 8 },
});
