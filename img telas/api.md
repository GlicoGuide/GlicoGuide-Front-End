# GlicoGuide API — Documentação para Frontend

**Base URL:** `http://localhost:5001`
**Formato:** JSON (exceto uploads, que usam `multipart/form-data`)

---

## Autenticação

A API usa **JWT (JSON Web Token)**. O fluxo é:

1. Usuário faz login → API retorna um `token`
2. Todas as requisições protegidas enviam esse token no header:

```
Authorization: Bearer <token>
```

> Salve o token no `localStorage` ou gerenciador de estado após o login.

---

## Índice

- [Auth](#auth)
  - [Cadastro](#post-apiauthregister)
  - [Login](#post-apiauthlogin)
- [Insulina](#insulina)
  - [Analisar foto e calcular dose](#post-apiinsulincalcular)
- [Refeições](#refeições)
  - [Salvar refeição manualmente](#post-apimeals)
  - [Listar refeições](#get-apimeals)
- [Glicemia](#glicemia)
  - [Registrar medição](#post-apiglycemia)
  - [Listar histórico](#get-apiglycemia)
- [Utilitários](#utilitários)

---

## Auth

### POST /api/auth/register

Cria um novo usuário.

**Body**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

**Resposta 201**
```json
{
  "message": "Usuário criado com sucesso."
}
```

**Erros**
| Status | Motivo |
|--------|--------|
| 400 | Campo obrigatório ausente |
| 409 | Email já cadastrado |

**Exemplo (JS)**
```js
const res = await fetch('http://localhost:5001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'João', email: 'joao@email.com', password: '123456' })
})
const data = await res.json()
```

---

### POST /api/auth/login

Autentica e retorna o token JWT.

**Body**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Resposta 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros**
| Status | Motivo |
|--------|--------|
| 400 | Campo obrigatório ausente |
| 401 | Email ou senha inválidos |

**Exemplo (JS)**
```js
const res = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'joao@email.com', password: '123456' })
})
const { token } = await res.json()
localStorage.setItem('token', token)
```

---

## Insulina

### POST /api/insulin/calcular

**Rota principal do app.** Recebe a foto de uma refeição, usa IA (GPT-4o) para identificar os alimentos e estimar carboidratos, e calcula a dose de insulina bolus.

> Envia como `multipart/form-data`, não como JSON.

**Campos do formulário**
| Campo | Tipo | Obrigatório | Padrão |
|-------|------|-------------|--------|
| `imagem` | arquivo (PNG, JPG, JPEG) | Sim | — |
| `glicemia_atual` | número (mg/dL) | Sim | — |
| `glicemia_alvo` | número (mg/dL) | Não | 100 |
| `ratio_carb` | número (g por unidade) | Não | 15 |
| `fator_correcao` | número (mg/dL por unidade) | Não | 40 |

**Resposta 200**
```json
{
  "message": "Cálculo realizado com sucesso.",
  "meal_id": 1,
  "analise_refeicao": {
    "refeicao_detectada": "Sim",
    "componentes": [
      { "nome": "Arroz branco", "porcao_g": 150, "carboidratos_g": 45 },
      { "nome": "Feijão", "porcao_g": 100, "carboidratos_g": 15 }
    ],
    "total_carboidratos_g": 60,
    "observacoes": "Refeição balanceada."
  },
  "calculo_insulina": {
    "bolus_refeicao_u": 4.0,
    "bolus_correcao_u": 2.0,
    "bolus_total_u": 6.0,
    "detalhes": {
      "total_carboidratos_g": 60,
      "glicemia_atual_mgdl": 180,
      "glicemia_alvo_mgdl": 100,
      "ratio_carb": 15,
      "fator_correcao": 40
    }
  }
}
```

**Erros**
| Status | Motivo |
|--------|--------|
| 400 | Imagem ou `glicemia_atual` não enviados |
| 400 | Valores numéricos inválidos |
| 500 | Falha na análise com a IA |

**Exemplo (JS)**
```js
const token = localStorage.getItem('token')

const form = new FormData()
form.append('imagem', arquivo)          // arquivo do <input type="file">
form.append('glicemia_atual', '180')
form.append('glicemia_alvo', '100')     // opcional
form.append('ratio_carb', '15')         // opcional
form.append('fator_correcao', '40')     // opcional

const res = await fetch('http://localhost:5001/api/insulin/calcular', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: form
})
const data = await res.json()

// data.analise_refeicao.componentes  → lista de alimentos detectados
// data.calculo_insulina.bolus_total_u → dose total a aplicar
```

---

## Refeições

### POST /api/meals

Salva uma refeição manualmente (sem foto/IA).

**Body**
```json
{
  "total_carboidratos_g": 60,
  "bolus_total_u": 4.0,
  "observation": "Almoço",
  "componentes": [
    { "nome": "Arroz", "porcao_g": 150, "carboidratos_g": 45 },
    { "nome": "Feijão", "porcao_g": 100, "carboidratos_g": 15 }
  ]
}
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `total_carboidratos_g` | número | Sim |
| `bolus_total_u` | número | Sim |
| `observation` | string | Não |
| `componentes` | array | Não |

**Resposta 201**
```json
{
  "message": "Refeição salva com sucesso.",
  "meal_id": 1
}
```

**Erros**
| Status | Motivo |
|--------|--------|
| 400 | `total_carboidratos_g` ou `bolus_total_u` ausentes |

**Exemplo (JS)**
```js
const token = localStorage.getItem('token')

const res = await fetch('http://localhost:5001/api/meals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    total_carboidratos_g: 60,
    bolus_total_u: 4.0,
    observation: 'Almoço'
  })
})
const data = await res.json()
```

---

### GET /api/meals

Retorna o histórico de refeições do usuário logado.

**Resposta 200**
```json
[
  {
    "id": 1,
    "total_carboidratos_g": 60,
    "bolus_total_u": 4.0,
    "observation": "Almoço",
    "created_at": "2026-03-19T15:00:00",
    "componentes": [
      { "nome": "Arroz", "porcao_g": 150, "carboidratos_g": 45 }
    ]
  }
]
```

**Exemplo (JS)**
```js
const token = localStorage.getItem('token')

const res = await fetch('http://localhost:5001/api/meals', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const meals = await res.json()
```

---

## Glicemia

### POST /api/glycemia

Registra uma medição de glicemia.

**Body**
```json
{
  "valor_mgdl": 120
}
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `valor_mgdl` | número (mg/dL) | Sim |

**Resposta 201**
```json
{
  "message": "Glicemia registrada com sucesso.",
  "id": 1
}
```

**Erros**
| Status | Motivo |
|--------|--------|
| 400 | `valor_mgdl` ausente |

**Exemplo (JS)**
```js
const token = localStorage.getItem('token')

const res = await fetch('http://localhost:5001/api/glycemia', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ valor_mgdl: 120 })
})
const data = await res.json()
```

---

### GET /api/glycemia

Retorna o histórico de glicemia do usuário logado.

**Resposta 200**
```json
[
  {
    "id": 1,
    "valor_mgdl": 120,
    "created_at": "2026-03-19T15:00:00"
  }
]
```

**Exemplo (JS)**
```js
const token = localStorage.getItem('token')

const res = await fetch('http://localhost:5001/api/glycemia', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const records = await res.json()
```

---

## Utilitários

Rotas auxiliares, principalmente para debug durante o desenvolvimento.

### GET /check_openai_connection

Verifica se a integração com a IA está funcionando.

**Resposta 200**
```json
{ "status": "Conexão com OpenAI estabelecida com sucesso!" }
```

---

### GET /test_chatgpt_command

Envia um prompt de texto para o ChatGPT e retorna a resposta.

**Query param:** `prompt` (opcional)

```
GET /test_chatgpt_command?prompt=Qual+a+capital+do+Brasil
```

**Resposta 200**
```json
{
  "status": "success",
  "requested_prompt": "Qual a capital do Brasil?",
  "chatgpt_response": "A capital do Brasil é Brasília."
}
```

---

## Tratamento de erros no frontend

Padrão de resposta para todos os erros:

```json
{ "message": "Descrição do erro." }
```

Sugestão de handler genérico:

```js
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  })

  if (res.status === 401) {
    // token expirado → redirecionar para login
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Erro na requisição')
  }

  return data
}
```

---

## Tabela resumo de rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | Não | Cadastro |
| POST | `/api/auth/login` | Não | Login (retorna token) |
| POST | `/api/insulin/calcular` | Sim | Analisar foto + calcular insulina |
| POST | `/api/meals` | Sim | Salvar refeição manualmente |
| GET | `/api/meals` | Sim | Listar refeições |
| POST | `/api/glycemia` | Sim | Registrar glicemia |
| GET | `/api/glycemia` | Sim | Listar glicemia |
| GET | `/check_openai_connection` | Sim | Verificar IA (debug) |
| GET | `/test_chatgpt_command` | Sim | Testar prompt (debug) |