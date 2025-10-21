//改进计划：
//1、能力数量不用透明度表示，而是用环的粗细表示
//2、不用Json，而是用更友好的UI编辑

import { useEffect, useMemo, useRef, useState } from "react";
//React：前端框架
//Hooks：特殊的函数，可以让你在函数组件中“钩入” React 的特性
// useEffect：副作用钩子（用于处理副作用，如数据获取、订阅、读写本地存储、监听事件、网络请求等）
// useMemo：记忆化钩子（用于优化性能，避免不必要的计算）
// useRef：引用钩子（用于获取DOM元素或保存可变数据）
// useState：状态钩子（用于在函数组件中添加状态）

/**
 * 个人能力同心圆（单文件 React 组件）
 * - 纯 SVG 实现，无第三方图表库；Tailwind 用于布局与样式
 * - 支持：鼠标悬停提示、点击高亮、JSON 导入/导出、PNG/SVG 下载、本地存储
 * - 4 个环：舒适区/挑战区/近不胜任/远不胜任（Comfortable/Challenging/Near Incapable/Far Incapable）
 * - 用法：在任意 React 项目中引入并渲染 <CapabilityConcentricPage />
 */

//默认导出组件
export default function CapabilityConcentricPage() {
  // 颜色与层级
  const LEVELS = [ // 定义了一个包含四个对象的数组，每个对象表示一个层级的信息，包括键、中文名称、英文名称和颜色
    { key: "comfortable", cn: "舒适区", en: "Comfortable", color: "#3b82f6" },
    { key: "challenging", cn: "挑战区", en: "Challenging", color: "#f5ca0bff" },
    { key: "near", cn: "近不胜任", en: "Near Incapable", color: "#ef4444" },
    { key: "far", cn: "远不胜任", en: "Far Incapable", color: "#ffa0a0ff" },
  ] as const; // as const：将数组的每个元素的类型都变为字面量类型，而不是宽泛的字符串类型

  type LevelKey = typeof LEVELS[number]["key"]; // LevelKey 是一个联合类型，表示 LEVELS 数组中每个对象的 key 属性的值
  //联合类型：表示一个值可以是几种类型之一 type LevelKey = "comfortable" | "challenging" | "near" | "far";


  type Category = { // 定义了一个 Category 类型，表示一个分类的信息，包括名称和技能
    name: string; // 分类名称
    skills: Record<LevelKey, string[]>; // 每一环的条目，key是四个环中的一个，value是该环的技能数组
  };

  type Data = { categories: Category[] }; // 定义了一个 Data 类型，表示整个数据结构，包括多个分类

  // 数据状态（可编辑 JSON）
  const DEFAULT_DATA: Data = { // 定义了一个默认的数据对象，包含多个分类和每个分类的技能
    categories: [ // 分类数组
      {
        name: "计算机通识", // 分类名称
        skills: { // 技能对象
          comfortable: ["数据结构", "计算机网络", "HCI 研究方法"], // 舒适区技能
          challenging: ["系统设计", "安全合规理解"], // 挑战区技能
          near: ["分布式一致性"], // 近不胜任技能
          far: ["操作系统内核"], // 远不胜任技能
        },
      },
      {
        name: "技术栈",
        skills: {
          comfortable: ["Python", "C++ 基础", "Git"],
          challenging: ["D3/SVG", "Linux 运维"],
          near: ["K8s"],
          far: ["内核态开发"],
        },
      },
      {
        name: "前端",
        skills: {
          comfortable: ["React", "Tailwind", "TypeScript 基础"],
          challenging: ["性能优化", "Web 安全"],
          near: ["WebGL"],
          far: ["浏览器内核原理"],
        },
      },
      {
        name: "设计",
        skills: {
          comfortable: ["交互流程", "信息架构", "可用性评估"],
          challenging: ["动效设计", "可视化编码"],
          near: ["插画"],
          far: ["3D 建模"],
        },
      },
      {
        name: "沟通协作",
        skills: {
          comfortable: ["跨部门对齐", "需求澄清", "会议纪要"],
          challenging: ["冲突化解", "利益相关人管理"],
          near: ["公开演讲"],
          far: ["大型路演"],
        },
      },
      {
        name: "科研与写作",
        skills: {
          comfortable: ["英文写作", "审稿 rebuttal", "质性编码"],
          challenging: ["实验设计", "量化统计"],
          near: ["可重复实验工程化"],
          far: ["大型纵向研究组织"],
        },
      },
      {
        name: "产品",
        skills: {
          comfortable: ["PRD/里程碑", "竞品分析", "数据闭环"],
          challenging: ["商业化策略", "增长实验"],
          near: ["定价模型"],
          far: ["生态平台化"],
        },
      },
      {
        name: "运营",
        skills: {
          comfortable: ["使用分析", "工单回访", "指标看板"],
          challenging: ["A/B 测试", "风控策略迭代"],
          near: ["精细化分层运营"],
          far: ["海量多租户运营"],
        },
      },
    ],
  };

  //状态管理
  //data：数据状态变量，当前内存里的数据状态
  //setData：更新数据状态的函数
  const [data, setData] = useState<Data>(() => { // 使用 useState 钩子创建一个名为 data 的状态变量，并提供一个初始值
    try { // 初始化懒函数，尝试从浏览器的本地存储中获取名为 "cci-data" 的数据
      const saved = localStorage.getItem("cci-data"); // 如果存在，则将其解析为 JSON 对象并作为初始值返回，localStorage：浏览器提供的本地存储机制，getItem：获取指定键名的数据
      return saved ? JSON.parse(saved) : DEFAULT_DATA; // 如果不存在，则使用 DEFAULT_DATA 作为初始值，Json.parse：将 JSON 字符串转换为 JavaScript 对象
    } catch { // 如果解析失败（例如数据格式不正确），则捕获异常并返回 DEFAULT_DATA 作为初始值
      return DEFAULT_DATA;
    }
  });
  //左侧的文本框直接显示和编辑Json
  //jsonText：JSON 文本状态变量，当前文本框里的 JSON 字符串，存储一个字符版本的 data
  //setJsonText：更新 JSON 文本状态的函数
  //Json.stringify：将 JavaScript 对象转换为 JSON 字符串。 null：表示不进行任何替换操作，2：表示每个缩进级别使用两个空格进行缩进，从而使输出的 JSON 字符串更易读
  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(data, null, 2));// 创建一个名为 jsonText 的状态变量，用于存储 JSON 文本表示形式，并将 data 对象转换为格式化的 JSON 字符串作为初始值

  //同步逻辑
  // 数据变更时同步到本地存储与文本框
  useEffect(() => { // 使用 useEffect 钩子监听 data 变量的变化
    // 当 data 变量发生变化时，执行以下副作用函数，localStorage.setItem：将数据保存到浏览器的本地存储中
    localStorage.setItem("cci-data", JSON.stringify(data)); // 当 data 发生变化时，将其字符串化并保存到浏览器的本地存储中，键名为 "cci-data"
    setJsonText(JSON.stringify(data, null, 2)); // 同时更新 jsonText 变量，使其反映最新的 data 状态
  }, [data]); // 依赖项数组，表示只有当 data 变量发生变化时，才会触发该副作用函数

  // 画布尺寸
  const size = 720; // SVG 正方形尺寸
  const cx = size / 2; // 圆心 x 坐标
  const cy = size / 2; // 圆心 y 坐标
  // 已不再使用固定环宽/环间距
  const padAngle = 0; // 各类别之间不用留间隙
  const innerCore = 20; // 中心留出更多空间
  // 旧的“按环对比最大值”的统计已不需要，改为每个 skill 固定径向增量

  // 绘图辅助函数
  // 工具函数：极坐标 -> 笛卡尔
  const polar = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]; // polar 函数将极坐标 (r, a) 转换为笛卡尔坐标 (x, y)，其中 r 是半径，a 是角度（弧度），cx 和 cy 是圆心坐标

  // 构造圆环扇形 Path
  const arcPath = ( // arcPath 函数用于生成一个圆环扇形的 SVG 路径字符串
    innerR: number, // 内半径
    outerR: number, // 外半径
    startAngle: number, // 起始角度（弧度）
    endAngle: number // 结束角度（弧度）
  ) => {
    const [x0, y0] = polar(innerR, startAngle); // 计算内半径起始点的笛卡尔坐标
    const [x1, y1] = polar(outerR, startAngle); // 计算外半径起始点的笛卡尔坐标
    const [x2, y2] = polar(outerR, endAngle); // 计算外半径结束点的笛卡尔坐标
    const [x3, y3] = polar(innerR, endAngle); // 计算内半径结束点的笛卡尔坐标
    // largeArc 标志，决定使用大弧还是小弧绘制圆弧，如果角度差大于 180 度（π 弧度），则使用大弧
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    //SVG画图路径命令
    return [ // 返回一个字符串，表示 SVG 路径命令
      `M ${x0} ${y0}`, // 移动到内半径起始点，Move to
      `L ${x1} ${y1}`, // 画一条线到外半径起始点，Line to
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`, // 画一条外半径圆弧到外半径结束点，Arc to
      `L ${x3} ${y3}`, // 画一条线到内半径结束点，Line to
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x0} ${y0}`, // 画一条内半径圆弧到内半径起始点，Arc to
      "Z", // 关闭路径，Close path
    ].join(" "); // 使用空格连接所有路径命令，形成完整的路径字符串
  };

  // 交互状态
  // hoverInfo：悬停提示信息状态变量，存储当前悬停的分类索引、层级、技能列表和鼠标位置
  // setHoverInfo：更新悬停提示信息的函数
  // active：高亮状态变量，存储当前高亮的分类索引和层级
  // setActive：更新高亮状态的函数
  const [hoverInfo, setHoverInfo] = useState< // 悬停提示信息
    //catIndex：分类索引
    //level：层级
    //skills：技能列表
    //x：鼠标 x 坐标
    //y：鼠标 y 坐标
    | { catIndex: number; level: LevelKey; skills: string[]; x: number; y: number } // 悬停时的信息，包括分类索引、层级、技能列表和鼠标位置
    | null // 没有悬停时为 null
  >(null); // 初始值为 null，表示没有悬停信息
  const [active, setActive] = useState<{ catIndex: number | null; level: LevelKey | null }>({ // 高亮状态
    //catIndex：分类索引
    //level：层级
    catIndex: null, // 初始值为 null，表示没有高亮分类
    level: null, // 初始值为 null，表示没有高亮层级
  });

  // 导出：SVG / PNG
  // SVGSVGElement：表示 SVG 元素的类型
  // useRef：创建一个引用变量，用于获取 DOM 元素的引用
  const svgRef = useRef<SVGSVGElement | null>(null); // 创建一个名为 svgRef 的引用变量，用于获取 SVG 元素的引用，初始值为 null
  // 图表容器引用，用于计算悬浮提示的相对位置
  const chartRef = useRef<HTMLDivElement | null>(null);
  // 右侧图表卡片高度（用于让左侧列等高，从而保证图例底部与图表卡片底部对齐）
  const [chartCardH, setChartCardH] = useState<number | null>(null); // 创建一个名为 chartCardH 的状态变量，用于存储图表卡片的高度，初始值为 null
  useEffect(() => { // 使用 useEffect 钩子监听组件挂载时的副作用
    if (!chartRef.current) return; // 如果 chartRef.current 为 null，则直接返回，避免后续代码报错
    const el = chartRef.current; // 获取 chartRef.current 的引用
    const apply = () => setChartCardH(el.getBoundingClientRect().height); // 定义一个名为 apply 的函数，用于获取图表卡片的高度并更新 chartCardH 变量
    apply(); // 初始应用一次
    const ro = new ResizeObserver(() => apply()); // 创建一个 ResizeObserver 实例，用于监听图表卡片的大小变化
    ro.observe(el); // 开始监听图表卡片元素的大小变化
    return () => ro.disconnect(); // 清理函数，组件卸载时断开观察器连接
  }, []);

  // 组装“图表 + 图例”的导出 SVG（向量化，图例绘制在图表下方）
  const buildCompositeSVG = (): SVGSVGElement | null => {
    if (!svgRef.current) return null; // 如果 svgRef.current 为 null，则返回 null，表示无法构建复合 SVG
    const pad = 24; // 外边距
    const legendPad = 12; // 图例内边距
    const legendTitleH = 18; // 图例标题高度
    const legendItemH = 22; // 图例项高度
    const legendItemGap = 6; // 图例项间距
    const legendRect = 14; // 图例色块大小
    const legendH = legendPad * 2 + legendTitleH + 8 + LEVELS.length * (legendItemH) + legendItemGap; // 图例总高度

    const totalW = size + pad * 2; // 总宽度
    const totalH = size + pad + legendH + pad; // 总高度

    const svgNS = "http://www.w3.org/2000/svg"; // SVG 命名空间
    const wrapper = document.createElementNS(svgNS, "svg"); // 创建一个 SVG 元素作为包装容器
    wrapper.setAttribute("xmlns", svgNS); // 设置命名空间属性
    wrapper.setAttribute("width", String(totalW)); // 设置宽度属性
    wrapper.setAttribute("height", String(totalH)); // 设置高度属性
    wrapper.setAttribute("viewBox", `0 0 ${totalW} ${totalH}`); // 设置视口属性

    // 克隆现有图表 SVG，嵌入到包装 SVG 中（保持向量）
    const chartClone = svgRef.current.cloneNode(true) as SVGSVGElement; // 克隆现有的 SVG 图表元素，true 参数表示进行深度克隆，返回值类型为 SVGSVGElement
    chartClone.removeAttribute("style"); // 移除样式属性
    chartClone.setAttribute("x", String(pad)); // 设置 x 坐标属性
    chartClone.setAttribute("y", String(pad)); // 设置 y 坐标属性
    chartClone.setAttribute("width", String(size)); // 设置宽度属性
    chartClone.setAttribute("height", String(size)); // 设置高度属性
    wrapper.appendChild(chartClone); // 将克隆的图表 SVG 添加到包装容器中

    // 绘制图例（纵向列表）
    const gLegend = document.createElementNS(svgNS, "g"); // 创建一个 SVG 组元素作为图例容器
    gLegend.setAttribute("transform", `translate(${pad}, ${pad + size})`); // 设置图例的平移变换属性

    // 背板（柔和背景）
    const bg = document.createElementNS(svgNS, "rect"); // 创建一个矩形元素作为图例的背景
    bg.setAttribute("x", "0"); // 设置 x 坐标属性
    bg.setAttribute("y", "0"); // 设置 y 坐标属性
    bg.setAttribute("width", String(size)); // 设置宽度属性
    bg.setAttribute("height", String(legendH)); // 设置高度属性
    bg.setAttribute("rx", "12"); // 设置圆角半径属性
    bg.setAttribute("fill", "#ffffff"); // 设置填充颜色为白色
    bg.setAttribute("stroke", "#e5e7eb"); // slate-200
    gLegend.appendChild(bg); // 将背景矩形添加到图例容器中

    // 标题
    const title = document.createElementNS(svgNS, "text"); // 创建一个文本元素作为图例的标题
    title.textContent = "图例 Legend"; // 设置标题文本内容
    title.setAttribute("x", String(legendPad)); // 设置 x 坐标属性
    title.setAttribute("y", String(legendPad + legendTitleH)); // 设置 y 坐标属性
    title.setAttribute("fill", "#334155"); // slate-700
    title.setAttribute("font-size", "14"); // 设置字体大小属性
    title.setAttribute("font-weight", "600"); // 设置字体粗细属性
    title.setAttribute("dominant-baseline", "hanging"); // 设置基线对齐属性
    gLegend.appendChild(title); // 将标题文本添加到图例容器中

    // 列表项
    const startY = legendPad + legendTitleH + 8; // 列表起始 Y 坐标
    LEVELS.forEach((lv, idx) => {// 遍历每个层级，绘制图例项
      const itemY = startY + idx * (legendItemH); // 计算当前项的 Y 坐标

      const rect = document.createElementNS(svgNS, "rect"); // 创建一个矩形元素作为图例项的颜色块
      rect.setAttribute("x", String(legendPad)); // 设置 x 坐标属性
      rect.setAttribute("y", String(itemY + 2)); // 设置 y 坐标属性
      rect.setAttribute("width", String(legendRect)); // 设置宽度属性
      rect.setAttribute("height", String(legendRect)); // 设置高度属性
      rect.setAttribute("rx", "3"); // 设置圆角半径属性
      rect.setAttribute("fill", lv.color); // 设置填充颜色属性为当前层级的颜色
      gLegend.appendChild(rect); // 将颜色块矩形添加到图例容器中

      const text = document.createElementNS(svgNS, "text"); // 创建一个文本元素作为图例项的文本
      text.textContent = `${idx + 1}. ${lv.cn} / ${lv.en}`; // 设置图例项的文本内容，包含层级的中文和英文名称
      text.setAttribute("x", String(legendPad + legendRect + 8)); // 设置 x 坐标属性
      text.setAttribute("y", String(itemY + legendRect)); // 设置 y 坐标属性
      text.setAttribute("fill", "#475569"); // slate-600
      text.setAttribute("font-size", "13"); // 设置字体大小属性
      text.setAttribute("dominant-baseline", "alphabetic"); // 设置基线对齐属性
      gLegend.appendChild(text); // 将图例项文本添加到图例容器中
    });

    wrapper.appendChild(gLegend); // 将图例容器添加到包装容器中
    return wrapper; // 返回构建好的复合 SVG 元素
  };

  // 下载 SVG 文件（包含图例）
  const downloadSVG = () => {
    const composite = buildCompositeSVG(); // 构建复合 SVG 元素
    if (!composite) return; // 如果构建失败，则直接返回
    const serializer = new XMLSerializer(); // 创建一个 XML 序列化器实例
    const src = serializer.serializeToString(composite); // 将复合 SVG 元素序列化为字符串
    const blob = new Blob([src], { type: "image/svg+xml;charset=utf-8" }); // 创建一个 Blob 对象，表示 SVG 文件的数据
    const url = URL.createObjectURL(blob); // 创建一个指向 Blob 对象的 URL
    const a = document.createElement("a"); // 创建一个锚点元素用于下载
    a.href = url; // 设置锚点的 href 属性为 Blob URL
    a.download = `能力同心圆_${new Date().toISOString().slice(0, 10)}.svg`; // 设置下载文件名，包含当前日期
    a.click(); // 触发下载
    URL.revokeObjectURL(url); // 释放 Blob URL，避免内存泄漏
  };

  // 下载 PNG 文件（包含图例）
  const downloadPNG = () => {
    const composite = buildCompositeSVG(); // 构建复合 SVG 元素
    if (!composite) return; // 如果构建失败，则直接返回
    const serializer = new XMLSerializer(); // 创建一个 XML 序列化器实例
    const src = serializer.serializeToString(composite); // 将复合 SVG 元素序列化为字符串
    // SVG 转 PNG：先转 base64，再绘制到 Canvas，然后导出 PNG Blob
    const img = new Image(); // 创建一个新的图像对象
    const svg64 = btoa(unescape(encodeURIComponent(src))); // 将 SVG 字符串进行编码并转换为 Base64 格式
    img.src = `data:image/svg+xml;base64,${svg64}`; // 设置图像对象的源为 Base64 编码的 SVG 数据
    img.onload = () => { // 当图像加载完成后执行以下操作
      const vb = composite.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, size, size]; // 获取复合 SVG 的 viewBox 属性，并将其拆分为数字数组
      const exportW = vb[2]; // 导出宽度
      const exportH = vb[3]; // 导出高度
      const scale = 2; // 2x 提升清晰度
      const canvas = document.createElement("canvas"); // 创建一个新的 Canvas 元素
      canvas.width = Math.ceil(exportW * scale); // 设置 Canvas 的宽度
      canvas.height = Math.ceil(exportH * scale); // 设置 Canvas 的高度
      const ctx = canvas.getContext("2d"); // 获取 Canvas 的 2D 渲染上下文
      if (!ctx) return; // 如果获取失败，则直接返回
      ctx.fillStyle = "#ffffff"; // PNG 背景白色
      ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充白色背景
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // 将 SVG 图像绘制到 Canvas 上，按比例放大
      canvas.toBlob((blob) => { // 将 Canvas 内容导出为 Blob 对象
        if (!blob) return; // 如果导出失败，则直接返回
        const url = URL.createObjectURL(blob); // 创建一个指向 Blob 对象的 URL
        const a = document.createElement("a"); // 创建一个锚点元素用于下载
        a.href = url; // 设置锚点的 href 属性为 Blob URL
        a.download = `能力同心圆_${new Date().toISOString().slice(0, 10)}.png`; // 设置下载文件名，包含当前日期
        a.click(); // 触发下载
        URL.revokeObjectURL(url); // 释放 Blob URL，避免内存泄漏
      });
    };
  };

  // 应用 JSON,简单校验
  const tryApplyJSON = () => { // tryApplyJSON 函数用于尝试将 jsonText 中的 JSON 字符串解析为对象，并更新 data 状态
    try { // 使用 try-catch 块捕获解析过程中可能出现的错误
      const next = JSON.parse(jsonText); // 尝试将 jsonText 字符串解析为 JSON 对象，存储在 next 变量中
      // 简单校验
      if (!next.categories || !Array.isArray(next.categories)) throw new Error("JSON 结构需包含 categories 数组"); // 如果解析结果不包含 categories 数组，则抛出错误
      setData(next);// 如果解析成功且通过校验，则调用 setData 函数更新 data 状态为解析结果
    } catch (e: any) {  // 如果解析失败或校验不通过，则捕获错误并弹出提示
      alert("JSON 解析失败：" + e.message); // alert：浏览器提供的弹出提示函数，e.message：错误对象的消息属性，包含错误的具体信息
    }
  };

  // 计算
  const cats = data.categories; // 分类数组
  const n = cats.length; // 分类数量
  const angleStep = (2 * Math.PI) / Math.max(1, n); // 每个扇区的角度步长，确保至少有一个分类，避免除以 0

  // 每个 skill 的固定径向增量：根据“最大总技能数”的类别进行自适应，确保整体不溢出画布
  // 根据外圈类别标签的最大宽度动态收缩图表（增大外侧留白）以避免标签溢出
  const LABEL_FONT_SIZE = 14; // 类别标签字号
  const LABEL_OFFSET = 8;     // 类别标签与圆环的水平间距（与 CategoryLabel 内部保持一致）
  const SKILL_TEXT_FLOW: 'cw' | 'ccw' = 'cw'; // 技能文字沿弧线统一方向：'cw' 顺时针，'ccw' 逆时针
  const estimateTextWidth = (s: string, fs: number) => {
    // 简易宽度估算：按字符类型赋予不同宽度
    const wAscii = fs * 0.56; // 拉丁字母/数字/常规标点
    const wSpace = fs * 0.35; // 空格
    const wCJK = fs * 0.95;  // 中日韩/全角
    const wEmoji = fs * 1.2;  // emoji 等
    let acc = 0; // 累计宽度
    for (const ch of s) { // 遍历字符串中的每个字符
      const cp = ch.codePointAt(0)!; // 获取字符的 Unicode 码点
      if (/\s/.test(ch)) acc += wSpace; // 空白字符
      else if (
        (cp >= 0x3400 && cp <= 0x9FFF) || // CJK Unified & Ext A
        (cp >= 0xF900 && cp <= 0xFAFF) || // CJK Compatibility Ideographs
        (cp >= 0x3040 && cp <= 0x30FF) || // Hiragana & Katakana
        (cp >= 0xAC00 && cp <= 0xD7A3) || // Hangul
        (cp >= 0xFF00 && cp <= 0xFFEF)    // 全角及兼容形式
      ) acc += wCJK; // 中日韩/全角
      else if ((cp >= 0x1F300 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF)) acc += wEmoji; // Emoji & Symbols
      else acc += wAscii; // 其他字符按拉丁字母处理
    }
    return acc; // 返回估算的总宽度
  };
  const maxLabelWidth = useMemo(() => Math.max(1, ...cats.map(c => estimateTextWidth(c.name, LABEL_FONT_SIZE))), [cats]); // 计算所有类别标签中最长的标签宽度，使用 useMemo 进行缓存，避免重复计算
  // 将字符串按最大宽度截断并追加省略号（若空间极小，直接隐藏）
  const fitTextToWidth = (s: string, fs: number, maxW: number) => { // fitTextToWidth 函数用于将字符串 s 截断以适应最大宽度 maxW，并在必要时添加省略号
    const ellipsis = "…"; // 省略号字符
    const wEllipsis = fs * 0.95; // 估算省略号宽度
    if (maxW <= fs * 0.7) return ""; // 空间太小则不渲染
    let acc = 0; // 累计宽度
    for (let i = 0; i < s.length; i++) { // 遍历字符串中的每个字符
      const ch = s[i]; // 当前字符
      const w = estimateTextWidth(ch, fs); // 估算当前字符的宽度
      const remain = maxW - acc; // 剩余可用宽度
      const needEllipsis = i < s.length - 1; // 是否需要添加省略号
      const allow = needEllipsis ? (w + wEllipsis) : w; // 计算当前字符及省略号所需的总宽度
      if (remain >= allow) { // 如果剩余宽度足够容纳当前字符及省略号
        acc += w; // 累加当前字符宽度
        continue; // 继续处理下一个字符
      }
      return s.slice(0, i) + (i > 0 ? ellipsis : ""); // 截断字符串并添加省略号（如果有字符被截断）
    }
    return s; // 如果字符串未被截断，返回原始字符串
  };
  // 预留：标签与圆环的间距 + 最大标签宽度 + 画布安全边距（含描边）
  const outerPadding = Math.max(28, LABEL_OFFSET + Math.ceil(maxLabelWidth) + 8);
  // 统计每类总技能数，并在“舒适区有技能”时加 2 圈的预留空带，使整体外移两圈
  const perCatTotals = useMemo(() => // 计算每个分类的总技能数，并根据舒适区的存在调整预留圈数
    cats.map(cat => { // 遍历每个分类
      const total = (Object.keys(cat.skills) as LevelKey[]) // 获取所有技能层级
        .reduce((sum, k) => sum + (cat.skills[k]?.length || 0), 0); // 计算该分类的总技能数
      const comfyHas = (cat.skills.comfortable?.length || 0) > 0; // 判断舒适区是否有技能
      const comfySpacerRows = comfyHas ? 3 : 0; // 舒适区存在时空带改为3圈
      const baseSpacerRows = !comfyHas && total > 0 ? 3 : 0; // 若无舒适区但有其他层级，整体外移3圈
      return total + comfySpacerRows + baseSpacerRows; // 返回调整后的总技能数
    }), [cats]
  );
  const maxTotal = useMemo(() => Math.max(1, ...perCatTotals), [perCatTotals]); // 计算所有分类中最大的总技能数，使用 useMemo 进行缓存，避免重复计算

  // 每个 skill 的固定径向厚度 & 全局标签字号
  const maxRad = size / 2 - outerPadding; // 最外可用半径
  const UNIT_PER_SKILL = Math.max(6, (maxRad - innerCore) / maxTotal); // 每个 skill 的固定径向厚度（最小 6px）
  // 全局统一标签字号：由行高（UNIT_PER_SKILL）决定，上限 12，下限 7
  const chartFontSize = Math.max(7, Math.min(12, Math.floor(UNIT_PER_SKILL - 2))); // 图表内文字字号

  // 轻量提示：顶部居中，仅展示一个
  function setToast(message: string) {
    // 查找或创建容器
    let toastContainer = document.getElementById("cci-toast-container") as HTMLDivElement | null; // 获取提示消息容器元素
    if (!toastContainer) { // 如果容器不存在，则创建一个新的容器元素
      toastContainer = document.createElement("div"); // 创建一个新的 div 元素作为提示消息容器
      toastContainer.id = "cci-toast-container"; // 设置容器的 id 属性
      toastContainer.style.position = "fixed"; // 设置容器的定位方式为固定定位
      toastContainer.style.top = "20px"; // 设置容器的顶部位置  
      toastContainer.style.left = "50%"; // 设置容器的左侧位置为屏幕宽度的 50%
      toastContainer.style.transform = "translateX(-50%)"; // 使用 CSS transform 将容器水平居中
      toastContainer.style.zIndex = "9999"; // 设置容器的 z-index 属性，确保其在其他元素之上显示
      toastContainer.style.display = "flex"; // 设置容器的显示方式为 flex 布局
      toastContainer.style.flexDirection = "column"; // 设置容器的主轴方向为垂直方向
      toastContainer.style.alignItems = "center"; // 设置容器的子元素在交叉轴上居中对齐
      toastContainer.style.pointerEvents = "none"; // 允许点击穿透到底层元素
      document.body.appendChild(toastContainer); // 将容器添加到文档的 body 元素中
    } else {
      // 只保留单条
      toastContainer.innerHTML = ""; // 如果容器已存在，则清空其内容，只保留一条提示消息
    }

    // 创建提示消息元素
    const toastEl = document.createElement("div"); // 创建一个新的 div 元素作为提示消息
    toastEl.textContent = message; // 设置提示消息的文本内容
    toastEl.style.backgroundColor = "rgba(254, 189, 189, 0.9)"; // 红色背景，tailwind rose-300 90% 不透明
    toastEl.style.color = "#171717"; // tailwind gray-900
    toastEl.style.padding = "10px 15px"; // 内边距
    toastEl.style.marginBottom = "10px"; // 底部外边距
    toastEl.style.borderRadius = "6px"; // 圆角
    toastEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)"; // 阴影
    toastEl.style.fontSize = "14px"; // 字号
    toastEl.style.maxWidth = "260px"; // 最大宽度
    toastEl.style.pointerEvents = "auto"; // 允许交互

    // 添加并在 2 秒后清理
    toastContainer.appendChild(toastEl); // 将提示消息添加到容器中
    setTimeout(() => { // 设置一个定时器，在 2 秒后执行以下操作
      if (toastEl.parentNode === toastContainer) { // 如果提示消息仍在容器中
        toastContainer.removeChild(toastEl); // 则将其从容器中移除
      }
      if (toastContainer.parentNode === document.body && toastContainer.childNodes.length === 0) { // 如果容器已没有子节点
        document.body.removeChild(toastContainer);// 则将容器从文档的 body 元素中移除
      }
    }, 2000); // 2000 毫秒（2 秒）后执行清理操作
  }

  // 交互式编辑：本地表单状态与操作
  const [newCatName, setNewCatName] = useState<string>(""); // 新增分类名称输入框状态
  const [drafts, setDrafts] = useState<Record<number, { name: string; newSkill: Record<LevelKey, string> }>>({}); // 分类草稿状态
  // 拖拽排序：仅在左侧交互式编辑区域内使用
  const [dragItem, setDragItem] = useState< // 被拖拽项的信息状态变量 
    | { catIndex: number; level: LevelKey; index: number } // 被拖拽项的信息，包括分类索引、层级和技能索引
    | null // 初始值为 null，表示没有被拖拽项
  >(null); // 初始值为 null，表示没有被拖拽项 
  const [dragOver, setDragOver] = useState< // 拖拽悬停目标的信息状态变量
    | { catIndex: number; level: LevelKey; index: number | "end" } // 拖拽悬停目标的信息，包括分类索引、层级和技能索引或 "end"（表示悬停在最后一个位置）
    | null
  >(null); // 初始值为 null，表示没有拖拽悬停目标

  // 工具：数组重排
  function reorder<T>(arr: T[], from: number, to: number): T[] { // reorder 函数用于在数组 arr 中将元素从索引 from 移动到索引 to，并返回新的数组
    const a = arr.slice(); // 创建数组的浅拷贝，避免修改原数组
    if (from === to) return a; // 如果源索引和目标索引相同，则直接返回拷贝的数组
    const item = a.splice(from, 1)[0]; // 从数组中移除源索引处的元素，并保存该元素
    const safeTo = Math.max(0, Math.min(to, a.length)); // 计算安全的目标索引，确保不超出数组边界
    a.splice(safeTo, 0, item); // 在目标索引处插入移除的元素
    return a; // 返回重排后的新数组
  }

  function moveSkill(catIndex: number, level: LevelKey, fromIndex: number, toIndex: number) { // moveSkill 函数用于在指定分类和层级中移动技能的位置
    setData((prev) => ({ // 更新数据状态
      categories: prev.categories.map((c, i) => { // 遍历每个分类
        if (i !== catIndex) return c; // 如果不是目标分类，则返回原分类
        const arr = c.skills[level] || []; // 获取目标层级的技能数组
        // 同层内重排 
        const nextArr = reorder(arr, fromIndex, toIndex); // 使用 reorder 函数重排技能数组
        return { ...c, skills: { ...c.skills, [level]: nextArr } }; // 返回更新后的分类对象
      }),
    }));
  }

  // 同步草稿：为新增的分类建立默认草稿，避免受控组件报错
  useEffect(() => { // 当分类列表发生变化时，同步更新草稿状态
    setDrafts((prev) => { // 更新草稿状态
      const next = { ...prev }; // 创建草稿状态的浅拷贝
      cats.forEach((cat, i) => { // 遍历每个分类
        if (!next[i]) { // 如果草稿中不存在该分类的草稿
          next[i] = { // 创建一个新的草稿对象
            name: cat.name, // 设置分类名称
            newSkill: { comfortable: "", challenging: "", near: "", far: "" }, // 初始化新技能输入框为空字符串
          };
        }
      });
      return next; // 返回更新后的草稿状态
    });
  }, [cats]);

  // 工具：去首尾、去重判断
  const norm = (s: string) => s.trim();

  function addCategory() { // 添加新分类函数
    const name = norm(newCatName); // 规范化新分类名称，去除首尾空白字符
    if (!name) return; // 如果名称为空，则直接返回
    if (cats.some((c) => c.name === name)) { // 检查是否已存在同名分类
      setToast("分类已存在"); // 显示提示消息
      return; // 终止函数执行
    }
    setData((prev) => ({ // 更新数据状态，添加新分类
      categories: [ // 展开现有分类数组
        ...prev.categories, // 现有分类
        { name, skills: { comfortable: [], challenging: [], near: [], far: [] } }, // 新分类对象，包含名称和空技能列表
      ],
    }));
    setNewCatName(""); // 清空新分类名称输入框
  }

  function removeCategory(idx: number) { // 移除分类函数
    setData((prev) => ({ categories: prev.categories.filter((_, i) => i !== idx) })); // 更新数据状态，过滤掉指定索引的分类
  } // 移除分类函数

  function updateCategoryName(idx: number, name: string) { // 更新分类名称函数
    const v = norm(name); // 规范化名称，去除首尾空白字符
    if (!v) return; // 如果名称为空，则直接返回
    setData((prev) => ({ // 更新数据状态
      categories: prev.categories.map((c, i) => (i === idx ? { ...c, name: v } : c)), // 遍历分类数组，更新指定索引的分类名称
    })); // 更新数据状态
  } // 更新分类名称函数

  function addSkill(idx: number, level: LevelKey) { // 添加技能函数
    const raw = drafts[idx]?.newSkill[level] ?? ""; // 获取草稿中对应分类和层级的新技能输入值
    const v = norm(raw); // 规范化技能名称，去除首尾空白字符
    if (!v) return; // 如果名称为空，则直接返回
    const exists = (cats[idx]?.skills[level] || []).some((s) => s === v); // 检查技能是否已存在于指定分类和层级中
    if (exists) { // 如果技能已存在
      setToast("该技能已存在"); // 显示提示消息
      return; // 终止函数执行
    }
    setData((prev) => ({ // 更新数据状态，添加新技能
      categories: prev.categories.map((c, i) => // 遍历分类数组
        i === idx ? { ...c, skills: { ...c.skills, [level]: [...c.skills[level], v] } } : c // 如果是目标分类，则在指定层级的技能数组中添加新技能
      ),
    }));
    setDrafts((prev) => ({ // 更新草稿状态，清空对应输入框
      ...prev,// 保持其他草稿不变
      [idx]: {// 更新指定分类的草稿
        ...(prev[idx] || { name: cats[idx]?.name || "", newSkill: { comfortable: "", challenging: "", near: "", far: "" } }),
        newSkill: { ...(prev[idx]?.newSkill || { comfortable: "", challenging: "", near: "", far: "" }), [level]: "" },
      },
    }));
  }

  function removeSkill(idx: number, level: LevelKey, skillIndex: number) { // 移除技能函数
    setData((prev) => ({ // 更新数据状态
      categories: prev.categories.map((c, i) => // 遍历分类数组
        i === idx // 如果是目标分类
          ? { ...c, skills: { ...c.skills, [level]: c.skills[level].filter((_, j) => j !== skillIndex) } }
          : c
      ),
    }));
  }
  // SVG 渲染,布局
  return ( // 返回一个包含整个页面内容的 JSX 元素
    /* 页面整体布局 */
    /*min-h-screen：最小高度为屏幕高度，w-full：宽度为 100%，bg-rose-50：背景颜色为淡玫红色，text-slate-800：文字颜色为深灰色*/
    <div className="min-h-screen w-full bg-blue-100 text-slate-800"> {/* 页面背景和文字颜色 */}
      {/* mx-auto：水平居中，max-w-7xl：最大宽度为 7xl，px-6：水平内边距为 6，py-8：垂直内边距为 8 */}
      <div className="mx-auto max-w-full px-6 md:px-10 lg:px-16 xl:px-20 py-6 md:py-8 lg:py-10"> {/* 页面内容容器，响应式内边距更紧凑 */}
        {/* 页头 */}
        {/* mb-6：底部外边距为 6，flex：使用 Flexbox 布局，flex-wrap：允许换行，items-center：子项垂直居中，justify-between：主轴两端对齐，gap-3：子项之间的间距为 3 */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3"> {/* 页头，底部外边距为 6，使用 Flexbox 布局，允许换行，子项垂直居中，主轴两端对齐，子项之间的间距为 3 */}
          {/* text-2xl：文字大小为 2xl，font-bold：加粗，tracking-wide：字间距宽 */}
          <h1 className="text-2xl font-bold tracking-wide">能力同心圆 · Capability Concentric</h1> {/* 页头标题，文字大小为 2xl，加粗，字间距宽 */}
          {/* 其他内容 */}
          {/* flex：使用 Flexbox 布局，items-center：子项垂直居中，gap-3：子项之间的间距为 3 */}
          <div className="flex items-center gap-3"> {/* 其他内容容器，使用 Flexbox 布局，子项垂直居中，子项之间的间距为 3 */}
            {/* 下面的按钮样式相同，只是文字和点击事件不同 */}
            {/* rounded-3xl：圆角为 3xl，bg-white：背景颜色为白色，px-4：水平内边距为 4，py-2：垂直内边距为 2，text-sm：文字大小为小，shadow：带阴影，hover:shadow-md：悬停时阴影加深 */}
            <button onClick={downloadSVG} className="rounded-3xl bg-white px-4 py-2 text-sm shadow hover:shadow-md">导出 SVG</button> {/* 导出 SVG 按钮，点击时调用 downloadSVG 函数，圆角为 3xl，背景颜色为白色，水平内边距为 4，垂直内边距为 2，文字大小为小，带阴影，悬停时阴影加深 */}
            <button onClick={downloadPNG} className="rounded-3xl bg-white px-4 py-2 text-sm shadow hover:shadow-md">导出 PNG</button> {/* 导出 PNG 按钮，点击时调用 downloadPNG 函数，样式同上 */}
          </div>
        </header>

        {/* 主体：左右两栏布局（移动端垂直，桌面端水平；左固定宽度，右自适应） */}
        {/*flex：flex布局， flex-col:移动端垂直， gap-6:让 flex 子元素之间有固定间距。lg:flex-row: 当屏幕宽度 ≥ “large” 断点（默认 1024px）时，启用横向排列；items-stretch：让所有子项在 交叉轴（即上下方向）自动拉伸对齐高度。*/}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start"> {/* 顶部对齐，避免等高拉伸导致空白 */}
          {/* 左侧：编辑/说明（桌面端固定宽度，内部列布局，图例卡贴底） */}
          {/* space-y-6: 让子元素之间的垂直间距为 1.5rem（即 24px）lg:w-[420px]:当屏幕 ≥ lg（1024px） 时，这个 section 的宽度固定为 420px。lg:flex-none:这个区块保持固定宽度，不去参与弹性分配。 lg:flex:让它本身变成一个 flex 容器（只在大屏时生效）让它本身变成一个 flex 容器（只在大屏时生效）:配合前面的 space-y-6，可以轻松实现垂直排列的卡片组。 */}
          <section
            className="space-y-6 lg:w-[500px] lg:flex-none lg:flex lg:flex-col min-h-0"
            style={chartCardH ? { height: chartCardH } : undefined}
          >
            {/* 交互式编辑 */}
            <Card title="数据" className="flex flex-col flex-1 overflow-hidden min-h-0"> {/* 占满可用高度，内部滚动；min-h-0 允许子项正确收缩 */}
              <p className="text-xs text-slate-600">
                直接在下方按分类与层级逐条添加/删除技能，数据会自动保存到浏览器本地；需要时可展开“高级 JSON”查看或粘贴批量数据。
              </p>

              {/* 新增分类 */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }}
                  placeholder="新增分类名称"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button onClick={addCategory} className="rounded-xl bg-blue-500 px-3 py-2 text-sm text-white shadow hover:bg-blue-700">添加</button>
              </div>

              {/* 分类与技能编辑（可滚动区域，仅垂直滚动；JSON 不参与滚动） */}
              <div className="mt-4 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-4 pr-1 pb-2">
                  {cats.map((cat, idx) => (
                    <div key={cat.name + idx} className="rounded-2xl border border-slate-200 p-3">
                      {/* 分类名与操作 */}
                      <div className="flex items-center gap-2">
                        <input
                          value={drafts[idx]?.name ?? cat.name}
                          onChange={(e) => setDrafts((prev) => ({
                            ...prev,
                            [idx]: { ...(prev[idx] || { name: cat.name, newSkill: { comfortable: "", challenging: "", near: "", far: "" } }), name: e.target.value },
                          }))}
                          onBlur={() => updateCategoryName(idx, drafts[idx]?.name ?? cat.name)}
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                        <button onClick={() => updateCategoryName(idx, drafts[idx]?.name ?? cat.name)} className="rounded-xl bg-white px-3 py-2 text-sm shadow">保存</button>
                        <button onClick={() => removeCategory(idx)} className="rounded-xl bg-white px-3 py-2 text-sm text-rose-600 shadow hover:bg-rose-50">删除</button>
                      </div>

                      {/* 层级编辑 */}
                      <div className="mt-3 grid grid-cols-1 gap-3">
                        {(LEVELS as readonly { key: LevelKey; cn: string; en: string; color: string }[]).map((lv) => (
                          <div key={lv.key} className="rounded-xl border border-slate-100 p-2">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded" style={{ background: lv.color }} />
                                <span className="text-sm font-medium">{lv.cn}</span>
                              </div>
                            </div>
                            {/* 已有技能 chips（支持拖拽排序，仅限同一分类同一层级） */}
                            <div
                              className="flex flex-wrap gap-2"
                              onDragOver={(e) => {
                                // 允许放置到末尾
                                if (dragItem && dragItem.catIndex === idx && dragItem.level === lv.key) {
                                  e.preventDefault();
                                  setDragOver({ catIndex: idx, level: lv.key, index: "end" });
                                }
                              }}
                              onDrop={(e) => {
                                if (!dragItem) return;
                                if (dragItem.catIndex === idx && dragItem.level === lv.key) {
                                  e.preventDefault();
                                  const toIndex = (cat.skills[lv.key] || []).length; // 末尾
                                  moveSkill(idx, lv.key, dragItem.index, toIndex);
                                }
                                setDragItem(null);
                                setDragOver(null);
                              }}
                              onDragLeave={() => {
                                if (dragOver && dragOver.catIndex === idx && dragOver.level === lv.key) setDragOver(null);
                              }}
                            >
                              {(cat.skills[lv.key] || []).map((s, si) => {
                                const isDragOver = dragOver && dragOver.catIndex === idx && dragOver.level === lv.key && dragOver.index === si;
                                const isDragging = dragItem && dragItem.catIndex === idx && dragItem.level === lv.key && dragItem.index === si;
                                return (
                                  <span
                                    key={s + si}
                                    draggable
                                    onDragStart={(e) => {
                                      setDragItem({ catIndex: idx, level: lv.key, index: si });
                                      try { e.dataTransfer.setData("text/plain", JSON.stringify({ catIndex: idx, level: lv.key, index: si })); } catch { }
                                      e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onDragEnd={() => { setDragItem(null); setDragOver(null); }}
                                    onDragOver={(e) => {
                                      if (dragItem && dragItem.catIndex === idx && dragItem.level === lv.key) {
                                        e.preventDefault();
                                        setDragOver({ catIndex: idx, level: lv.key, index: si });
                                      }
                                    }}
                                    onDrop={(e) => {
                                      if (!dragItem) return;
                                      if (dragItem.catIndex === idx && dragItem.level === lv.key) {
                                        e.preventDefault();
                                        // 放到该项前面
                                        let to = si;
                                        // 若从前面拖到后面且跨越自身，目标应-1
                                        if (dragItem.index < si) to = si - 1;
                                        moveSkill(idx, lv.key, dragItem.index, to);
                                      }
                                      setDragItem(null);
                                      setDragOver(null);
                                    }}
                                    className={
                                      `group inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs select-none ` +
                                      ` ${isDragging ? "opacity-50 border-blue-300 bg-blue-50" : "bg-white border-slate-200"}` +
                                      ` ${isDragOver ? " ring-2 ring-blue-400" : ""}`
                                    }
                                    title="拖拽以排序"
                                  >
                                    <span>{s}</span>
                                    <button onClick={() => removeSkill(idx, lv.key, si)} className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>
                                  </span>
                                );
                              })}
                              {!(cat.skills[lv.key] || []).length && (
                                <span className="text-xs text-slate-400">（暂无条目）</span>
                              )}
                              {/* 末尾放置提示 */}
                              {dragOver && dragOver.catIndex === idx && dragOver.level === lv.key && dragOver.index === "end" && (
                                <span className="inline-block h-6 w-12 rounded-full border-2 border-dashed border-blue-300" />
                              )}
                            </div>
                            {/* 新增技能行 */}
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                value={drafts[idx]?.newSkill?.[lv.key] ?? ""}
                                onChange={(e) => setDrafts((prev) => ({
                                  ...prev,
                                  [idx]: {
                                    ...(prev[idx] || { name: cat.name, newSkill: { comfortable: "", challenging: "", near: "", far: "" } }),
                                    newSkill: { ...(prev[idx]?.newSkill || { comfortable: "", challenging: "", near: "", far: "" }), [lv.key]: e.target.value },
                                  },
                                }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') addSkill(idx, lv.key); }}
                                placeholder={`添加 ${lv.cn} 技能`}
                                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
                              />
                              <button onClick={() => addSkill(idx, lv.key)} className="rounded-xl bg-white px-2.5 py-1.5 text-xs shadow">添加</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {/* 高级：JSON 折叠区（固定在卡片底部，不参与滚动） */}
              <details className="mt-4 rounded-xl border border-slate-200 bg-white/70">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm">高级：JSON（展开以粘贴或导出）</summary>
                <div className="space-y-2 p-3">
                  <textarea
                    className="min-h-[10rem] w-full flex-1 resize-none rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs leading-5 shadow-inner"
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button onClick={tryApplyJSON} className="rounded-xl bg-blue-500 px-4 py-2 text-sm text-white shadow hover:bg-blue-700">应用 JSON</button>
                    <button onClick={() => setJsonText(JSON.stringify(DEFAULT_DATA, null, 2))} className="rounded-xl bg-white px-4 py-2 text-sm shadow">恢复示例</button>
                    <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); setToast("复制成功！"); }} className="rounded-xl bg-white px-4 py-2 text-sm shadow">复制当前 JSON</button>
                  </div>
                </div>
              </details>
            </Card>
            {/* 图例 */}
            <div>
              <Card title="图例">
                {/* space-y-2: 子项垂直间距为 2 */}
                <ul className="space-y-1.5">
                  {/* 遍历 LEVELS 数组，显示每个环的图例 */}
                  {LEVELS.map((lv, idx) => ( //LEVELS.map((lv, idx) => (：遍历 LEVELS 数组，为每个元素 lv 和其索引 idx 返回一个 JSX 元素
                    // key={lv.key}：为每个列表项设置唯一的 key 属性，React 使用它来优化渲染性能
                    // flex：使用 Flexbox 布局，items-center：子项垂直居中，gap-3：子项之间的间距为 3
                    <li key={lv.key} className="flex items-center gap-3">
                      {/* color：扇区颜色 */}
                      <span className="inline-block h-4 w-4 rounded" style={{ background: lv.color }} />
                      <span className="text-sm">{idx + 1}. {lv.cn} <span className="text-slate-500">/ {lv.en}</span></span>
                    </li>
                  ))}
                </ul>
                {/* 说明：扇形径向厚度表示数量，颜色用于区分层级 */}
                {/*mt-3: 上外边距为 3, text-xs: 文字大小为超小, text-slate-500: 文字颜色为浅灰色 */}
                <p className="mt-3 text-xs text-slate-500">提示：每个技能贡献固定的径向长度，四个层级按顺序从中心向外累加，层与层无缝衔接；颜色仅用于区分层级。</p>
              </Card>
            </div>
          </section>

          {/* 右侧：可视化（自适应剩余宽度） */}
          {/*lg:flex-1:让右边“吃掉剩余空间”; lg:min-w-0：防止右栏“内容撑破布局”*/}
          <section className="lg:flex-1 lg:min-w-0"> {/* 右侧占满剩余空间 */}

            <div ref={chartRef} className="relative rounded-3xl bg-white p-6 md:p-8 shadow w-full"> {/* 增加内边距，卡片周围有留白 */}
              {/* SVG 画布：限制最大宽度，四周留白更舒适 */}
              <div className="mx-auto w-full max-w-[720px] lg:max-w-[840px]">
                <div className="relative w-full my-2 md:my-4" style={{ aspectRatio: "1 / 1" }}>
                  <svg ref={svgRef} className="absolute inset-0 h-full w-full" width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
                    {/* 背景光晕与备用渐变（目前扇区使用纯色 + 行内不透明度递减） */}
                    <defs>
                      {/* 定义一个径向渐变，id 为 bgGlow，中心点在 (50%, 50%)，半径为 50% */}
                      <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                        {/* 渐变颜色和透明度变化 */}
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="70%" stopColor="#fecdd3" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#fecdd3" stopOpacity="0.2" />
                      </radialGradient>
                      {/* 若未来需要回到整体渐变，可调整这些 defs 并在填充处引用 */}
                    </defs>
                    {/* 使用径向渐变填充背景光晕 */}
                    <circle cx={cx} cy={cy} r={size / 2} fill="url(#bgGlow)" />

                    {/* 环形图（层级径向累加） */}
                    {cats.map((cat, i) => {
                      const start = i * angleStep + padAngle / 2; // 扇区起始角
                      const end = (i + 1) * angleStep - padAngle / 2; // 扇区结束角
                      const mid = (start + end) / 2; // 扇区中点角

                      return (
                        <g key={cat.name}>
                          {(() => {
                            const totalRaw = (Object.keys(cat.skills) as LevelKey[])
                              .reduce((sum, k) => sum + (cat.skills[k]?.length || 0), 0);
                            const comfyCount = cat.skills.comfortable?.length || 0;
                            const needsBaseSpacer = comfyCount === 0 && totalRaw > 0;
                            let currInner = innerCore + (needsBaseSpacer ? UNIT_PER_SKILL : 0); // 最内侧整体外移1圈（当无舒适区但有内容）
                            return LEVELS.map((lv) => {
                              const count = cat.skills[lv.key]?.length || 0;
                              // 在舒适区层若有技能，则预留两圈空带（不渲染技能，仅用于外移）
                              const spacerRows = lv.key === 'comfortable' && count > 0 ? 3 : 0; // 改为3圈
                              const spacer = spacerRows * UNIT_PER_SKILL;
                              const thickness = count * UNIT_PER_SKILL + spacer;
                              if (thickness <= 0) return null;
                              const innerR = currInner;
                              const outerR = innerR + thickness;
                              currInner = outerR;

                              const activeThis = active.catIndex === i && active.level === lv.key;
                              const skills = cat.skills[lv.key] || [];
                              // 动态字号：已改为每技能行内自适应，此处不再按层带厚度设定
                              return (
                                <g key={`seg-${lv.key}`}>
                                  {(() => {
                                    const rows: any[] = [];
                                    const rowCount = count;
                                    const baseStart = innerR + spacer; // 第一条技能行的内径
                                    const decayStep = 0.2; // 每行递减 20%
                                    // 若为舒适区且有 spacer，则将 spacer 区域整体填充为与第一行一致的颜色与不透明度
                                    if (lv.key === 'comfortable' && spacer > 0) {
                                      const spacerInner = innerR;
                                      const spacerOuter = innerR + spacer;
                                      const spacerPath = arcPath(spacerInner, spacerOuter, start, end);
                                      const firstOpacity = (1 /* 第一行基准 */) * (activeThis ? 1 : 0.9);
                                      rows.push(
                                        <path
                                          key={`comfy-spacer`}
                                          d={spacerPath}
                                          fill={lv.color}
                                          fillOpacity={firstOpacity}
                                          stroke="none"
                                          strokeWidth={0}
                                        />
                                      );
                                    }
                                    for (let r = 0; r < rowCount; r++) {
                                      const rowInnerR = baseStart + r * UNIT_PER_SKILL;
                                      const rowOuterR = rowInnerR + UNIT_PER_SKILL;
                                      const rowPath = arcPath(rowInnerR, rowOuterR, start, end);
                                      const baseOpacity = Math.max(0.3, 1 - r * decayStep);
                                      const opacity = baseOpacity * (activeThis ? 1 : 0.9);
                                      rows.push(
                                        <path
                                          key={`row-${r}`}
                                          d={rowPath}
                                          fill={lv.color}
                                          fillOpacity={opacity}
                                          stroke="none"
                                          strokeWidth={0}
                                          onMouseMove={(e) => {
                                            const rect = chartRef.current?.getBoundingClientRect();
                                            const relX = rect ? e.clientX - rect.left : e.clientX;
                                            const relY = rect ? e.clientY - rect.top : e.clientY;
                                            setHoverInfo({
                                              catIndex: i,
                                              level: lv.key,
                                              skills: skills,
                                              x: relX,
                                              y: relY,
                                            });
                                          }}
                                          onMouseLeave={() => setHoverInfo(null)}
                                          onClick={() => setActive(({ catIndex, level }) => ({
                                            catIndex: catIndex === i && level === lv.key ? null : i,
                                            level: catIndex === i && level === lv.key ? null : lv.key,
                                          }))}
                                          cursor="pointer"
                                        />
                                      );
                                    }
                                    return rows;
                                  })()}
                                  {/* skill 标签：按技能逐行的同心文本带，从内向外依次排布；每个技能独占一条径向带（沿弧线显示） */}
                                  <g pointerEvents="none">
                                    {(() => {
                                      const placed: any[] = [];
                                      if (!skills.length) return placed;
                                      // 角向两端留白
                                      const padPx = 6;
                                      const safePx = 8; // 文本两侧的安全边距
                                      const rowH = UNIT_PER_SKILL; // 每个技能对应一条径向带

                                      // 舒适区有 spacer 时，前两圈空带不放技能，行索引整体右移 2
                                      const rowOffset = spacer > 0 ? spacerRows : 0;
                                      for (let sIdx = 0; sIdx < skills.length; sIdx++) {
                                        const rowInner = innerR + (sIdx + rowOffset) * rowH;
                                        const rowOuter = rowInner + rowH;
                                        // 若越界（浮点误差保护）
                                        if (rowOuter > outerR + 1e-6) break;

                                        // 文本放置半径（该带中线）并限制在扇环内
                                        const maxFsByRow = Math.max(7, Math.floor(rowH - 2)); // 字号不超过带高-2
                                        const rText = (rowInner + rowOuter) / 2;

                                        // 角向有效范围
                                        const padTheta = padPx / rText;
                                        const aStart = start + padTheta;
                                        const aEnd = end - padTheta;
                                        if (aEnd <= aStart) continue;

                                        const usablePx = (aEnd - aStart) * rText; // 可用弧长

                                        // 自适应字号：受带高和可用弧长双重约束
                                        const raw = skills[sIdx];
                                        // 全局统一字号，仍受行高限制；太长则省略
                                        const fs = Math.min(chartFontSize, maxFsByRow);

                                        // 更精确的宽度估算与截断，考虑中英文/全角/emoji
                                        const budget = Math.max(0, usablePx - safePx);
                                        const text = fitTextToWidth(raw, fs, budget);

                                        // 若预算太小，跳过渲染
                                        if (!text) continue;

                                        // 生成沿圆的弧线路径：统一方向（SKILL_TEXT_FLOW）
                                        let from = aStart;
                                        let to = aEnd;
                                        let sweep = 1; // 1=CCW, 0=CW
                                        if (SKILL_TEXT_FLOW === 'cw') {
                                          from = aEnd;
                                          to = aStart;
                                          sweep = 0;
                                        }
                                        const [sx, sy] = polar(rText, from);
                                        const [ex, ey] = polar(rText, to);
                                        const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0;
                                        const pathD = `M ${sx} ${sy} A ${rText} ${rText} 0 ${largeArc} ${sweep} ${ex} ${ey}`;
                                        const id = `tp-${i}-${lv.key}-${sIdx}`;

                                        placed.push(
                                          <g key={`lbl-${lv.key}-${sIdx}`}>
                                            <path id={id} d={pathD} fill="none" stroke="none" />
                                            <text style={{ fontSize: fs, fontWeight: 500 }} className="fill-white">
                                              <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
                                                {text}
                                              </textPath>
                                            </text>
                                          </g>
                                        );
                                      }
                                      return placed;
                                    })()}
                                  </g>
                                </g>
                              );
                            });
                          })()}

                          {/* 类别标签：放在该分类累计外半径之外一点 */}
                          {(() => {
                            const totalRaw2 = (Object.keys(cat.skills) as LevelKey[])
                              .reduce((sum, k) => sum + (cat.skills[k]?.length || 0), 0);
                            const comfySpacer2 = (cat.skills.comfortable?.length || 0) > 0 ? 3 : 0;
                            const baseSpacer2 = (cat.skills.comfortable?.length || 0) === 0 && totalRaw2 > 0 ? 1 : 0;
                            const totalWithSpacer = totalRaw2 + comfySpacer2 + baseSpacer2;
                            const catOuterR = innerCore + totalWithSpacer * UNIT_PER_SKILL;
                            const outerMargin = Math.max(UNIT_PER_SKILL, chartFontSize * 2, 16);
                            const labelRadius = Math.min(catOuterR + outerMargin, size / 2 - 4);
                            return (
                              <CategoryLabel
                                cx={cx}
                                cy={cy}
                                radius={labelRadius}
                                angle={mid}
                                text={cat.name}
                                canvasSize={size}
                                fontSize={LABEL_FONT_SIZE}
                              />
                            );
                          })()}
                        </g>
                      );
                    })}

                    {/* 中心标题 */}
                    <g>
                      {/** 中心圆圈：若舒适区有技能，则与舒适区颜色一致；否则保持白色；半径取 innerCore 以避免形成细环 */}
                      {(() => {
                        const comfyHasAny = cats.some(cat => (cat.skills.comfortable?.length || 0) > 0);
                        const comfyColor = LEVELS.find(l => l.key === 'comfortable')!.color;
                        return (
                          <circle cx={cx} cy={cy} r={innerCore} fill={comfyHasAny ? comfyColor : "#ffffff"} stroke="none" />
                        );
                      })()}
                    </g>

                    {/* 环标题移除：仅用颜色/渐变表达层级，不再显示文字标签 */}
                  </svg>
                </div>
              </div>
              {/* 悬浮提示 */}
              {hoverInfo && (
                <div
                  className="pointer-events-none absolute z-10 w-64 max-w-[18rem] rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl"// pointer-events-none：禁止鼠标事件，absolute：绝对定位，z-10：z 轴层级为 10，w-64：宽度为 64，max-w-[18rem]：最大宽度为 18rem，rounded-xl：圆角为 xl，border：有边框，border-slate-200：边框颜色为浅灰色，bg-white：背景颜色为白色，p-3：内边距为 3，text-sm：文字大小为小，shadow-xl：大阴影
                  style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 20 }}// 根据鼠标位置动态设置提示框的位置，稍微偏移以避免遮挡鼠标
                >
                  {/* mb-1: 底部外边距为 1, text-xs: 文字大小为超小, text-slate-500: 文字颜色为浅灰色 */}
                  <div className="mb-1 text-xs text-slate-500">{cats[hoverInfo.catIndex]?.name} · {LEVELS.find(l => l.key === hoverInfo.level)?.cn}</div>
                  {/* 如果有技能列表则显示，否则显示“暂无条目” */}
                  {hoverInfo.skills?.length ? (
                    <ul className="list-inside list-disc space-y-0.5">
                      {hoverInfo.skills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-slate-400">（暂无条目）</div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="如何使用">
            <ol className="list-inside list-decimal space-y-1 text-sm leading-6">
              <li>在左侧“数据”表单中新增/重命名/删除分类；在各层级下逐条添加或删除技能，数据会自动保存到浏览器本地。</li>
              <li>如需批量导入/导出，请展开数据卡片底部的“高级 JSON”，粘贴或复制 JSON 后点击“应用 JSON”。</li>
              <li>将鼠标悬停到图上的某个分类扇环可查看该层级的技能列表；点击可高亮该扇环，再次点击可取消高亮。</li>
              <li>每个技能占用固定径向厚度并按行从内到外排布；舒适区会整体外移两圈以留出中心视觉空间（无需手动设置）。</li>
              <li>点击“导出 SVG/PNG”下载成图，导出的图像已包含图例，便于用于 PPT、简历或年度复盘。</li>
            </ol>
          </Card>
          <Card title="JSON 结构（示例）">
            <pre className="whitespace-pre-wrap rounded-xl bg-white p-3 text-xs shadow-inner">{`{
  "categories": [
    {
      "name": "前端",
      "skills": {
        "comfortable": ["React", "Tailwind"],
        "challenging": ["性能优化"],
        "near": ["WebGL"],
        "far": ["浏览器内核原理"]
      }
    }
  ]
}`}</pre>
          </Card>
          <Card title="小贴士">
            <ul className="list-inside list-disc space-y-1 text-sm leading-6">
              <li>把一个“能力”写得尽量原子化（如“绘制泳道图”而不是“画原型”），便于明确落位。</li>
              <li>命名尽量统一，避免重复；同一技能不必在多个分类重复出现。</li>
              <li>仅把技能放在最合适的层级；随能力变化可随时调整所在层级。</li>
              <li>分类很多时，优先合并同类项以保持图面简洁；左侧列表可滚动，底部的“高级 JSON”始终固定可用。</li>
              <li>导出用于印刷或放大展示时优先用 SVG（向量不失真、可编辑）；PNG 为白底位图，更便于直接粘贴文档。</li>
            </ul>
          </Card>
        </div>
      </div>
    </div >
  );
}

// 卡片组件
function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-rose-100 bg-white/80 p-4 shadow ${className ?? ""}`}>
      <h2 className="mb-3 text-base font-semibold text-slate-700">{title}</h2>
      {children}
    </div>
  );
}

// 分类标签组件
// cx, cy: 圆心坐标
// radius: 半径
// angle: 角度（弧度）
// text: 标签文本
function CategoryLabel({
  cx,
  cy,
  radius,
  angle,
  text,
  canvasSize,
  fontSize = 12,
}: {
  cx: number;
  cy: number;
  radius: number;
  angle: number;
  text: string;
  canvasSize: number;
  fontSize?: number;
}) {
  // 标签放置点（在圆外沿上），文本水平向外延伸，避免与图表扇环重叠
  const baseX = cx + radius * Math.cos(angle);
  const baseY = cy + radius * Math.sin(angle);
  const onRight = Math.cos(angle) >= 0; // 右半区向右扩展，左半区向左扩展
  const offset = 8; // 与圆环的间距
  const x = baseX + (onRight ? offset : -offset);
  const y = baseY;

  // 画布边界（为防贴边，留 4px 安全区）
  const leftBound = cx - canvasSize / 2 + 4;
  const rightBound = cx + canvasSize / 2 - 4;
  const available = onRight ? Math.max(0, rightBound - x) : Math.max(0, x - leftBound);

  // 文本宽度估算与省略号
  const estCharW = fontSize * 0.6; // 对中文和等宽混排取近似
  const maxChars = Math.max(1, Math.floor((available - 2) / Math.max(1, estCharW)));
  const display = text.length > maxChars ? text.slice(0, Math.max(1, maxChars - 1)) + "…" : text;

  // 使用白色描边作为“光晕”，提升可读性且弱化与图表的视觉重叠感
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor={onRight ? "start" : "end"}
        dominantBaseline="middle"
        style={{ fontSize, fontWeight: 700, paintOrder: "stroke" as any }}
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinejoin="round"
        className="select-none fill-slate-700"
      >
        {display}
      </text>
    </g>
  );
}
