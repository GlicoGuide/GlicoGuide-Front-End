# GlicoGuide — Tarefas do Back-End

Referência para o desenvolvimento do backend, organizada por prioridade.

---

## ✅ Implementado

| Item | Rota |
|---|---|
| Cadastro de usuário | `POST /api/auth/register` |
| Login com JWT | `POST /api/auth/login` |
| Registrar glicemia | `POST /api/glycemia` |
| Listar glicemia | `GET /api/glycemia` |
| Listar refeições | `GET /api/meals` |
| Salvar refeição manualmente | `POST /api/meals` |
| Analisar foto + calcular insulina | `POST /api/insulin/calcular` |

---

## 🔴 Prioridade Alta

### 1. Alertas de Glicemia Crítica

**Status:** pendente

Embutir classificação clínica na resposta do `POST /api/glycemia`:

| Faixa (mg/dL) | Nível | Mensagem |
|---|---|---|
| < 70 | `hipoglicemia` | "Glicemia muito baixa. Tome uma ação imediata." |
| 70 – 99 | `normal` | "Glicemia normal em jejum." |
| 100 – 180 | `atencao` | "Glicemia aceitável pós-refeição." |
| 181 – 250 | `alta` | "Hiperglicemia moderada. Monitore." |
| > 250 | `critica` | "Glicemia muito alta. Verifique com seu médico." |

**Resposta esperada:**
```json
{
  "id": 42,
  "valor_mgdl": 320,
  "created_at": "2026-05-15T15:00:00",
  "alerta": {
    "nivel": "critica",
    "mensagem": "Glicemia muito alta (320 mg/dL). Verifique com seu médico."
  }
}
```

**No frontend:** ler `alerta` no `DadosScreen` e `HomeScreen` e exibir banner de aviso.

---

### 2. Persistir `glicemia_atual` e `peso_prato_g`

**Status:** pendente

O endpoint `POST /api/insulin/calcular` recebe esses campos mas não os salva no banco.

- Adicionar colunas `glicemia_atual_mgdl` e `peso_prato_g` na tabela `meals`
- Passar `peso_prato_g` no prompt do GPT-4o para calibrar a estimativa
- Retornar ambos na resposta e no `GET /api/meals`
- Criar migration para as novas colunas

---

## 🟡 Prioridade Média

### 3. Endpoint de Chat com IA

**Status:** pendente

`ChatScreen` existe no app mas não tem backend.

**Criar:** `POST /api/chat/mensagem`

```json
// Body
{
  "mensagem": "Posso comer carboidrato à noite?",
  "historico": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

// Resposta
{
  "resposta": "Com moderação sim. Prefira ..."
}
```

- Integrar com GPT-4o passando contexto de saúde do usuário (glicemias recentes + refeições)
- Histórico é opcional (permite conversa contínua)

---

### 4. Sistema de GlicoPoints

**Status:** pendente — `ProfileScreen` exibe 350 fixos

**Criar:**
- Tabela `pontos` com eventos e timestamps
- `GET /api/pontos` → total do usuário
- `POST /api/pontos/evento` → creditar pontos por ação

| Evento | Pontos |
|---|---|
| Registrar glicemia | +10 |
| Analisar prato | +20 |
| Cumprir meta | +50 |

---

### 5. Área Médica — dados reais

**Status:** pendente — `AreaMedicaScreen` usa dados mockados

**Criar:** `GET /api/medico/resumo`

```json
{
  "periodo": "2026-06",
  "total_registros_glicemia": 45,
  "media_glicemia": 142,
  "tempo_no_alvo_pct": 68,
  "episodios_hipoglicemia": 3,
  "episodios_hiperglicemia": 8,
  "hba1c_estimada": 6.8
}
```

---

## 🟢 Prioridade Baixa (antes de produção)

### 6. Refresh Token

Token JWT expira e o usuário perde a sessão sem aviso.

- `POST /api/auth/refresh-token` → retorna novo token com expiração renovada
- Frontend implementa com `react-native-keychain`

### 7. Limite de tentativas de login

- Bloquear email/IP por 15 minutos após 5 tentativas falhas consecutivas

### 8. Validação de e-mail no cadastro

- Validar formato `email@dominio.com` no `POST /api/auth/register`

---

## Deploy

Consulte [`DEPLOY.md`](./DEPLOY.md) para o guia completo de deploy no Railway.

Checklist rápido:
- [ ] `OPENAI_API_KEY` e `JWT_SECRET_KEY` configuradas no Railway
- [ ] PostgreSQL adicionado ao projeto
- [ ] URL de produção copiada para `PROD_URL` em `src/services/api.ts` do app
- [ ] Testar todos os endpoints com a URL de produção antes de publicar
