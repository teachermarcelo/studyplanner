PACOTE DE DESBLOQUEIO DO A2

O que este pacote faz:
- atualiza o Learn.tsx
- mantém a base estável
- adiciona mensagem de conclusão forte no Day 45 do A1
- desbloqueia automaticamente o nível A2 ao finalizar o Day 45
- atualiza profile.level para A2
- impede abertura de A2 se o profile ainda estiver em A1
- mostra celebração especial no final do A1

COMO USAR:
1. Abra src/pages/Learn.tsx
2. Apague tudo
3. Cole o novo Learn.tsx deste pacote
4. Salve
5. Faça commit
6. Rode o deploy
7. Atualize o navegador com Ctrl+F5

FLUXO ESPERADO:
- aluno termina A1 Day 45
- tela de celebração mostra A1 Complete
- ao voltar, o profile.level vira A2
- o Learn passa a carregar as lições do A2 automaticamente
- se o usuário ainda for A1, o A2 continua bloqueado

IMPORTANTE:
Para o A2 aparecer de verdade na trilha, o banco precisa ter lições cadastradas com:
level = 'A2'

Se ainda não existirem lições A2 no banco, o desbloqueio do nível funciona,
mas a trilha do A2 vai ficar vazia até você subir os dias do A2.
