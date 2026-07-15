# GlicoGuide — Referência do Back-End

Do ponto de vista do app: o que a API expõe hoje e o que ainda falta pra fechar o ciclo de produção. Para o detalhe de cada rota (body, resposta, erros), veja `docs/api.md` no repositório do backend.

---

## ✅ Implementado

| Item | Rota |
|---|---|
| Cadastro (com consentimento LGPD) | `POST /api/auth/register` |
| Login com JWT (access + refresh, rate-limit) | `POST /api/auth/login` |
| Renovar access token | `POST /api/auth/refresh` |
| Exportar dados do usuário | `GET /api/auth/exportar-dados` |
| Excluir conta e dados | `DELETE /api/auth/conta` |
| Registrar glicemia (com alerta clínico) | `POST /api/glycemia` |
| Listar glicemia | `GET /api/glycemia` |
| Listar refeições | `GET /api/meals` |
| Salvar refeição manualmente | `POST /api/meals` |
| Analisar foto + calcular insulina | `POST /api/insulin/calcular` |
| Chat com IA (com contexto de saúde) | `POST /api/chat/mensagem` |
| Total e histórico de GlicoPoints | `GET /api/pontos` |
| Creditar pontos por meta concluída | `POST /api/pontos/meta` |
| Resumo clínico (HbA1c estimada, tempo no alvo) | `GET /api/medico/resumo` |

Alertas de glicemia, GlicoPoints reais e a Área Médica — que ficaram pendentes por um bom tempo — já estão integrados nas telas correspondentes (`DadosScreen`, `HomeScreen`, `ProfileScreen`, `LojaGlicoScreen`, `AreaMedicaScreen`).

Backend também tem testes automatizados (pytest) cobrindo auth, rate-limit, refresh token, classificação de glicemia, cálculo de bolus e o resumo médico, mais CI no GitHub Actions.

---

## 🔴 O que falta (é infra, não código)

### Deploy em produção
- [ ] Subir o backend no Railway de verdade
- [ ] Confirmar HTTPS (Railway provê TLS automaticamente, mas precisa verificar depois do deploy)
- [ ] Copiar a URL final para `PROD_URL` em `src/services/api.ts`
- [ ] Testar todos os endpoints já na URL de produção antes de publicar o app

### Keystore de produção (Android)
- [ ] Gerar um keystore real pra assinar o APK/AAB — hoje ainda usa `debug.keystore`

Consulte [`DEPLOY.md`](https://github.com/WillianAsouz4/Back-endglicoguide/blob/main/DEPLOY.md) no repositório do backend para o guia completo.

---

## 🟡 Hardening que pode esperar

Nada disso bloqueia lançar o app, mas vale considerar conforme a base de usuários cresce:

- **Rate limit de login por IP** — hoje o bloqueio é por usuário (5 tentativas erradas → 15 min bloqueado), não há proteção adicional por IP/dispositivo.
- **Retenção/expiração automática de dados** — a política de privacidade descreve retenção enquanto a conta estiver ativa, mas não há job de expiração/anonimização programado.
- **Canal de contato do titular (DPO)** — hoje o único contato é o e-mail citado na política de privacidade; não existe uma tela de "fale conosco" dedicada a pedidos de dados.
- **Testes end-to-end** — a cobertura hoje é unitária (pytest no backend, Jest no app); não há Detox/Maestro rodando o fluxo completo num simulador.
