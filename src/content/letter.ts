export type EndingKey = "a" | "b";

export type PhotoMemory = {
  src: string;
  alt: string;
  date: string;
  location?: string;
  caption: string;
};

export const letterContent = {
  meta: {
    title: "写给另一颗星",
    subtitle: "我们曾短暂地经过彼此的世界。",
  },
  intro: {
    chapter: "一封信",
    time: "今夜",
    title: "写给另一颗星",
    subtitle: "我们曾短暂地经过彼此的世界。",
    note: "今晚忽然很想写一封信。",
    action: "开始读这封信",
  },
  apology: {
    chapter: "失礼",
    time: "分开后的第一夜",
    opening: "分开的第一天，我其实写过一封很长的信。",
    deletedNote: "但后来，我把它全部删掉了。",
    paragraphs: [
      "【这里填写第一章正文】",
      "【这里可以写下当时混乱的心情；不必一次把所有话说完。】",
    ],
    action: "后来呢",
  },
  calm: {
    chapter: "静心",
    time: "第二个星期",
    title: "世界之窗",
    paragraphs: [
      "第二周，我又去了世界之窗。",
      "这次只有我一个人。",
      "【这里填写关于照片与回忆的正文】",
    ],
    photos: [
      {
        src: "",
        alt: "世界之窗的第一张照片",
        date: "【日期待填写】",
        location: "世界之窗",
        caption: "【这里填写照片旁白】",
      },
      {
        src: "",
        alt: "世界之窗的第二张照片",
        date: "【日期待填写】",
        location: "世界之窗",
        caption: "【这里填写照片旁白】",
      },
      {
        src: "",
        alt: "世界之窗的第三张照片",
        date: "【日期待填写】",
        location: "世界之窗",
        caption: "【这里填写照片旁白】",
      },
      {
        src: "",
        alt: "世界之窗的第四张照片",
        date: "【日期待填写】",
        location: "世界之窗",
        caption: "【这里填写照片旁白】",
      },
    ] satisfies PhotoMemory[],
    action: "继续往前",
  },
  blessing: {
    chapter: "祝愿",
    time: "第三个星期",
    title: "从过去，慢慢看向未来",
    items: [
      {
        label: "谢谢",
        caption: "【这里填写值得感谢的经历】",
      },
      {
        label: "成长",
        caption: "【这里填写这段经历带来的改变】",
      },
      {
        label: "祝愿",
        caption: "【这里填写想送给对方的祝愿】",
      },
    ],
    action: "还有最后一个问题",
  },
  choice: {
    time: "未来",
    title: "如果故事还有下一页，",
    subtitle: "你希望它是什么样子？",
    options: {
      a: {
        label: "停在这里",
        lines: ["最初的样子就很好。", "我们都有属于自己的世界。"],
      },
      b: {
        label: "以后，再见一次吧",
        lines: ["成为遥远、陌生，", "却依然很特别的现实朋友。"],
      },
    },
  },
  endings: {
    a: {
      chapter: "星河两岸",
      time: "未来",
      title: "谢谢你来过。",
      paragraphs: [
        "【这里填写 A 线正文】",
        "愿我们在各自的世界里，",
        "都成为比那时候更好的人。",
      ],
      closing: "完整结束，也是一种温柔。",
    },
    b: {
      chapter: "再次相逢",
      time: "未来",
      title: "那么，下次见。",
      paragraphs: [
        "也许我们不会再像从前一样，熟悉彼此的每一天。",
        "但偶尔知道，你正在世界的某个地方认真生活，似乎也很好。",
        "【这里填写 B 线正文】",
      ],
      closing: "把省略号，留给遥远的以后。",
    },
  },
  timeline: ["今夜", "分开后的第一夜", "第二个星期", "第三个星期", "未来"],
} as const;
