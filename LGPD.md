# GlicoGuide — Conformidade com a LGPD

Levantamento do estado de conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Feito originalmente em 2026-07-01 e atualizado em 2026-07-15 depois de fechar a maior parte dos itens críticos.

O GlicoGuide trata **dado de saúde**, classificado como **dado pessoal sensível** pelo art. 5º, II c/c art. 11 da LGPD. Isso exige consentimento específico e destacado, medidas de segurança reforçadas e respeito pleno aos direitos do titular.

---

## ✅ Resolvido

- **Tela de consentimento no cadastro** — `LoginScreen.tsx` tem um checkbox obrigatório ("Li e aceito a Política de Privacidade e os Termos de Uso, incluindo o envio de fotos de refeições e dados de saúde para análise por IA") antes de permitir criar a conta. O backend (`POST /api/auth/register`) rejeita o cadastro sem `consentimento: true` e grava `consentimento_dados`/`consentimento_data` no `User`.
- **Consentimento específico para envio de dados à IA** — coberto pelo mesmo checkbox acima, que menciona explicitamente o envio de fotos e dados de saúde à IA.
- **Política de privacidade e termos de uso reais** — `src/components/LegalModal.tsx` tem o texto completo (dados coletados, uso, compartilhamento com a OpenAI, retenção, direitos do titular, contato). Acessível tanto no cadastro quanto em Perfil → Privacidade.
- **Endpoint de exclusão de conta e dados** — `DELETE /api/auth/conta` apaga `User`, `GlycemiaRecord`, `Meal`, `MealItem` e `PontosEvento` do usuário. Exposto em Perfil → "Excluir minha conta", com confirmação dupla.
- **Endpoint de exportação de dados** — `GET /api/auth/exportar-dados` retorna todos os dados do usuário em JSON. Exposto em Perfil → "Exportar meus dados", via share sheet do sistema.
- **Criptografia do AsyncStorage** — diário, lembretes, metas e histórico de carbo passam por `secureStorage.ts` (AES via `crypto-js`, chave gerada e guardada no Keychain do dispositivo).
- **Limite de tentativas de login** — `POST /api/auth/login` bloqueia a conta por 15 minutos após 5 tentativas erradas seguidas (reforça o dever de segurança do art. 46).

---

## 🔴 Ainda pendente — bloqueia produção

- [ ] **HTTPS no backend** — dados de glicemia, refeições e fotos ainda trafegam em texto claro em dev. Railway provê TLS automaticamente em produção, mas falta fazer o deploy e confirmar. Viola o dever de segurança do art. 46 enquanto não for feito.
  - Ver `DEPLOY.md` no repositório do backend.

---

## 🟡 Importante, não bloqueia lançamento

- [ ] **Política de retenção de dados automatizada** — a política de privacidade descreve que os dados ficam enquanto a conta estiver ativa, mas não há job de expiração/anonimização automática rodando — hoje a exclusão só acontece se o usuário pedir manualmente.
- [ ] **Canal de contato do titular / encarregado (DPO)** — existe um e-mail de contato no texto da política (`contato@glicoguide.app`), mas não há uma tela dedicada de "fale conosco" no app para exercício de direitos (art. 41).

---

## 🟢 Já em conformidade desde antes

- Senha com hash (`werkzeug.security`) em `models/user.py`.
- Fotos de refeição **não são persistidas em disco** — vão direto para a OpenAI em base64 e são descartadas (`services/image_service.py` existe mas não é usado), reduzindo a superfície de dado sensível armazenado.
- Todas as queries filtram por `user_id`, sem vazamento de dado entre usuários.

---

## Ordem de execução sugerida (o que resta)

1. Deploy do backend com HTTPS em produção (único item crítico restante)
2. Job de retenção/expiração de dados (se o produto crescer e isso virar prioridade)
3. Canal de contato dedicado do titular, além do e-mail na política
