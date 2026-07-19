# Migrationsplan: LogPress von React Native zu Vue PWA

**Ausgangslage:** React-Native-App (iOS & Android), kein Mac/Xcode/Apple Developer Account vorhanden. Ziel: Umbau zu einer Progressive Web App, die auf dem iPhone über "Zum Home-Bildschirm hinzufügen" installierbar ist.

**Entscheidung:** Kein Cloud-Mac-Rental, kein Codemagic/EAS-Build – stattdessen vollständiger Umbau zu Vue 3 PWA, da keine App-Store-Distribution geplant ist und Adapty (Payment) ohnehin entfällt.

---

## 1. Tech-Stack-Mapping

| Bereich | React Native (alt) | Vue PWA (neu) | Aufwand |
|---|---|---|---|
| Framework | React Native 0.80 / React 19 | Vue 3 + Vite | mittel |
| State Management | Redux Toolkit | Pinia | gering |
| Navigation | React Navigation 7 | Vue Router | gering |
| Backend / Auth | Supabase | **unverändert** (Supabase JS SDK) | keiner |
| AI | OpenAI API (direkt) | Requesty (OpenAI-kompatible API, nur `base_url` + Key ändern) | gering |
| Subscriptions | Adapty | **entfällt komplett** | – |
| Analytics | Firebase Analytics (RN SDK) | Firebase Analytics (Web SDK) | gering |
| UI | styled-components, Lottie, react-native-svg | CSS/SCSS oder Tailwind, lottie-web | mittel |
| i18n | i18next / react-i18next | i18next / i18next-vue (oder vue-i18n) | gering |
| Offline-Mode | eigenes `OFFLINE_MODE`-Flag | Service Worker + IndexedDB (z. B. Dexie.js) | mittel |

---

## 2. Requesty-Integration

Requesty ist ein API-kompatibler Drop-in-Ersatz für den OpenAI-Client. Die bestehende Prompt-Logik und das Response-Parsing für den Fitness-Score bleiben unverändert – es ändert sich nur die Client-Konfiguration:

```js
// vorher
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// nachher
const openai = new OpenAI({
  baseURL: 'https://router.requesty.ai/v1', // oder router.eu.requesty.ai für EU-Hosting
  apiKey: process.env.REQUESTY_API_KEY,
});
```

**Sicherheit:** Der Requesty-API-Key darf nicht im Frontend-Bundle landen. Der Call läuft über eine Supabase Edge Function, die den Key serverseitig hält und die Anfrage an Requesty weiterreicht.

---

## 3. Architektur der PWA

```
├── src/
│   ├── main.ts                 # Vue-App-Bootstrap
│   ├── router/                 # Vue Router Config
│   ├── stores/                 # Pinia Stores (statt Redux Slices)
│   ├── services/
│   │   ├── supabase.ts         # Supabase Client (Auth, DB)
│   │   └── ai.ts               # Call zur Supabase Edge Function (AI-Score)
│   ├── composables/            # Vue Composables (Custom Hooks Ersatz)
│   ├── views/                  # Seiten-Komponenten
│   └── components/             # Wiederverwendbare UI-Komponenten
├── public/
│   ├── manifest.json           # Web App Manifest (Icons, display: standalone)
│   └── icons/
├── supabase/
│   └── functions/
│       └── ai-score/           # Edge Function: proxied Requesty-Call
└── vite.config.ts              # vite-plugin-pwa Konfiguration
```

---

## 4. Migrationsschritte

1. **Projekt-Setup**: Vite + Vue 3 + TypeScript + Pinia + Vue Router aufsetzen
2. **PWA-Grundgerüst**: `vite-plugin-pwa` einrichten, `manifest.json` mit Icons (verschiedene Größen für iOS Home-Screen), Service Worker Basiskonfiguration
3. **Supabase-Integration**: bestehende Supabase-Config (URL, Anon Key) 1:1 übernehmen, Auth-Flow auf Web umstellen (Supabase Auth funktioniert identisch im Browser)
4. **Datenmodell & Pinia-Stores**: Redux-Slices in Pinia-Stores überführen (Workouts, User-Profil, Statistiken)
5. **UI-Komponenten neu bauen**: Screens aus der RN-App (Onboarding, Workout-Logging, Statistiken) als Vue-Komponenten, Styling auf CSS/Tailwind umstellen
6. **AI-Score-Feature**: Supabase Edge Function für Requesty-Call erstellen, Frontend ruft nur die Edge Function auf
7. **Offline-Mode**: Service Worker Caching-Strategie + IndexedDB (Dexie.js) für lokale Workout-Daten, angelehnt an das bestehende `OFFLINE_MODE`-Konzept
8. **Firebase Analytics**: Web SDK einbinden
9. **i18n**: bestehende Übersetzungsdateien wiederverwenden, auf i18next-vue umstellen
10. **Testing auf iPhone**: PWA über Safari "Zum Home-Bildschirm hinzufügen" installieren, Push-Notifications (ab iOS 16.4 möglich, mit Einschränkungen) und Offline-Verhalten prüfen

---

## 5. Was entfällt / was sich ändert

- **Adapty & Paywall**: komplett raus, keine Ersatzlösung nötig, da nicht kommerziell
- **Push Notifications**: funktionieren über Web Push ab iOS 16.4, aber nur wenn die PWA zum Home-Bildschirm hinzugefügt wurde, mit gewissen Einschränkungen gegenüber nativen Push-Notifications
- **App-Store-Distribution**: entfällt, dafür kein Apple Developer Account nötig
