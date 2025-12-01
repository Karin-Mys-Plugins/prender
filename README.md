# Prender

基于 skia-canvas@3.0.8 的无状态 React 渲染器。

## ✨ 特性

- 🚀 **纯 Node.js 环境**：专为服务端优化，不支持浏览器环境
- 🎨 **Skia 引擎驱动**：使用 Google Skia 图形引擎，提供高质量渲染
- ⚛️ **React 组件**：使用熟悉的 React 语法编写 UI
- 📦 **丰富的组件**：支持 View、Text、Image、Chart、绘图组件等
- 🖼️ **多种输出格式**：PNG、JPEG、WebP、PDF、SVG
- 🎭 **高级文本渲染**：支持文本装饰、变换、描边等高级特性
- 🔤 **字体管理**：完整的字体加载和管理支持
- 📊 **ECharts 集成**：内置 ECharts 图表支持

## 开始

### 安装依赖

需要 Node.js 18+ 和 React 18 版本。

```bash
pnpm add @karin-mys/prender react@18
pnpm add @types/react@18 --D
```

>[!TIP]：skia-canvas 会自动作为依赖安装。在某些系统上，skia-canvas 可能需要编译原生模块。

如果你需要绘制 ECharts 图表：

```bash
pnpm add echarts
```

### 编写一个页面

```tsx
import React from 'react';
import { View, Text, renderToFile } from '@karin-mys/prender';

export const App: React.FC = () => {
    return (
        <View style={{ 
            marginTop: 20, 
            padding: 10, 
            backgroundColor: 'white', 
            width: 460, 
            border: '1px solid #ddd' 
        }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
                多行文本布局示例
            </Text>
            <Text style={{ 
                fontSize: 14, 
                color: '#333', 
                lineHeight: 22 
            }}>
                这是一段很长很长的文本，它将在这里演示自动换行的功能。
                当文本内容超出容器宽度时，它应该能优雅地切换到下一行，
                而不会溢出容器。
            </Text>
            <Text style={{ 
                fontSize: 14, 
                color: '#333', 
                lineHeight: 22, 
                marginTop: 10, 
                numberOfLines: 2 
            }}>
                这是一个关于省略号截断的例子。这段文字同样非常长，
                但是我们通过设置 numberOfLines 属性，将其限制在两行以内。
                如果内容超出了两行，那么在第二行的末尾就会出现一个省略号...
            </Text>
        </View>
    )
}

// 渲染到文件
await renderToFile(<App />, './output.png', 460, null);
```

### 渲染方式

Prender 提供多种渲染方式来满足不同的需求：

#### 渲染到文件

```ts
import { renderToFile } from '@karin-mys/prender';
import { App } from './app';

// 基础用法
await renderToFile(<App />, './output.png', 500, null);

// 带选项
await renderToFile(<App />, './output.png', 500, null, {
    format: 'png',        // 'png' | 'jpeg' | 'webp' | 'pdf' | 'svg'
    quality: 0.9,         // 仅 jpeg/webp
    createDir: true,      // 自动创建目录
    devicePixelRatio: 2,  // 设备像素比
});

// 导出为 PDF
await renderToFile(<App />, './output.pdf', 500, null, {
    format: 'pdf',
    pages: {
        width: 595,       // A4 宽度（磅）
        height: 842,      // A4 高度（磅）
        margin: 40,
    },
    compress: true,
});

// 导出为 SVG
await renderToFile(<App />, './output.svg', 500, null, {
    format: 'svg',
    background: '#ffffff',
});
```

#### 渲染到 Buffer

```ts
import { renderToBuffer } from '@karin-mys/prender';

const buffer = await renderToBuffer(<App />, 500, null, {
    format: 'png',
    quality: 0.9,
});

// 可以直接发送给客户端或保存
response.setHeader('Content-Type', 'image/png');
response.send(buffer);
```

#### 渲染到 Base64

```ts
import { renderToBase64 } from '@karin-mys/prender';

const base64 = await renderToBase64(<App />, 500, null, {
    format: 'png',
});

console.log(base64); // data:image/png;base64,...
```

#### 统一渲染接口

```ts
import { render } from '@karin-mys/prender';

// 文件输出
await render(<App />, 500, null, {
    output: 'file',
    filePath: './output.png',
    format: 'png',
});

// Buffer 输出
const buffer = await render(<App />, 500, null, {
    output: 'buffer',
    format: 'png',
});

// Base64 输出
const base64 = await render(<App />, 500, null, {
    output: 'base64',
    format: 'png',
});
```

## 高级特性

### 字体管理

使用 skia-canvas 的 FontLibrary 管理字体：

```ts
import { FontManager, registerFont } from '@karin-mys/prender';

// 方式 1：使用全局注册函数
registerFont('/path/to/font.ttf');
registerFont('/path/to/fonts/directory');

// 方式 2：使用 FontManager
const fontManager = FontManager.getInstance();
fontManager.registerFont('/path/to/font.ttf');

// 检查字体是否存在
if (fontManager.hasFamily('Arial')) {
    console.log('Arial 字体可用');
}

// 获取所有可用字体
console.log(fontManager.getFamilies());
```

### 高级文本组件

`AdvancedText` 组件提供了更多文本渲染特性：

```tsx
import { AdvancedText } from '@karin-mys/prender';

<AdvancedText style={{
    fontSize: 24,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#333',
    
    // 文本装饰
    textDecoration: 'underline',
    textDecorationColor: 'red',
    textDecorationStyle: 'wavy',
    textDecorationThickness: 2,
    
    // 文本转换
    textTransform: 'uppercase',
    
    // 字符和单词间距
    letterSpacing: 2,
    wordSpacing: 5,
    
    // 文本阴影
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    
    // 文本描边
    textStroke: '#ff0000',
    textStrokeWidth: 1,
    
    // 文本渲染质量
    textRendering: 'optimizeLegibility',
    
    // 字距调整
    fontKerning: 'normal',
    
    // 文本溢出
    textOverflow: 'ellipsis',
    maxLines: 3,
    
    // 布局
    width: 300,
    padding: 20,
}}>
    This is advanced text with many features!
</AdvancedText>
```

### 图片加载

使用 `ImageLoader` 预加载图片：

```ts
import { ImageLoader } from '@karin-mys/prender';

// 预加载图片
await ImageLoader.preload([
    'https://example.com/image1.jpg',
    '/path/to/image2.png',
]);

// 加载单张图片
const image = await ImageLoader.load('https://example.com/image.jpg');

// 清除缓存
ImageLoader.clearCache();
```

### Canvas 导出工具

直接使用 `CanvasExporter` 进行高级导出：

```ts
import { Canvas } from 'skia-canvas';
import { CanvasExporter } from '@karin-mys/prender';

const canvas = new Canvas(800, 600);
const ctx = canvas.getContext('2d');

// ... 绘制内容 ...

// 导出为 Buffer
const buffer = await CanvasExporter.toBuffer(canvas, {
    format: 'png',
    density: 2,
});

// 导出为 Base64
const dataURL = await CanvasExporter.toDataURL(canvas, {
    format: 'jpeg',
    quality: 0.9,
});

// 导出为 SVG 字符串
const svg = await CanvasExporter.toSVG(canvas);

// 导出为 PDF
const pdf = await CanvasExporter.toPDF(canvas, {
    pages: { width: 595, height: 842 },
    compress: true,
});
```

## 组件

### 基础组件

- **View**：容器组件
- **Text**：文本组件（支持自动换行、省略号）
- **AdvancedText**：高级文本组件（支持更多文本特性）
- **Image**：图片组件
- **Button**：按钮组件
- **Switch**：开关组件
- **Checkbox**：复选框组件
- **BlurView**：模糊效果组件
- **Painter**：自定义绘制组件

### 渐变组件

- **LinearGradient**：线性渐变
- **RadialGradient**：径向渐变
- **ConicGradient**：圆锥渐变

### 绘图组件

- **Arc**：弧形
- **Circle**：圆形
- **Rect**：矩形
- **Line**：线条
- **Path**：路径
- **Ellipse**：椭圆
- **DrawingText**：绘图文本

### 图表组件

#### ECharts

如果想要渲染 Echarts，需要先安装 Echarts。

#### ECharts

```tsx
import React from 'react';
import { View, Text, Chart } from '@karin-mys/prender';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const chartOption: EChartsOption = {
  xAxis: {
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [150, 230, 224, 218, 135],
    type: 'bar'
  }]
};

export const App: React.FC = () => {
    return (
        <View>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
                ECharts 图表示例
            </Text>
            <Chart
                style={{ width: 460, height: 300 }}
                option={chartOption}
                echarts={echarts}
            />
        </View>
    )
}
```

## 输出格式

Prender 支持多种输出格式，充分利用 skia-canvas 的能力：

| 格式 | 扩展名 | 用途 | 选项 |
|------|--------|------|------|
| PNG | `.png` | 无损位图，支持透明 | `quality` (无效) |
| JPEG | `.jpg`, `.jpeg` | 有损压缩，适合照片 | `quality` (0-1) |
| WebP | `.webp` | 现代格式，体积小 | `quality` (0-1) |
| PDF | `.pdf` | 矢量文档 | `pages`, `compress` |
| SVG | `.svg` | 矢量图形 | `background` |

## 性能优化

### 图片缓存

默认情况下，图片会被缓存以提高性能：

```ts
import { ImageLoader } from '@karin-mys/prender';

// 预加载常用图片
await ImageLoader.preload([
    '/assets/logo.png',
    '/assets/background.jpg',
]);

// 在需要时清除缓存
ImageLoader.clearCache();
```

### 字体预加载

在应用启动时注册字体：

```ts
import { registerFont } from '@karin-mys/prender';

// 启动时注册所有字体
registerFont('/fonts/');
registerFont('/fonts/custom-font.ttf');
```

### Canvas 池

内部使用 Canvas 池来重用 Canvas 实例，减少创建开销。

---

## 贡献

- 欢迎提交 Issue 和 Pull Request！
- 贡献者[bietiaop](https://github.com/bietiaop)
