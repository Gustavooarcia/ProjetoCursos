# Relatório técnico — Encontro 01

## 1. Identificação

**Projeto:** Sistema Web de Gestão de Cursos  
**Encontro:** 01 — Supabase + PostgreSQL + CRUD  
**Aluno/grupo:** preencher  
**Data:** preencher  

## 2. Objetivo

O objetivo desta etapa é construir a base persistente do sistema, modelar as entidades principais e implementar um CRUD de alunos consumido por uma página web.

## 3. Pesquisa orientada

### O que é BaaS?

Escreva com suas próprias palavras. Inclua uma fonte consultada e explique como o Supabase reduz a necessidade de criar manualmente um backend inicial.

### O que é Supabase?

Escreva com suas próprias palavras e cite a documentação consultada.

### Por que PostgreSQL?

Explique a importância de um banco relacional, SQL, integridade e relacionamentos.

### O que são PK, FK e relacionamento?

Explique que a PK identifica uma linha, a FK referencia outra tabela e o relacionamento conecta entidades.

### O que é REST API?

Explique recursos, métodos HTTP e respostas JSON.

### SQL versus SDK

Compare consultas SQL executadas no banco com as chamadas do SDK JavaScript no frontend.

## 4. Modelo de dados

- **alunos:** informações cadastrais do aluno.
- **cursos:** informações dos cursos oferecidos.
- **matriculas:** tabela associativa entre alunos e cursos, com status e data.

Inclua aqui um print do banco e um diagrama simples.

## 5. Implementação

O arquivo `sql/01_schema_e_dados.sql` cria as tabelas, define PKs, FKs, restrições, dados de teste e políticas temporárias de laboratório. O frontend utiliza o Supabase JavaScript SDK para listar, inserir, atualizar e excluir alunos.

## 6. Testes e evidências

Registre o resultado dos testes a seguir e insira os cinco prints exigidos:

| Teste | Resultado esperado | Resultado obtido | Evidência |
|---|---|---|---|
| Banco criado | Tabelas aparecem no Supabase | preencher | print 1 |
| Cadastro válido | Novo aluno aparece na lista | preencher | print 2 |
| Listagem | Alunos são carregados | preencher | print 3 |
| Atualização | Dados alterados persistem | preencher | print 4 |
| Busca/filtro | Lista é filtrada | preencher | print 5 |
| E-mail inválido | Banco rejeita ou formulário impede | preencher | — |

## 7. Decisão técnica

Exemplo: foi escolhido JavaScript com o SDK oficial do Supabase para reduzir código de integração e permitir que o foco do encontro seja CRUD e modelagem. No próximo encontro, as políticas públicas de laboratório serão substituídas por autorização baseada em Auth e RLS.

## 8. Fontes consultadas

Substitua pelos links e datas reais das fontes consultadas. Sugestões: documentação oficial do Supabase sobre Database, JavaScript Client, REST API e PostgreSQL.
