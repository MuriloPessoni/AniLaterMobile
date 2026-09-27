import { StyleSheet } from 'react-native';

export const colors = {
  background: '#f5f7fb', ink: '#18243b', muted: '#66758e', primary: '#3056d3',
  border: '#dce3ee', white: '#ffffff', danger: '#bb3e45', soft: '#eaf0ff',
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  label: { color: colors.ink, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.ink, marginBottom: 16 },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12, minHeight: 52 },
  buttonText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  secondaryButton: { backgroundColor: colors.soft },
  secondaryText: { color: colors.primary },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardRow: { flexDirection: 'row', gap: 14 },
  cover: { width: 95, height: 133, borderRadius: 10, backgroundColor: colors.soft },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, color: colors.ink, fontWeight: '800', marginBottom: 8 },
  meta: { color: colors.muted, fontSize: 14, marginBottom: 5, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  smallButton: { flex: 1, backgroundColor: colors.soft, borderRadius: 10, padding: 11, alignItems: 'center' },
  smallText: { color: colors.primary, fontWeight: '800' },
});
