LOTE 1 - PLAYER ESTILO DUOLINGO/BUSUU

O que tem aqui:
- LessonPlayerDemo.tsx
- ChallengeRenderer.tsx
- 4 componentes por skill:
  - ReadingChallenge
  - ListeningChallenge
  - SpeakingChallenge
  - WritingChallenge
- sampleLesson.ts com 1 dia de exemplo

O que esse lote prova:
- uma atividade por vez
- barra de progresso
- XP por fluxo
- listening com TTS nativo
- speaking com Web Speech API
- writing com textarea e mínimo de palavras

Como testar:
1. Copie a pasta src/components/lesson-player para seu projeto
2. Importe LessonPlayerDemo.tsx em uma rota ou página de teste
3. Renderize <LessonPlayerDemo />

Se você gostar deste formato, o próximo lote pode ser:
- integração com seu banco
- salvar progresso real
- ligar ao A1 dia 1-5
- trocar demo por conteúdo do Supabase
