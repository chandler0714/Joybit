import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { localizedGameTitle, type Game } from '../catalog/catalog';
import { formatPlayedCount } from '../catalog/formatPlayedCount';
import { useLanguage } from '../i18n/LanguageProvider';

type Props = { game: Game; favorite: boolean; onOpen(): void; onToggleFavorite(): void };

function Cover({ game, title, coverLabel }: { game: Game; title: string; coverLabel: string }) {
  if (game.coverKey === 'steady-drop') return <Image source={require('../../assets/steady-drop.png')} style={s.image} accessibilityLabel={coverLabel} />;
  const colors = { reaction: '#F47A66', memory: '#7768BD', puzzle: '#54A9AC' };
  return <View style={[s.art, { backgroundColor: colors[game.coverKey] }]} accessibilityLabel={coverLabel}>
    <View style={s.artGlow} />
    {game.coverKey === 'reaction' ? <View style={s.target}><View style={s.targetInner} /></View>
      : game.coverKey === 'memory' ? <View style={s.tileRow}><View style={s.memoryTile}><Text style={s.memorySymbol}>✦</Text></View><View style={s.memoryTile}><Text style={s.memorySymbol}>✦</Text></View></View>
        : <View style={s.tileRow}><View style={s.puzzleTile}><Text style={s.puzzleNumber}>1</Text></View><View style={s.puzzleTile}><Text style={s.puzzleNumber}>2</Text></View><View style={s.puzzleTile}><Text style={s.puzzleNumber}>3</Text></View></View>}
    <Text style={s.artCaption}>{title}</Text>
  </View>;
}

export function GameCard({ game, favorite, onOpen, onToggleFavorite }: Props) {
  const { locale, t } = useLanguage();
  const title = localizedGameTitle(game, locale);
  const count = formatPlayedCount(game.playedCount, locale);
  return <Pressable testID={`game-card-${game.id}`} style={s.card} onPress={onOpen} accessibilityLabel={t('openGame', { game: title })}>
    <View style={s.imageWrap}><Cover game={game} title={t('coverEyebrow')} coverLabel={t('coverImage', { game: title })} />
      <Pressable onPress={(event) => { event.stopPropagation(); onToggleFavorite(); }} accessibilityLabel={t(favorite ? 'uncollectGame' : 'collectGame', { game: title })} accessibilityRole="button" style={s.favorite}>
        <Text style={[s.heart, favorite && s.heartActive]}>{favorite ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
    <View style={s.info}><Text style={s.title} numberOfLines={2}>{title}</Text>{count !== null && <Text style={s.count}>{t('playedBy', { count })}</Text>}</View>
  </Pressable>;
}

const s = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden', borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EEF1' },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#173B40' },
  image: { width: '100%', height: '100%' },
  art: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artGlow: { position: 'absolute', width: '90%', height: '90%', borderRadius: 999, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', top: '5%' },
  target: { width: 96, height: 96, borderRadius: 48, borderWidth: 11, borderColor: '#FFF1DF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  targetInner: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#FFF1DF' },
  tileRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  memoryTile: { width: 55, height: 65, borderRadius: 12, backgroundColor: '#FDF2D6', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-10deg' }] },
  memorySymbol: { color: '#E07D92', fontSize: 38, fontWeight: '800' },
  puzzleTile: { width: 37, height: 42, borderRadius: 9, backgroundColor: '#EDFAF2', alignItems: 'center', justifyContent: 'center' },
  puzzleNumber: { color: '#25717D', fontSize: 24, fontWeight: '900' },
  artCaption: { position: 'absolute', bottom: 12, left: 14, color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  favorite: { position: 'absolute', top: 9, right: 9, width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.93)', alignItems: 'center', justifyContent: 'center' },
  heart: { color: '#546B78', fontSize: 24, lineHeight: 29 },
  heartActive: { color: '#F17872' },
  info: { minHeight: 74, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 11 },
  title: { color: '#253B4A', fontSize: 14, fontWeight: '800' },
  count: { color: '#8B9CA7', fontSize: 11, marginTop: 5 },
});
