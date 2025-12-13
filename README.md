# GBA Metroids Dialog Previewer

Uma extensão profissional do VS Code para preview e desenvolvimento de diálogos dos jogos GBA Metroid. Oferece renderização em tempo real com fontes originais, sistema de cores avançado, processamento de scripts e calculadora automática de centralização.

## ✨ Funcionalidades

- **🎮 Preview em tempo real**: Renderização visual usando fontes e janelas originais dos jogos
- **🎯 Múltiplos jogos**: Metroid Zero Mission (Vanilla/ProjectZM) e Metroid Fusion (Vanilla/MZM-like) 
- **📝 Tipos de diálogo**: MF Dialog, Twolines, Multilines (Black/Elevator/Zero Suit)
- **🌈 Sistema de cores**: 7 cores com tags (`<yellow>`, `<red>`, `<purple>`, `<green>`, `<blue>`, `<cyan>`, `<white>`)
- **⚙️ Processamento de scripts**: Remove tags hex automáticamente e converte botões para Unicode (Ⓐ, Ⓑ, ⬆, ➡, etc.)
- **📐 Calculadora de centralização**: Para Twolines, calcula automaticamente valores hex para centrar texto

- **💾 Configuração persistente**: Zoom (1x-3x), tipo de jogo e tipo de diálogo salvos automaticamente

## 🚀 Como usar

1. **Compile**: `npm run compile`
2. **Debug**: Pressione `F5` no VS Code para lançar nova instância  
3. **Sidebar**: Encontre "Dialog Previewer" na barra lateral esquerda
4. **Arquivo**: Abra arquivo assembly (.s, .asm) com blocos `block_x_str_y`
5. **Navegue**: Mova cursor pelos blocos para ver preview automático
6. **Configure**: Ajuste jogo, tipo de diálogo e zoom conforme necessário
7. **Calcule**: Use calculadora de centralização para valores hex precisos

## 📁 Estrutura do Projeto

```
src/                          # Código da extensão VS Code
webview/                      # Interface React modular
├── components/               # Componentes organizados por função
├── hooks/                    # Hooks customizados
├── utils/                    # Funções utilitárias
└── charmaps/                 # Mapeamentos de caracteres por jogo
assets/                       # Fontes e janelas originais dos jogos
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- **Node.js** 16+ 
- **npm** ou **yarn**
- **VS Code** 1.74+

### Comandos de desenvolvimento

```bash
# Compilação
npm run compile          # Compila uma vez
npm run watch           # Watch mode (recompila automaticamente)

# Testes e debug  
npm test               # Executa testes unitários
F5                     # Debug no VS Code (nova instância)

# Build final
npm run package        # Gera arquivo .vsix para distribuição
```

## ⚙️ Tecnologias

- **TypeScript** - Tipagem estática e desenvolvimento robusto
- **React** - Componentes funcionais com hooks personalizados  
- **VS Code API** - Webview, FileSystemWatcher, Configuration
- **esbuild** - Bundler ultra-rápido com hot reload
- **CSS** - Filtros avançados para sistema de cores

## 🔧 Como Funciona

### 1. **Detecção de Blocos**
- Monitora arquivos `.s`, `.asm` via `onDidChangeTextDocument`
- Detecta padrões `block_x_str_y` com regex
- Extrai strings `.string1`, `.string2`, etc.

### 2. **Sistema de Renderização**
```typescript
// Pipeline de processamento
text → parseColorTags() → processScriptTags() → renderSprites()
```

### 3. **Calculadora de Centralização** 
```typescript
// Para Twolines: calcula largura total e centraliza
totalWidth = Σ(characterWidths)
centerOffset = (222 - totalWidth) / 2
hexValue = centerOffset.toString(16).toUpperCase()
```



## 💡 Para que serve

- **Desenvolvimento de ROM hacks**: Visualizar diálogos durante codificação
- **Tradução de jogos**: Verificar se texto traduzido cabe nas janelas
- **Centralization helper**: Calcular valores hex para centralizar texto
- **Validação visual**: Conferir tags de cor e formatação antes de compilar

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
