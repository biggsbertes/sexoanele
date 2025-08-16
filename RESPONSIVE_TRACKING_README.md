# ResponsiveTrackingCard - Componente com Modal para Status de Rastreio

## Visão Geral

O `ResponsiveTrackingCard` é um componente moderno que substitui o `TrackingCard` tradicional, oferecendo uma interface compacta com modal para exibir o status de rastreio de encomendas.

> **⚠️ Nota**: Este componente utiliza dados fictícios para demonstração. O status atual está fixo como "Retido na alfândega" e não está vinculado a APIs ou sistemas reais de rastreio.

## Características Principais

### 🚚 **Design com Modal**
- **Status Atual**: Sempre visível com destaque visual (fixo como "Retido na alfândega" para demonstração)
- **Modal de Status**: Histórico completo acessível através de um botão com ícone de caminhão
- **Interface Limpa**: Modal centralizado com todos os detalhes dos status

### 🎨 **Interface Visual**
- **Gradiente Azul**: Status atual destacado com fundo gradiente
- **Ícones Intuitivos**: Ícones específicos para cada tipo de status
- **Cores Contextuais**: Cores diferentes baseadas no status da encomenda
- **Animações Suaves**: Transições e animações para melhor experiência do usuário

### 📱 **Funcionalidades**
- **Botão de Modal**: Ícone de caminhão + contador de status
- **Histórico Completo**: Modal com todos os status organizados
- **Indicador de Quantidade**: Badge mostrando quantos status existem
- **Estados Visuais**: Diferentes cores e estilos para cada status

## Como Usar

### Importação
```tsx
import { ResponsiveTrackingCard } from "@/components/ResponsiveTrackingCard"
```

### Uso Básico
```tsx
<ResponsiveTrackingCard
  trackingCode="US641400141BR"
  steps={stepsData}
  currentStep={3}
/>
```

### Estrutura dos Dados
```tsx
interface TrackingStep {
  id: string
  status: string
  description: string
  date: string
  completed: boolean
}
```

## Vantagens sobre o TrackingCard Original

### ✅ **Economia de Espaço**
- **Antes**: Todos os status sempre visíveis (ocupando muito espaço)
- **Agora**: Apenas status atual visível + modal ao clicar

### ✅ **Melhor Organização**
- **Status Atual**: Destaque visual para informação mais importante
- **Histórico**: Acessível através de modal centralizado
- **Interface Limpa**: Modal organizado com todos os detalhes

### ✅ **Experiência do Usuário**
- **Foco**: Usuário vê primeiro o que é mais importante
- **Exploração**: Modal centralizado com todos os detalhes
- **Performance**: Menos elementos renderizados por padrão

## Status Suportados

| Status | Ícone | Cor | Descrição |
|--------|-------|-----|-----------|
| Seu produto já está com a Jadlog | 📦 Package | 🔴 Vermelho | Produto recebido pela Jadlog |
| Em transferência interna | 🚚 Truck | 🔴 Vermelho | Transferência entre unidades |
| Em transferência | 🚚 Truck | 🔴 Vermelho | Em trânsito |
| Retido na alfândega | ⚠️ AlertCircle | 🔴 Vermelho | Aguardando liberação |
| Em rota de entrega | 🚚 Truck | 🔵 Azul | Entregador a caminho |
| Entregue | ✅ CheckCircle | 🟢 Verde | Entrega concluída |

## Animações e Transições

- **Hover Effects**: Botão com escala e mudança de cor
- **Smooth Transitions**: Animações suaves para abertura/fechamento do modal
- **Pulse Animation**: Efeito especial para status críticos (ex: retido na alfândega)
- **Modal Animations**: Modal aparece com animação suave

## Modal

### 🚚 **Funcionamento**
- **Botão**: Ícone de caminhão + contador de status
- **Modal**: Abre ao clicar no botão
- **Conteúdo**: Todos os status organizados com detalhes
- **Fechamento**: Clique fora ou tecla ESC

### 📱 **Características**
- **Tamanho**: Modal responsivo com largura máxima
- **Scroll**: Conteúdo com scroll vertical se necessário
- **Foco**: Modal centralizado na tela
- **Acessibilidade**: Suporte a navegação por teclado

## Personalização

O componente aceita uma prop `className` para estilos customizados:

```tsx
<ResponsiveTrackingCard
  trackingCode="US641400141BR"
  steps={stepsData}
  currentStep={3}
  className="custom-tracking-card"
/>
```

## Migração do TrackingCard

Para migrar do componente antigo, simplesmente substitua:

```tsx
// ❌ Antes
import { TrackingCard } from "@/components/TrackingCard"
<TrackingCard ... />

// ✅ Agora
import { ResponsiveTrackingCard } from "@/components/ResponsiveTrackingCard"
<ResponsiveTrackingCard ... />
```

## Dependências

- `@radix-ui/react-dialog` - Para funcionalidade do modal
- `lucide-react` - Para ícones
- `@/components/ui/button` - Para botões
- `@/components/ui/badge` - Para indicadores
- `@/components/ui/card` - Para estrutura do card

## Exemplo de Implementação Completa

```tsx
import { ResponsiveTrackingCard } from "@/components/ResponsiveTrackingCard"

const TrackingPage = () => {
  const stepsData = [
    {
      id: "1",
      status: "Seu produto já está com a Jadlog",
      description: "Produto recebido e processado",
      date: "2024-01-15 10:30",
      completed: true
    },
    // ... mais status
  ]

  return (
    <div className="container mx-auto p-4">
      <ResponsiveTrackingCard
        trackingCode="US641400141BR"
        steps={stepsData}
        currentStep={2}
      />
    </div>
  )
}
```

## Conclusão

O `ResponsiveTrackingCard` oferece uma solução moderna e eficiente para exibir informações de rastreio, economizando espaço na tela através de um modal centralizado. É ideal para aplicações que precisam de uma interface limpa e organizada.
