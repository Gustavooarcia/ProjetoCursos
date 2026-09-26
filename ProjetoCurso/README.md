# Sistema Web de Gestão de Cursos — Encontros 01 e 02

Aplicação acadêmica em HTML, CSS, JavaScript e Supabase. O Encontro 02 implementa autenticação, sessão, perfis, papéis e Row Level Security.

## Estrutura

```text
projeto-gestao-cursos/
├── README.md
├── sql/
│   ├── 01_schema_e_dados.sql
│   └── 02_auth_rls.sql
├── docs/
│   ├── relatorio.md
│   └── relatorio_encontro_02.md
└── src/
    ├── index.html
    ├── style.css
    ├── app.js
    └── config.js
```

## Configurar Supabase

1. No SQL Editor, execute `sql/01_schema_e_dados.sql` (se ainda não executado).
2. Execute `sql/02_auth_rls.sql`. **Esta migração remove as políticas permissivas do laboratório do Encontro 01.** A partir daí, os dados protegidos exigem login e autorização RLS.
3. Em **Authentication > Providers**, habilite Email. Defina a confirmação de e-mail apropriada ao exercício e configure a URL local permitida em **Authentication > URL Configuration**.
4. Revise `src/config.js`: mantenha somente a URL do projeto e a chave pública `publishable` ou `anon`. Nunca use `service_role` no browser.
5. Crie/valide uma conta e promova a conta de administrador pelo bloco SQL comentado ao final de `02_auth_rls.sql`. Novas contas sempre começam como `aluno`; papel privilegiado nunca vem do formulário.
6. Para preparar a conta professor e atribuir um curso, use o SQL Editor após conferir os UUIDs dos perfis. O professor só altera cursos em que `professor_id` é seu próprio UUID.

> Execute a migração em projeto de desenvolvimento primeiro. A tabela antiga `alunos` e `matriculas` permanece no banco, mas deixa de estar acessível pelo cliente após a migração; as novas matrículas ficam em `matriculas_auth`.

## Executar localmente

```bash
python3 -m http.server 5500 --directory .
```

Abra `http://localhost:5500/src/`. A página oferece cadastro, login, logout, gestão de cursos conforme papel e consulta de matrículas do aluno; o link no rodapé abre o relatório em `docs/`.

## Testes

Consulte [docs/relatorio_encontro_02.md](docs/relatorio_encontro_02.md) para fluxograma, explicações Auth/JWT/sessão/RLS, matriz de permissões, políticas documentadas e matriz usuário × ação × resultado. Os testes que exigem projeto Supabase e múltiplas contas estão marcados como pendentes até execução na instância real; preencha resultados e inclua evidências antes de entregar.

## Segurança resumida

- Signup cria perfil com `role = aluno` por trigger do banco.
- Não há chave `service_role` no frontend.
- RLS decide o acesso por identidade e papel a cada linha.
- Esconder botões no frontend é apenas conveniência, não autorização.
- Promoção a administrador é feita por operador privilegiado no SQL Editor.
