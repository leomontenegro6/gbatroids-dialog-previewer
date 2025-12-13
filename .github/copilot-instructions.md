# GBA Metroids Dialog Previewer - VSCode Extension

Esta é uma extensão profissional do VSCode para preview de diálogos dos jogos GBA Metroid. Oferece uma sidebar interativa que renderiza texto em tempo real usando fontes e janelas originais dos jogos, com suporte completo a tags de cor, processamento de scripts e calculadora de centralização automática.

## Funcionalidades Principais

- **Preview em tempo real**: Renderização visual de diálogos usando fontes originais dos jogos
- **Múltiplos jogos**: Metroid Zero Mission (Vanilla/ProjectZM) e Metroid Fusion (Vanilla/MZM-like)
- **Tipos de diálogo**: MF Dialog, Twolines, Multilines (Black/Elevator/Zero Suit)
- **Sistema de cores**: 7 cores (yellow, red, purple, green, blue, cyan, white) com filtros CSS
- **Tags de script**: Processamento automático de tags hex e conversão de botões para Unicode
- **Calculadora de centralização**: Para tipo Twolines, calcula automaticamente valores hex para centralizar texto
- **Hot reload**: Desenvolvimento com recarga automática para arquivos TypeScript e CSS
- **Configuração persistente**: Zoom, tipo de jogo e tipo de diálogo salvos automaticamente

## Arquitetura Modular

```
webview/
├── components/
│   ├── Controls/               # Seletores de configuração
│   │   ├── GameSelector.tsx
│   │   ├── DialogTypeSelector.tsx
│   │   └── ZoomSelector.tsx
│   ├── Preview/               # Renderização de diálogos
│   │   ├── DialogPreview.tsx
│   │   ├── TextRenderer.tsx
│   │   └── CharacterSprite.tsx
│   ├── Calculator/            # Calculadora de centralização
│   │   └── CenterCalculator.tsx
│   └── shared/                # Componentes reutilizáveis
│       └── EmptyState.tsx
├── hooks/                     # Hooks customizados
│   ├── useVsCodeApi.tsx
│   └── useConfiguration.tsx
├── utils/                     # Utilitários
│   ├── textProcessing.ts
│   └── spriteUtils.ts
├── charmaps/                  # Mapeamentos de caracteres
│   ├── mzm/vanilla.ts
│   ├── mzm/projectzm.ts
│   ├── mf/vanilla.ts
│   └── mf/mzmlike.ts
└── App.tsx                    # Componente principal (82 linhas)

src/
├── extension.ts               # Entry point da extensão
└── sidebarProvider.ts         # WebviewViewProvider com hot reload
```

## Como Executar

1. `npm run compile` - Compila a extensão
2. `F5` no VSCode - Lança nova instância com debug
3. Abra arquivo assembly (.s, .asm) com blocos `block_x_str_y`
4. Navegue pelos blocos para ver preview automático dos diálogos
5. Use calculadora de centralização para obter valores hex

## Tecnologias

- **TypeScript**: Language principal com tipos strict
- **React**: Componentes funcionais com hooks
- **VSCode API**: Webview, FileSystemWatcher, Configuration API
- **esbuild**: Build rápido com hot reload para CSS
- **CSS**: Filtros avançados para sistema de cores dos jogos