import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Game } from '../catalog/catalog';
import { formatPlayedCount } from '../catalog/formatPlayedCount';

const covers = { 'steady-drop': require('../../assets/steady-drop.png') };
type Props = { game: Game; favorite: boolean; onOpen(): void; onToggleFavorite(): void };

export function GameCard({ game, favorite, onOpen, onToggleFavorite }: Props) {
  const count = formatPlayedCount(game.playedCount);
  return <Pressable testID={`game-card-${game.id}`} style={s.card} onPress={onOpen} accessibilityLabel={`打开 ${game.title}`}>
    <View style={s.imageWrap}><Image source={covers[game.coverKey]} style={s.image} accessibilityLabel={`${game.title} 主图`} />
      <Pressable onPress={(event) => { event.stopPropagation(); onToggleFavorite(); }} accessibilityLabel={`${favorite ? '取消收藏' : '收藏'} ${game.title}`} accessibilityRole="button" style={s.favorite}>
        <Text style={[s.heart, favorite && s.heartActive]}>{favorite ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
    <View style={s.info}><Text style={s.title} numberOfLines={1}>{game.title}</Text>{count !== null && <Text style={s.count}>{count} 人玩过</Text>}</View>
  </Pressable>;
}

const s = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden', borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EEF1' },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#173B40' },
  image: { width: '100%', height: '100%' },
  favorite: { position: 'absolute', top: 9, right: 9, width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.93)', alignItems: 'center', justifyContent: 'center' },
  heart: { color: '#546B78', fontSize: 24, lineHeight: 29 },
  heartActive: { color: '#F17872' },
  info: { minHeight: 62, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 11 },
  title: { color: '#253B4A', fontSize: 14, fontWeight: '800' },
  count: { color: '#8B9CA7', fontSize: 11, marginTop: 5 },
});
