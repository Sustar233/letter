export type InteractionKind = "star" | "brush" | "hold" | "bookmark" | "seal";

export interface LetterSection {
  id: string;
  label: string;
  title: string;
  paragraphs: string[];
  interaction: InteractionKind;
  interactionHint: string;
}

export interface LetterConfig {
  recipient: string;
  sender: string;
  date: string;
  accessPhraseHash: string;
  accessHint: string;
  title: string;
  preface: string;
  sections: LetterSection[];
}

/**
 * 所有需要个性化的文字都集中在这里。
 * 当前示例暗号是“星光为信”。修改暗号时，请同时更新 accessPhraseHash 与 accessHint。
 */
export const letterConfig: LetterConfig = {
  recipient: "[对方称呼]",
  sender: "[你的署名]",
  date: "写于一个安静的夜晚",
  accessPhraseHash:
    "e95ba36b063fa96191c02fa860fe4b85e3e6576a514531d49361513384ef17c7",
  accessHint: "当前示例暗号：星光为信",
  title: "有些话，想慢慢写给你",
  preface: "这不是一封需要匆忙读完的信。慢一点，让每一句话都有落下来的地方。",
  sections: [
    {
      id: "meeting",
      label: "第一封笺",
      title: "很庆幸，在人海里认识了你",
      paragraphs: [
        "给 [对方称呼]：",
        "我常常觉得，人与人的相遇带着一点偶然。世界这么大，每个人都有自己的方向，可我们偏偏在某一段路上碰见了，并且没有只做匆匆经过的路人。",
        "第一次真正记住你，是在 [第一次留下印象的时刻]。当时也许没有什么隆重的情节，但后来回想起来，那像是一颗很小的星星，在寻常的一天里安静地亮了一下。",
        "谢谢你愿意停下来，也谢谢那时的我们，刚好都没有错过。",
      ],
      interaction: "star",
      interactionHint: "把那颗小星星，送回它的位置",
    },
    {
      id: "memory",
      label: "第二封笺",
      title: "那些小事，我其实都记得",
      paragraphs: [
        "我记得 [一段共同经历]。记得当时的天气、说过的几句话，也记得后来我们提起它时，不约而同笑起来的样子。",
        "真正让一段友情变得珍贵的，好像从来不是多么惊天动地的瞬间，而是许多不起眼的小事：一条及时的消息，一次耐心的倾听，一句只有彼此才明白的玩笑。",
        "有些细节时间久了会模糊，可它们留下的感觉不会。我知道，在我的一部分记忆里，永远会有一小块地方，保留着我们一起走过的光线。",
      ],
      interaction: "brush",
      interactionHint: "轻轻拂过纸面，让记忆显出来",
    },
    {
      id: "gratitude",
      label: "第三封笺",
      title: "想认真地向你说一声谢谢",
      paragraphs: [
        "谢谢你在 [某个需要陪伴的时刻] 没有急着给出答案，而是先听我把话说完。那份不催促、不评判的耐心，对我来说比很多漂亮的话都更有力量。",
        "我也很欣赏你身上的 [对方的一项品质]。它也许不是你最常提起的部分，却在许多时候照顾到了身边的人，也悄悄影响了我。",
        "朋友之间似乎很少郑重道谢，总觉得来日方长、彼此都懂。但我还是想把这句话写下来：认识你以后，我的世界确实多了一些可靠、坦然和明亮。谢谢你。",
      ],
      interaction: "hold",
      interactionHint: "按住这束微光，直到它亮起来",
    },
    {
      id: "companionship",
      label: "第四封笺",
      title: "平常的陪伴，也有很重的分量",
      paragraphs: [
        "我们不必时时刻刻保持联系，也不需要用热闹来证明什么。各自忙碌的时候，就认真生活；偶尔再见面，仍然能从上一次的话题继续说起。这样的默契，我很珍惜。",
        "愿我们以后还会分享许多普通日子：新发现的一首歌、路边奇怪的云、突然想通的一件事，还有那些只有在熟悉的人面前才愿意讲的碎碎念。",
        "如果有一天你走进一段很难的路，希望你记得，不需要把一切都整理好才来找我。你可以只是来坐一会儿，剩下的话，慢慢再说。",
      ],
      interaction: "bookmark",
      interactionHint: "拉动书签，翻到最后一页",
    },
    {
      id: "future",
      label: "第五封笺",
      title: "愿我们都走向更辽阔的地方",
      paragraphs: [
        "最后，想把祝福写得简单一些。愿你仍然保有好奇，仍然相信自己的感受；愿你做出的选择，不是为了成为别人期待的样子，而是越来越接近真正自在的自己。",
        "愿今后的路上，有值得奔赴的事，也有随时可以歇脚的地方。我们会遇见新的风景，也会各自长成新的模样，但这并不妨碍一段真诚的友情在时间里继续生长。",
        "很高兴认识你，也很高兴直到今天，我们仍然是可以互相写信的人。",
        "照顾好自己。等下次见面，再把没说完的故事慢慢补上。",
      ],
      interaction: "seal",
      interactionHint: "轻点封印，替这封信好好收尾",
    },
  ],
};
