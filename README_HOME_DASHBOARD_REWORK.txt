PACOTE NOVO PARA HOME / DASHBOARD

Objetivo:
- remover AI Chat da navegação principal
- remover Stats da navegação principal
- colocar abas que realmente ajudam o aluno a estudar

NAVEGAÇÃO RECOMENDADA:
Home | Learn | Review | Speaking | Profile

ARQUIVOS INCLUSOS:
- src/pages/Home.tsx
- src/pages/Review.tsx
- src/pages/Speaking.tsx
- tabs-config-example.txt
- routes-example.txt

ORDEM CERTA PARA NÃO ERRAR:

1. Faça backup dos arquivos atuais do projeto
2. Copie os 3 arquivos da pasta src/pages para o seu projeto
3. Abra o arquivo de rotas do projeto
4. Adicione as rotas novas
5. Abra o arquivo da navegação / menu / sidebar / bottom tabs
6. Remova:
   - AI Chat
   - Stats
7. Adicione:
   - Review
   - Speaking
8. Deixe a ordem final assim:
   - Home
   - Learn
   - Review
   - Speaking
   - Profile
9. Faça commit
10. Rode o deploy
11. Teste a navegação inteira

O QUE CADA ABA FAZ:

HOME
- continuar do próximo dia
- mostrar progresso do nível
- mostrar missão do dia
- atalhos para Learn, Review e Speaking

REVIEW
- pega lições concluídas
- mostra grammar, vocabulary, reading e writing da lição
- substitui muito melhor a aba Stats

SPEAKING
- pega prompts de speaking das lições já concluídas
- toca frase modelo em TTS
- grava voz
- mostra transcript
- dá feedback simples por keywords
- substitui muito melhor a aba AI Chat

IMPORTANTE:
- Eu usei os mesmos caminhos do seu projeto que já apareceram antes:
  - ../lib/supabase
  - ../context/AuthContext
- Se o seu arquivo de rotas ou menu tiver outro nome, não tem problema:
  você só precisa copiar a lógica dos exemplos e encaixar no arquivo certo.

TESTE CERTO DEPOIS DO DEPLOY:
1. abrir Home
2. ver se aparece próximo dia e progresso
3. abrir Review
4. ver se aparecem lições concluídas
5. abrir Speaking
6. ver se aparecem prompts de speaking de lições já concluídas
7. confirmar que AI Chat e Stats saíram da navegação
