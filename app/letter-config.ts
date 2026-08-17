export type BranchKey = "farewell" | "forward";

export interface LetterChapter {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  lead: string;
  paragraphs: string[];
  prompt: string;
  media: {
    src: string;
    alt: string;
    label: string;
    caption: string;
  }[];
}

export interface BranchOption {
  key: BranchKey;
  marker: string;
  title: string;
  description: string;
  constellation: string;
}

/**
 * 网页中需要替换的文字和照片都集中在这个文件。
 * 照片请先放入 public/memories/，再将 src 改为例如：/memories/chat-01.jpg。
 * src 保持空字符串时，网页会显示设计好的星图占位卡，不影响预览。
 */
export const letterConfig = {
  recipient: "[朋友的名字]",
  sender: "[你的名字]",
  date: "写于一个很安静的夜晚",
  cover: {
    overline: "A LETTER BENEATH THE STARS",
    title: "一封信",
    subtitle: "有些话适合留到夜深，再慢慢写给你。",
    openLabel: "拆开这封信",
  },
  chapters: [
    {
      id: "apology",
      number: "01",
      eyebrow: "失礼 · THE ECHO OF MEMORY",
      title: "信一",
      lead: "突然想写点什么，再一次觉得困扰了也实在很抱歉。思来想去还是希望这封信的收信人是你，也希望收到信后不用回复，让你有做课题作业的感觉并非我的本意，说到底这种“突然”也是一种自顾自地宣泄。",
      paragraphs: [
        "从功利的角度，ai时代能锻炼表达自己想法的能力，也是很值得尝试的。",
        "首先是想表达这次出行的感受吧，对自己来说，这是一次狼狈且开心的面基。会因为第一次和网友见面社恐紧张到睡不着，第二天又醒的很早想想就还是先出门，导致玩了两个就有点晕车感，然后变成脆皮菜鸡，但玩的每一个都是很开心的。 也为我的菜表示抱歉（已经在好好锻炼身体早睡早起了）",
        "再是对余音的感受，首先提见面前的期待值，彼此应该是相反的，我会是希望自己弥补以前各种事情的遗憾而和尝试面基，余音此前眼里的我或许会更光鲜一点而带着一丝好奇。这也是后面有提的“落差”感。回到我对余音的感受，就是小惊喜和羡慕，很多时候都是余音在絮叨自己遇到的各种琐事，也不免相似之处欣喜，不用抖音（我最近学aigc无奈下的），喜欢独来独往，修仙不吃饭（以前的自己一模一样），还有讨厌抽烟，对人际关系的处理巴拉巴拉。羡慕则是佩服转专业的勇气，以及失落于当初的自己所做的选择。以上种种，最直接的影响大抵也类似于此，就是会希望这个人能好好的，这是曾经想走却没踏出，也再无法重来的路。",
        "最后就是自己的感受了，更多或许应该是反思。听你的碎碎念，感到很开心（虽然月入1k",
      ],
      prompt: "轻触散落的星片，把这一页回忆收好",
      media: [
        { src: "", alt: "聊天截图一", label: "SCREENSHOT · 01", caption: "[截图说明或日期]" },
        { src: "", alt: "聊天截图二", label: "SCREENSHOT · 02", caption: "[截图说明或一句摘录]" },
        { src: "", alt: "聊天截图三", label: "SCREENSHOT · 03", caption: "[可选截图，没有也可保留为空]" },
      ],
    },
    {
      id: "stillness",
      number: "02",
      eyebrow: "静心 · A JOYFUL INTERLUDE",
      title: "那一天的灯火，至今仍让人觉得欢喜",
      lead: "请在这里写下世界之窗之行最先浮现的画面。",
      paragraphs: [
        "[正文占位] 可以写那天见到的景色、一起走过的路线，或一个现在想起仍然会笑的小片段。",
        "[正文占位] 比起盛大的风景，真正被记住的也许是身边的人，以及那份难得轻松、无需解释的快乐。",
        "[正文占位] 把欣喜延伸到未来：希望彼此保留好奇，认真生活，也在各自的方向上继续进步。",
      ],
      prompt: "沿着星光游览线，走向下一封笺",
      media: [
        { src: "", alt: "世界之窗合影或风景照", label: "WINDOW OF THE WORLD", caption: "[在这里写日期、地点或照片旁白]" },
      ],
    },
    {
      id: "wishes",
      number: "03",
      eyebrow: "祝愿 · WHAT THE JOURNEY LEFT US",
      title: "我们从这段时光里，各自带走了一些光",
      lead: "请在这里写下这段时间带给你的收获。",
      paragraphs: [
        "[正文占位] 写下你获得的理解、勇气或改变，也可以写朋友曾在不经意间给你的启发。",
        "[正文占位] 珍重不一定意味着挽留。它也可以是尊重彼此的选择，同时真心希望对方拥有更辽阔的生活。",
        "[正文占位] 在进入最后一页前，留下一句最想送给朋友的祝愿。",
      ],
      prompt: "点亮最后一颗星，回答一个问题",
      media: [],
    },
  ] satisfies LetterChapter[],
  question: {
    overline: "THE FORK IN THE STARS",
    title: "你希望再次相逢吗？",
    note: "没有标准答案。请选择此刻最接近内心的那一条星轨。",
    options: [
      {
        key: "farewell",
        marker: "A",
        title: "最初的样子就好",
        description: "我们都有各自的世界",
        constellation: "向不同远方延伸的两颗星",
      },
      {
        key: "forward",
        marker: "B",
        title: "成为遥远又陌生，\n但是很特别的现实朋友",
        description: "愿未来还能一起向前",
        constellation: "在远方重新相连的两颗星",
      },
    ] satisfies BranchOption[],
  },
  endings: {
    farewell: {
      id: "farewell",
      number: "04",
      eyebrow: "A LINE · 告别篇",
      title: "愿我们奔向各自的世界，也都一路顺利",
      lead: "谢谢你选择让这段相遇停在最初、也最温柔的样子。",
      paragraphs: [
        "[正文占位] 写下你对这段同行的感谢。无需否定曾经的靠近，也无需为渐远寻找一个过分明确的理由。",
        "[正文占位] 我们会走进各自的生活，认识不同的人，看见不同的风景。愿这次告别不是遗憾，而是对彼此选择的尊重。",
        "[正文占位] 愿你未来万事顺意。若某天偶然想起，就记得我们曾在同一片夜空下，真诚地陪伴过一程。",
      ],
      prompt: "让星轨缓缓驶向远方",
      media: [],
    },
    forward: {
      id: "forward",
      number: "05",
      eyebrow: "B LINE · 展望篇",
      title: "愿未来的路很长，而我们仍能一起向前",
      lead: "谢谢你选择让这份特别，在现实里继续生长。",
      paragraphs: [
        "[正文占位] 我们也许仍然遥远，仍有尚未真正熟悉的部分，但正因如此，未来才还有许多值得慢慢认识的可能。",
        "[正文占位] 不必时时联系，也不必许下沉重的承诺。只希望分享快乐时会想到彼此，面对难处时也知道这里有一个愿意倾听的人。",
        "[正文占位] 愿我们在各自成长的同时，也能偶尔并肩。下一次相逢时，再把这封信以后发生的故事慢慢讲完。",
      ],
      prompt: "让两颗星在未来重新相连",
      media: [],
    },
  } satisfies Record<BranchKey, LetterChapter>,
  finish: {
    overline: "THE LETTER RESTS HERE",
    title: "信写到这里，星光仍会继续",
    note: "愿你抬头有星，低头有路；愿那些真诚相待的日子，都有温柔的回声。",
  },
};
