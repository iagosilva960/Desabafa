# Desabafa Aí - Diário com IA Terapeuta

Um Progressive Web App (PWA) moderno e responsivo que funciona como um diário pessoal com IA terapeuta integrada, oferecendo apoio emocional e reflexões personalizadas para melhorar o bem-estar mental.

## 🌟 Características Principais

- **Diário Pessoal**: Interface intuitiva para escrever sobre sentimentos e experiências
- **IA Terapeuta**: Integração com OpenAI GPT para respostas empáticas e de apoio
- **PWA Completo**: Instalável, funciona offline e tem aparência de app nativo
- **Privacidade Total**: Dados armazenados localmente no dispositivo
- **Identificação Única**: Sistema de device fingerprinting para identificação sem login
- **Design Responsivo**: Funciona perfeitamente em mobile e desktop
- **Modo Escuro/Claro**: Interface adaptável às preferências do usuário

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **IA**: OpenAI API (GPT-3.5-turbo)
- **PWA**: Service Worker + Web App Manifest
- **Armazenamento**: localStorage (client-side)
- **Ícones**: Lucide React

## 📱 Funcionalidades

### Diário Pessoal
- Editor de texto para entradas do diário
- Sistema de humor com emojis (😢 😔 😐 😊 😄)
- Histórico organizado por data
- Visualização de entradas anteriores

### IA Terapeuta
- Respostas empáticas e de apoio emocional
- Análise de sentimentos das entradas
- Sugestões personalizadas de bem-estar
- Modo offline com respostas de fallback

### PWA Features
- Instalação no dispositivo
- Funcionamento offline
- Service Worker para cache
- Manifest para metadados do app

### Privacidade e Segurança
- Identificação por device fingerprint
- Dados armazenados apenas localmente
- Nenhuma informação enviada para servidores externos
- Comunicação segura com API OpenAI

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Chave da API OpenAI

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/iagosilva960/Desabafa.git
   cd Desabafa
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione sua chave da OpenAI:
   ```
   VITE_OPENAI_API_KEY=sua_chave_openai_aqui
   VITE_OPENAI_API_BASE=https://api.openai.com/v1
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   # ou
   pnpm run dev
   ```

5. **Acesse a aplicação**
   Abra http://localhost:5173 no seu navegador

## 🏗️ Build e Deploy

### Build para Produção
```bash
npm run build
# ou
pnpm run build
```

### Deploy no GitHub Pages
1. Configure o GitHub Pages no repositório
2. Faça o build da aplicação
3. Faça o deploy dos arquivos da pasta `dist`

### Deploy em Outros Serviços
O projeto pode ser facilmente deployado em:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 📂 Estrutura do Projeto

```
desabafa-ai/
├── public/
│   ├── manifest.json      # Web App Manifest
│   ├── sw.js             # Service Worker
│   ├── icon-192.png      # Ícone PWA 192x192
│   └── icon-512.png      # Ícone PWA 512x512
├── src/
│   ├── components/
│   │   └── ui/           # Componentes Shadcn/UI
│   ├── hooks/
│   │   └── usePWA.js     # Hook para funcionalidades PWA
│   ├── lib/
│   │   ├── deviceFingerprint.js  # Sistema de identificação
│   │   └── openaiService.js      # Integração OpenAI
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos principais
│   └── main.jsx          # Ponto de entrada
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json          # Dependências e scripts
└── README.md            # Este arquivo
```

## 🔧 Configuração da IA Terapeuta

A IA terapeuta é configurada com um prompt especializado que:
- Oferece apoio emocional empático
- Valida sentimentos sem julgamentos
- Sugere estratégias de bem-estar
- Mantém tom profissional e acolhedor
- Responde em português brasileiro

### Personalização
Você pode personalizar o comportamento da IA editando o arquivo `src/lib/openaiService.js` e modificando a constante `THERAPIST_SYSTEM_PROMPT`.

## 🔒 Privacidade e Dados

### Armazenamento Local
- Todas as entradas do diário ficam no localStorage
- Informações do usuário não saem do dispositivo
- Identificação por device fingerprint (sem dados pessoais)

### Comunicação Externa
- Apenas as entradas do diário são enviadas para a OpenAI API
- Comunicação criptografada (HTTPS)
- Nenhum dado pessoal identificável é transmitido

## 🎨 Personalização

### Temas
O app suporta modo claro e escuro automaticamente. Para personalizar cores, edite as variáveis CSS em `src/App.css`.

### Componentes
Todos os componentes UI são baseados no Shadcn/UI e podem ser personalizados facilmente.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se a chave da OpenAI está configurada corretamente
3. Abra uma issue no GitHub com detalhes do problema

## 🙏 Agradecimentos

- OpenAI pela API GPT
- Shadcn/UI pelos componentes
- Tailwind CSS pelo sistema de design
- Lucide pelos ícones
- Comunidade React pelo ecossistema

---

Desenvolvido com ❤️ para apoiar o bem-estar mental e emocional.

