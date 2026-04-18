PACOTE PARA TRANSFORMAR PRACTICE EM MISTAKES

O que este arquivo faz:
- reaproveita a rota/page Practice
- troca a lógica da página para Mistakes
- usa lições já concluídas
- cria cartões por skill:
  grammar, reading, listening, vocabulary, writing, speaking
- permite filtro por tipo e busca
- empurra o aluno para:
  Review, Learn e Speaking

COMO USAR:
1. Abra src/pages/Practice.tsx
2. Apague tudo
3. Cole o conteúdo do novo Practice.tsx deste pacote
4. Salve
5. Faça commit
6. Rode o deploy
7. Atualize o navegador com Ctrl+F5

SE QUISER DEIXAR O NOME CERTO NO MENU:
No arquivo App.tsx ou no arquivo da sidebar/menu,
troque o label:
- de Practice
- para Mistakes

Se a rota já for /practice, pode manter por enquanto.
Se quiser depois, você pode renomear a rota para /mistakes.
