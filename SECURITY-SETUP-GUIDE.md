# Guia de Configuração de Segurança - IPG

## 1. VARIÁVEIS DE AMBIENTE

### Passo 1: Copiar arquivo de exemplo
\`\`\`bash
cp .env.example .env.local
\`\`\`

### Passo 2: Adicionar suas credenciais Firebase
Edite `.env.local` e substitua os valores:
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Chave de API (pública, OK estar no código)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Project ID
- Outros valores do seu Firebase Console

### Importante:
- NUNCA faça commit de `.env.local` (está no .gitignore)
- Somente variáveis com prefixo `NEXT_PUBLIC_` são expostas ao cliente
- Admin SDK key deve ficar apenas no servidor

## 2. FIREBASE SECURITY RULES

### Passo 1: Ir ao Firebase Console
1. Acesse https://console.firebase.google.com
2. Selecione seu projeto
3. Vá para Firestore Database

### Passo 2: Copiar regras
1. Clique em "Regras" (aba superior)
2. Cole todo o conteúdo de `firestore.rules`
3. Clique "Publicar"

### O que as regras fazem?
- Apenas administradores acessam dados de usuários
- Alunos veem apenas suas próprias notas e presenças
- Professores gerenciam notas de seus alunos
- Avisos visíveis para todos (leitura)
- Proteção contra acesso não autorizado

## 3. PROTEÇÃO ADICIONAL

### A) Habilitar autenticação por email
1. Firebase Console → Autenticação
2. Providers → Email/Senha
3. Habilitar "Email/Senha"

### B) Habilitar verificação de email
1. Templates → Email de verificação
2. Personalizar mensagem
3. Ativar verificação obrigatória

### C) Rate Limiting
1. Firebase Console → Autenticação → Configurações
2. Habilitar proteção contra DDoS

### D) Habilitar reCAPTCHA
1. Firebase Console → Autenticação → Integrações
2. Ativar reCAPTCHA Enterprise (recomendado)
3. Adicionar reCAPTCHA ao formulário de login

## 4. CHECKLIST DE SEGURANÇA

- [ ] .env.local criado e no .gitignore
- [ ] Variáveis de ambiente carregadas
- [ ] Firestore Security Rules publicadas
- [ ] Verificação de email habilitada
- [ ] Rate limiting ativo
- [ ] HTTPS configurado em produção
- [ ] Headers de segurança adicionados
- [ ] Backup automático ativado

## 5. MONITORAMENTO

### Logs de Auditoria
1. Firebase Console → Auditoria
2. Monitorar tentativas de acesso

### Alertas
1. Google Cloud Console → Alerts
2. Configurar alertas para atividades suspeitas

## 6. PRÓXIMOS PASSOS

- [ ] Implementar autenticação 2FA
- [ ] Setup de backup automático
- [ ] Configurar WAF (Web Application Firewall)
- [ ] Testes de segurança penetration
- [ ] Documentação LGPD/GDPR
