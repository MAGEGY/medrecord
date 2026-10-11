import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

export interface HelpFunction {
  label: string
  description: string
  action: () => void
}

export interface HelpHowTo {
  title: string
  body: string
}

interface Props {
  functions: HelpFunction[]
  howtos?: HelpHowTo[]
  color?: string
}

// Floating help: circular button (bottom-right) opens a searchable panel
// listing the app's functions (tap = navigate/act) and how-to guides.
// Same UX as the PharmaPOS help search.
export default function FloatingHelp({ functions, howtos = [], color = '#0e7490' }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setExpanded(null)
    }
  }, [open])

  const needle = query.trim().toLowerCase()
  const hit = (...texts: string[]) =>
    !needle || texts.some((x) => x.toLowerCase().includes(needle))
  const fns = functions.filter((f) => hit(f.label, f.description))
  const guides = howtos.filter((h) => hit(h.title, h.body))

  return (
    <>
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityLabel="Help & Guide"
          style={({ pressed }) => [styles.fab, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.fabText}>?</Text>
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Help & Guide</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search functions and how-to..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
              {fns.length === 0 && guides.length === 0 && (
                <Text style={styles.noResults}>No results</Text>
              )}

              {fns.length > 0 && (
                <>
                  <Text style={styles.section}>FUNCTIONS</Text>
                  {fns.map((f) => (
                    <Pressable
                      key={f.label}
                      onPress={() => { setOpen(false); f.action() }}
                      style={({ pressed }) => [styles.fnRow, pressed && styles.fnRowPressed]}
                    >
                      <Text style={[styles.fnLabel, { color }]}>{f.label}</Text>
                      <Text style={styles.fnDesc}>{f.description}</Text>
                    </Pressable>
                  ))}
                </>
              )}

              {guides.length > 0 && (
                <>
                  <Text style={[styles.section, styles.sectionGap]}>HOW-TO</Text>
                  {guides.map((h) => {
                    const isOpen = expanded === h.title
                    return (
                      <View key={h.title} style={styles.howto}>
                        <Pressable
                          onPress={() => setExpanded(isOpen ? null : h.title)}
                          style={styles.howtoBtn}
                        >
                          <Text style={styles.howtoTitle}>{h.title}</Text>
                          <Text style={styles.plus}>{isOpen ? '−' : '+'}</Text>
                        </Pressable>
                        {isOpen && <Text style={styles.howtoBody}>{h.body}</Text>}
                      </View>
                    )
                  })}
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', bottom: 24, right: 20, zIndex: 100, elevation: 100 },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
    maxHeight: '85%', overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  close: { fontSize: 20, color: '#94a3b8', padding: 4 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  input: {
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 14, color: '#1e293b', backgroundColor: '#fff',
  },
  body: { paddingHorizontal: 16, paddingVertical: 12 },
  noResults: { textAlign: 'center', color: '#94a3b8', paddingVertical: 24 },
  section: { fontSize: 11, color: '#94a3b8', letterSpacing: 1, fontWeight: '700', marginBottom: 8 },
  sectionGap: { marginTop: 16 },
  fnRow: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8 },
  fnRowPressed: { backgroundColor: '#f1f5f9' },
  fnLabel: { fontWeight: '600', fontSize: 14 },
  fnDesc: { color: '#64748b', fontSize: 13, marginTop: 2 },
  howto: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  howtoBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 10,
  },
  howtoTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', flex: 1 },
  plus: { color: '#94a3b8', fontSize: 16 },
  howtoBody: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, lineHeight: 20, color: '#475569' },
})
