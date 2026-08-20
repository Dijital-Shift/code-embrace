export type PathCategory =
  | "Devotion"
  | "Body"
  | "Purity"
  | "Substances"
  | "Speech"
  | "Heart & Action";

export type PathTemplate = {
  id: string;
  category: PathCategory;
  title: string;
  description: string;
  lane_type: "avoid" | "complete";
  support_scripture: string[];
};

export const PATH_TEMPLATES: PathTemplate[] = [
  // ── Devotion ───────────────────────────────────────────────
  {
    id: "meditate-scripture",
    category: "Devotion",
    title: "Meditate on Scripture daily",
    description: "Read and meditate on the Word day and night.",
    lane_type: "complete",
    support_scripture: [
      "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night. — Joshua 1:8 (KJV)",
      "His delight is in the law of the LORD; and in his law doth he meditate day and night. — Psalm 1:2 (KJV)",
    ],
  },
  {
    id: "pray-three-times-daily",
    category: "Devotion",
    title: "Pray three times a day",
    description: "Evening, morning, and noon — kneel and pray.",
    lane_type: "complete",
    support_scripture: [
      "He kneeled upon his knees three times a day, and prayed, and gave thanks before his God, as he did aforetime. — Daniel 6:10 (KJV)",
      "Evening, and morning, and at noon, will I pray, and cry aloud: and he shall hear my voice. — Psalm 55:17 (KJV)",
    ],
  },
  {
    id: "fast",
    category: "Devotion",
    title: "Fast",
    description: "Set a fast unto the Lord — in secret, not to be seen of men. Note the type of fast and set an end date.",
    lane_type: "complete",
    support_scripture: [
      "When thou fastest, anoint thine head, and wash thy face; that thou appear not unto men to fast. — Matthew 6:17-18 (KJV)",
      "Is not this the fast that I have chosen? to loose the bands of wickedness… — Isaiah 58:6 (KJV)",
    ],
  },

  {
    id: "send-scripture",
    category: "Devotion",
    title: "Send Scripture",
    description: "Send a verse to someone every day — a word in season, not a sermon. Easy way to do this: SendScripture.xyz",
    lane_type: "complete",
    support_scripture: [
      "A word fitly spoken is like apples of gold in pictures of silver. — Proverbs 25:11 (KJV)",
      "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another. — Colossians 3:16 (KJV)",
    ],
  },

  {
    id: "worship",
    category: "Devotion",
    title: "Worship",
    description: "Gather in worship and bow before the Lord.",
    lane_type: "complete",
    support_scripture: [
      "O come, let us worship and bow down: let us kneel before the LORD our maker. — Psalm 95:6 (KJV)",
      "Not forsaking the assembling of ourselves together… — Hebrews 10:25 (KJV)",
    ],
  },
  {
    id: "keep-silence",
    category: "Devotion",
    title: "Keep silence — be still, slow to speak",
    description: "Hold your tongue. Be still and know He is God.",
    lane_type: "complete",
    support_scripture: [
      "Be still, and know that I am God. — Psalm 46:10 (KJV)",
      "A time to keep silence, and a time to speak. — Ecclesiastes 3:7 (KJV)",
      "Let every man be swift to hear, slow to speak, slow to wrath. — James 1:19 (KJV)",
    ],
  },

  // ── Body ───────────────────────────────────────────────────
  {
    id: "exercise-daily",
    category: "Body",
    title: "Strengthen the body daily",
    description: "Lift up the hands which hang down. Glorify God in your body.",
    lane_type: "complete",
    support_scripture: [
      "Wherefore lift up the hands which hang down, and the feeble knees. — Hebrews 12:12 (KJV)",
      "Your body is the temple of the Holy Ghost… therefore glorify God in your body. — 1 Corinthians 6:19-20 (KJV)",
    ],
  },
  {
    id: "no-gluttony",
    category: "Body",
    title: "Eat with self-control (no gluttony)",
    description: "Put a knife to thy throat if thou be a man given to appetite.",
    lane_type: "avoid",
    support_scripture: [
      "Put a knife to thy throat, if thou be a man given to appetite. — Proverbs 23:2 (KJV)",
      "Hast thou found honey? eat so much as is sufficient for thee, lest thou be filled therewith, and vomit it. — Proverbs 25:16 (KJV)",
    ],
  },
  {
    id: "guard-sleep",
    category: "Body",
    title: "Rise early — guard sleep",
    description: "Rise a great while before day to pray. Love not sloth.",
    lane_type: "complete",
    support_scripture: [
      "In the morning, rising up a great while before day, he went out… and there prayed. — Mark 1:35 (KJV)",
      "How long wilt thou sleep, O sluggard? — Proverbs 6:9-11 (KJV)",
    ],
  },

  // ── Purity ─────────────────────────────────────────────────
  {
    id: "no-fornication",
    category: "Purity",
    title: "No fornication — flee youthful lusts",
    description: "Flee fornication. Possess your vessel in sanctification.",
    lane_type: "avoid",
    support_scripture: [
      "Flee fornication. Every sin that a man doeth is without the body; but he that committeth fornication sinneth against his own body. — 1 Corinthians 6:18 (KJV)",
      "Flee also youthful lusts: but follow righteousness, faith, charity, peace. — 2 Timothy 2:22 (KJV)",
      "This is the will of God, even your sanctification, that ye should abstain from fornication. — 1 Thessalonians 4:3-5 (KJV)",
    ],
  },
  {
    id: "no-lustful-looking",
    category: "Purity",
    title: "No pornography / lustful looking",
    description: "Make a covenant with thine eyes.",
    lane_type: "avoid",
    support_scripture: [
      "Whosoever looketh on a woman to lust after her hath committed adultery with her already in his heart. — Matthew 5:28 (KJV)",
      "I made a covenant with mine eyes; why then should I think upon a maid? — Job 31:1 (KJV)",
    ],
  },

  // ── Substances ─────────────────────────────────────────────
  {
    id: "no-drunkenness",
    category: "Substances",
    title: "No drunkenness",
    description: "Be not drunk with wine — be filled with the Spirit.",
    lane_type: "avoid",
    support_scripture: [
      "Be not drunk with wine, wherein is excess; but be filled with the Spirit. — Ephesians 5:18 (KJV)",
      "Wine is a mocker, strong drink is raging: and whosoever is deceived thereby is not wise. — Proverbs 20:1 (KJV)",
    ],
  },
  {
    id: "no-drugs-sorcery",
    category: "Substances",
    title: "No drugs / sorcery (pharmakeia)",
    description: "Walk in the Spirit, not the works of the flesh.",
    lane_type: "avoid",
    support_scripture: [
      "The works of the flesh are manifest, which are these… witchcraft… they which do such things shall not inherit the kingdom of God. — Galatians 5:19-21 (KJV)",
    ],
  },
  {
    id: "no-smoking",
    category: "Substances",
    title: "Don't defile the temple (no smoking)",
    description: "Your body is the temple of God — keep it holy.",
    lane_type: "avoid",
    support_scripture: [
      "If any man defile the temple of God, him shall God destroy; for the temple of God is holy, which temple ye are. — 1 Corinthians 3:16-17 (KJV)",
    ],
  },

  // ── Speech ─────────────────────────────────────────────────
  {
    id: "no-lying",
    category: "Speech",
    title: "No lying",
    description: "Put away lying. Speak every man truth with his neighbour.",
    lane_type: "avoid",
    support_scripture: [
      "Wherefore putting away lying, speak every man truth with his neighbour. — Ephesians 4:25 (KJV)",
      "Lying lips are abomination to the LORD: but they that deal truly are his delight. — Proverbs 12:22 (KJV)",
    ],
  },
  {
    id: "no-corrupt-speech",
    category: "Speech",
    title: "No cursing / corrupt speech",
    description: "Let no corrupt communication proceed out of your mouth.",
    lane_type: "avoid",
    support_scripture: [
      "Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying. — Ephesians 4:29 (KJV)",
      "Out of the same mouth proceedeth blessing and cursing. My brethren, these things ought not so to be. — James 3:10 (KJV)",
    ],
  },
  {
    id: "no-gossip",
    category: "Speech",
    title: "No gossip / talebearing",
    description: "A talebearer revealeth secrets. Don't go up and down as one.",
    lane_type: "avoid",
    support_scripture: [
      "A talebearer revealeth secrets: but he that is of a faithful spirit concealeth the matter. — Proverbs 11:13 (KJV)",
      "Thou shalt not go up and down as a talebearer among thy people. — Leviticus 19:16 (KJV)",
    ],
  },
  {
    id: "speak-life",
    category: "Speech",
    title: "Speak life — encourage daily",
    description: "Death and life are in the power of the tongue. Use it to build up.",
    lane_type: "complete",
    support_scripture: [
      "Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof. — Proverbs 18:21 (KJV)",
      "…that which is good to the use of edifying, that it may minister grace unto the hearers. — Ephesians 4:29 (KJV)",
    ],
  },

  // ── Heart & Action ─────────────────────────────────────────
  {
    id: "give-to-the-poor",
    category: "Heart & Action",
    title: "Give — tithe and care for the poor",
    description: "He that hath pity upon the poor lendeth unto the LORD.",
    lane_type: "complete",
    support_scripture: [
      "He that hath pity upon the poor lendeth unto the LORD; and that which he hath given will he pay him again. — Proverbs 19:17 (KJV)",
      "Bring ye all the tithes into the storehouse… and prove me now herewith, saith the LORD of hosts. — Malachi 3:10 (KJV)",
    ],
  },
  {
    id: "forgive-quickly",
    category: "Heart & Action",
    title: "Forgive quickly — no sundown anger",
    description: "Let not the sun go down upon your wrath.",
    lane_type: "complete",
    support_scripture: [
      "Be ye angry, and sin not: let not the sun go down upon your wrath: neither give place to the devil. — Ephesians 4:26-27 (KJV)",
      "Be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you. — Ephesians 4:32 (KJV)",
    ],
  },
  {
    id: "serve-the-afflicted",
    category: "Heart & Action",
    title: "Serve / visit the afflicted",
    description: "Pure religion: visit the fatherless and widows in their affliction.",
    lane_type: "complete",
    support_scripture: [
      "Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction… — James 1:27 (KJV)",
      "Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me. — Matthew 25:40 (KJV)",
    ],
  },
  {
    id: "honor-parents",
    category: "Heart & Action",
    title: "Honor parents — tell them you love them",
    description: "Honor thy father and mother. Speak love to them often.",
    lane_type: "complete",
    support_scripture: [
      "Honour thy father and thy mother: that thy days may be long upon the land which the LORD thy God giveth thee. — Exodus 20:12 (KJV)",
      "Honour thy father and mother; (which is the first commandment with promise). — Ephesians 6:2 (KJV)",
    ],
  },
  {
    id: "work-as-unto-the-lord",
    category: "Heart & Action",
    title: "Work as unto the Lord (no slothfulness)",
    description: "Whatsoever ye do, do it heartily, as to the Lord.",
    lane_type: "complete",
    support_scripture: [
      "And whatsoever ye do, do it heartily, as to the Lord, and not unto men. — Colossians 3:23 (KJV)",
      "Go to the ant, thou sluggard; consider her ways, and be wise. — Proverbs 6:6 (KJV)",
    ],
  },
];

export const PATH_CATEGORIES: PathCategory[] = [
  "Devotion",
  "Body",
  "Purity",
  "Substances",
  "Speech",
  "Heart & Action",
];

export function getPathTemplate(id: string): PathTemplate | undefined {
  return PATH_TEMPLATES.find((t) => t.id === id);
}
