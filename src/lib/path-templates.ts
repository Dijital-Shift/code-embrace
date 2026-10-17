export type PathCategory =
  | "Devotion"
  | "Body"
  | "Purity"
  | "Substances"
  | "Speech"
  | "Mind"
  | "Stewardship"
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
    title: "Meditate on Scripture Daily",
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
    title: "Pray Three Times a Day",
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
    description: "Keep a scheduled fast unto the Lord — a set window, sunrise to sunset, or a multi-day fast — in secret, not to be seen of men. Note the type of fast and set an end date.",
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
      "Preach the word; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine. — 2 Timothy 4:2 (KJV)",
      "Go ye into all the world, and preach the gospel to every creature. — Mark 16:15 (KJV)",
      "But exhort one another daily, while it is called To day; lest any of you be hardened through the deceitfulness of sin. — Hebrews 3:13 (KJV)",
    ],
  },

  {
    id: "worship",
    category: "Devotion",
    title: "Daily Praise & Worship",
    description: "Set aside time each day to bow before the Lord, sing or speak His praise, and magnify Him — alone or with the assembly.",
    lane_type: "complete",
    support_scripture: [
      "O come, let us worship and bow down: let us kneel before the LORD our maker. — Psalm 95:6 (KJV)",
      "Not forsaking the assembling of ourselves together… — Hebrews 10:25 (KJV)",
    ],
  },
  {
    id: "keep-silence",
    category: "Devotion",
    title: "Keep Silence — Be Still, Slow to Speak",
    description: "Hold your tongue. Be still and know He is God.",
    lane_type: "complete",
    support_scripture: [
      "Be still, and know that I am God. — Psalm 46:10 (KJV)",
      "A time to keep silence, and a time to speak. — Ecclesiastes 3:7 (KJV)",
      "Let every man be swift to hear, slow to speak, slow to wrath. — James 1:19 (KJV)",
    ],
  },
  {
    id: "confess-your-faults",
    category: "Devotion",
    title: "Examine Your Heart — Confess Quickly",
    description: "Examine your heart before God daily. If you stumbled or wronged someone, confess it to God and the one you wronged, and make it right without delay.",
    lane_type: "complete",
    support_scripture: [
      "Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much. — James 5:16 (KJV)",
    ],
  },
  {
    id: "give-thanks-in-everything",
    category: "Devotion",
    title: "Give Thanks in Everything",
    description: "Thank God in every thing — this is his will toward you in Christ Jesus.",
    lane_type: "complete",
    support_scripture: [
      "In every thing give thanks: for this is the will of God in Christ Jesus concerning you. — 1 Thessalonians 5:18 (KJV)",
    ],
  },

  // ── Body ───────────────────────────────────────────────────
  {
    id: "exercise-daily",
    category: "Body",
    title: "Strengthen the Body Daily",
    description: "Train, exercise, or move with intention today — walk, lift, run, or stretch. Discipline the temple God gave you.",
    lane_type: "complete",
    support_scripture: [
      "Wherefore lift up the hands which hang down, and the feeble knees. — Hebrews 12:12 (KJV)",
      "Your body is the temple of the Holy Ghost… therefore glorify God in your body. — 1 Corinthians 6:19-20 (KJV)",
    ],
  },
  {
    id: "no-gluttony",
    category: "Body",
    title: "Eat with Self-Control (No Gluttony)",
    description: "No overeating, binge eating, or mindless snacking. Eat with discipline and gratitude, and stop before excess.",
    lane_type: "avoid",
    support_scripture: [
      "Put a knife to thy throat, if thou be a man given to appetite. — Proverbs 23:2 (KJV)",
      "Hast thou found honey? eat so much as is sufficient for thee, lest thou be filled therewith, and vomit it. — Proverbs 25:16 (KJV)",
    ],
  },
  {
    id: "guard-sleep",
    category: "Body",
    title: "Rise Early — Guard Sleep",
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
    title: "No Fornication — Flee Youthful Lusts",
    description: "No sexual immorality — no sex outside marriage and no impure physical intimacy. Keep your body holy.",
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
    title: "No Pornography / Lustful Looking",
    description: "No pornography, explicit media, or lingering lustful looks. Keep a covenant with your eyes.",
    lane_type: "avoid",
    support_scripture: [
      "Whosoever looketh on a woman to lust after her hath committed adultery with her already in his heart. — Matthew 5:28 (KJV)",
      "I made a covenant with mine eyes; why then should I think upon a maid? — Job 31:1 (KJV)",
    ],
  },
  {
    id: "modesty-in-dress-and-demeanor",
    category: "Purity",
    title: "No Immodesty in Dress or Demeanor",
    description: "No revealing clothing, flaunting, or showy attention-seeking. Adorn the hidden man of the heart, not outward costly array.",
    lane_type: "avoid",
    support_scripture: [
      "In like manner also, that women adorn themselves in modest apparel, with shamefacedness and sobriety; not with broided hair, or gold, or pearls, or costly array… — 1 Timothy 2:9-10 (KJV)",
      "Whose adorning let it not be that outward adorning of plaiting the hair, and of wearing of gold, or of putting on of apparel; but let it be the hidden man of the heart… even the ornament of a meek and quiet spirit. — 1 Peter 3:3-4 (KJV)",
    ],
  },

  // ── Substances ─────────────────────────────────────────────
  {
    id: "no-drunkenness",
    category: "Substances",
    title: "No Drunkenness",
    description: "No getting drunk, buzzed, or bingeing. Keep sober control of your mind, speech, and impulses.",
    lane_type: "avoid",
    support_scripture: [
      "Be not drunk with wine, wherein is excess; but be filled with the Spirit. — Ephesians 5:18 (KJV)",
      "Wine is a mocker, strong drink is raging: and whosoever is deceived thereby is not wise. — Proverbs 20:1 (KJV)",
    ],
  },
  {
    id: "no-drugs-sorcery",
    category: "Substances",
    title: "No Drugs / Sorcery (Pharmakeia)",
    description: "No illegal drugs, narcotics, misused or unprescribed pills, psychedelics, or any mind-altering substance. No chemical escape from a sober mind.",
    lane_type: "avoid",
    support_scripture: [
      "The works of the flesh are manifest, which are these… witchcraft… they which do such things shall not inherit the kingdom of God. — Galatians 5:19-21 (KJV)",
      "Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about, seeking whom he may devour. — 1 Peter 5:8 (KJV)",
    ],
  },
  {
    id: "no-cannabis",
    category: "Substances",
    title: "No Cannabis",
    description: "Stay sober-minded and vigilant. Keep a clear head — no smoking, vaping, or edibles.",
    lane_type: "avoid",
    support_scripture: [
      "Be sober, be vigilant; because your adversary the devil, as a roaring lion, walketh about, seeking whom he may devour. — 1 Peter 5:8 (KJV)",
      "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind. — 2 Timothy 1:7 (KJV)",
    ],
  },
  {
    id: "no-smoking",
    category: "Substances",
    title: "No Smoking or Vaping",
    description: "No cigarettes, cigars, vapes, chew, or nicotine of any kind. Keep the temple clean.",
    lane_type: "avoid",
    support_scripture: [
      "If any man defile the temple of God, him shall God destroy; for the temple of God is holy, which temple ye are. — 1 Corinthians 3:16-17 (KJV)",
      "Your body is the temple of the Holy Ghost… therefore glorify God in your body. — 1 Corinthians 6:19-20 (KJV)",
    ],
  },

  // ── Speech ─────────────────────────────────────────────────
  {
    id: "no-lying",
    category: "Speech",
    title: "No Lying",
    description: "No lies, white lies, exaggerations, or deceiving by leaving things out. Speak truth in every dealing.",
    lane_type: "avoid",
    support_scripture: [
      "Wherefore putting away lying, speak every man truth with his neighbour. — Ephesians 4:25 (KJV)",
      "Lying lips are abomination to the LORD: but they that deal truly are his delight. — Proverbs 12:22 (KJV)",
    ],
  },
  {
    id: "no-corrupt-speech",
    category: "Speech",
    title: "No Cursing / Corrupt Speech",
    description: "No profanity, crude or vulgar talk, slurs, or taking the Lord's name in vain. Let your words minister grace.",
    lane_type: "avoid",
    support_scripture: [
      "Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying. — Ephesians 4:29 (KJV)",
      "Out of the same mouth proceedeth blessing and cursing. My brethren, these things ought not so to be. — James 3:10 (KJV)",
    ],
  },
  {
    id: "no-gossip",
    category: "Speech",
    title: "No Gossip / Talebearing",
    description: "No gossip, rumors, or discussing someone's private faults behind their back — in person, by text, or online.",
    lane_type: "avoid",
    support_scripture: [
      "A talebearer revealeth secrets: but he that is of a faithful spirit concealeth the matter. — Proverbs 11:13 (KJV)",
      "Thou shalt not go up and down as a talebearer among thy people. — Leviticus 19:16 (KJV)",
    ],
  },
  {
    id: "speak-life",
    category: "Speech",
    title: "Speak Life — Encourage Daily",
    description: "Death and life are in the power of the tongue. Use it to build up.",
    lane_type: "complete",
    support_scripture: [
      "Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof. — Proverbs 18:21 (KJV)",
      "…that which is good to the use of edifying, that it may minister grace unto the hearers. — Ephesians 4:29 (KJV)",
    ],
  },

  {
    id: "no-foolish-jesting",
    category: "Speech",
    title: "No Foolish Talking or Jesting",
    description: "Put away coarse jesting and biting words that wound.",
    lane_type: "avoid",
    support_scripture: [
      "Neither filthiness, nor foolish talking, nor jesting, which are not convenient: but rather giving of thanks. — Ephesians 5:4 (KJV)",
      "As a mad man who casteth firebrands, arrows, and death, so is the man that deceiveth his neighbour, and saith, Am not I in sport? — Proverbs 26:18-19 (KJV)",
    ],
  },

  // ── Mind ───────────────────────────────────────────────────
  {
    id: "no-negative-self-talk",
    category: "Mind",
    title: "No Negative Self-Talk",
    description: "Refuse to speak death over yourself. Think on what is true.",
    lane_type: "avoid",
    support_scripture: [
      "Whatsoever things are true… honest… just… pure… lovely… of good report; think on these things. — Philippians 4:8 (KJV)",
      "Death and life are in the power of the tongue. — Proverbs 18:21 (KJV)",
    ],
  },
  {
    id: "rule-your-spirit",
    category: "Mind",
    title: "Rule Your Spirit (No Unchecked Anger)",
    description: "No yelling, outbursts, slammed doors, road rage, or venting in wrath. Be slow to anger and keep command of your spirit.",
    lane_type: "avoid",
    support_scripture: [
      "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city. — Proverbs 16:32 (KJV)",
      "Be not hasty in thy spirit to be angry: for anger resteth in the bosom of fools. — Ecclesiastes 7:9 (KJV)",
    ],
  },
  {
    id: "cast-your-care",
    category: "Mind",
    title: "Cast Your Care — No Dwelling in Worry",
    description: "Bring the care to God instead of turning it over all day.",
    lane_type: "avoid",
    support_scripture: [
      "Cast thy burden upon the LORD, and he shall sustain thee. — Psalm 55:22 (KJV)",
      "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. — Philippians 4:6 (KJV)",
    ],
  },
  {
    id: "no-murmuring",
    category: "Mind",
    title: "No Murmuring or Complaining",
    description: "Do all things without murmurings and disputings.",
    lane_type: "avoid",
    support_scripture: [
      "Do all things without murmurings and disputings. — Philippians 2:14 (KJV)",
      "Neither murmur ye, as some of them also murmured, and were destroyed of the destroyer. — 1 Corinthians 10:10 (KJV)",
    ],
  },

  // ── Stewardship ────────────────────────────────────────────
  {
    id: "no-unplanned-spending",
    category: "Stewardship",
    title: "No Unplanned Spending",
    description: "No impulse buys, emotional shopping, or spending outside your budget. Spend on purpose, not on impulse.",
    lane_type: "avoid",
    support_scripture: [
      "There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up. — Proverbs 21:20 (KJV)",
      "Be thou diligent to know the state of thy flocks, and look well to thy herds. — Proverbs 27:23 (KJV)",
    ],
  },
  {
    id: "contentment",
    category: "Stewardship",
    title: "Contentment (No Covetousness)",
    description: "Be content with such things as ye have. Refuse envy, greed, and murmuring over what you do not have.",
    lane_type: "avoid",
    support_scripture: [
      "Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee. — Hebrews 13:5 (KJV)",
      "But godliness with contentment is great gain. For we brought nothing into this world, and it is certain we can carry nothing out. — 1 Timothy 6:6-7 (KJV)",
      "Better is little with the fear of the LORD than great treasure and trouble therewith. — Proverbs 15:16 (KJV)",
      "Let us not be desirous of vain glory, provoking one another, envying one another. — Galatians 5:26 (KJV)",
      "But if ye have bitter envying and strife in your hearts, glory not, and lie not against the truth. This wisdom descendeth not from above, but is earthly, sensual, devilish. — James 3:14-16 (KJV)",
      "Envy and wrath shorten the life, and carefulness bringeth age before the time. — Sirach 30:24 (KJV)",
    ],
  },

  // ── Heart & Action ─────────────────────────────────────────
  {
    id: "forgive-quickly",
    category: "Heart & Action",
    title: "No Grudges — No Sundown Anger",
    description: "No grudges held, no offense left to simmer. Forgive and settle it before the sun goes down.",
    lane_type: "avoid",
    support_scripture: [
      "Be ye angry, and sin not: let not the sun go down upon your wrath: neither give place to the devil. — Ephesians 4:26-27 (KJV)",
      "Be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you. — Ephesians 4:32 (KJV)",
    ],
  },
  {
    id: "serve-the-afflicted",
    category: "Heart & Action",
    title: "Daily Mercy for the Afflicted",
    description: "Reach out to someone sick, lonely, grieving, or in need today — a call, a text, a meal, a gift, a prayer, or a visit.",
    lane_type: "complete",
    support_scripture: [
      "Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction… — James 1:27 (KJV)",
      "Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me. — Matthew 25:40 (KJV)",
    ],
  },
  {
    id: "honor-parents",
    category: "Heart & Action",
    title: "Honor Your Father and Mother",
    description: "Honor them today — reach out, speak love, or show respect. If they have passed or are absent, speak well of them and honor their memory.",
    lane_type: "complete",
    support_scripture: [
      "Honour thy father and thy mother: that thy days may be long upon the land which the LORD thy God giveth thee. — Exodus 20:12 (KJV)",
      "Honour thy father and mother; (which is the first commandment with promise). — Ephesians 6:2 (KJV)",
    ],
  },
  {
    id: "work-as-unto-the-lord",
    category: "Heart & Action",
    title: "Work as unto the Lord (No Slothfulness)",
    description: "Whatsoever ye do, do it heartily, as to the Lord.",
    lane_type: "complete",
    support_scripture: [
      "And whatsoever ye do, do it heartily, as to the Lord, and not unto men. — Colossians 3:23 (KJV)",
      "Go to the ant, thou sluggard; consider her ways, and be wise. — Proverbs 6:6 (KJV)",
    ],
  },
  {
    id: "walk-in-humility",
    category: "Heart & Action",
    title: "Walk in Humility",
    description: "Esteem others better than yourselves. God resisteth the proud, but giveth grace to the humble.",
    lane_type: "complete",
    support_scripture: [
      "Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves. — Philippians 2:3 (KJV)",
      "But he giveth more grace. Wherefore he saith, God resisteth the proud, but giveth grace unto the humble. — James 4:6 (KJV)",
      "Yea, all of you be subject one to another, and be clothed with humility: for God resisteth the proud, and giveth grace to the humble. Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time. — 1 Peter 5:5-6 (KJV)",
    ],
  },
  {
    id: "bless-someone-today",
    category: "Heart & Action",
    title: "Bless Someone Today",
    description: "Render blessing instead of evil. Bless, and curse not.",
    lane_type: "complete",
    support_scripture: [
      "But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute you. — Matthew 5:44 (KJV)",
      "Bless them which persecute you: bless, and curse not. — Romans 12:14 (KJV)",
      "Not rendering evil for evil, or railing for railing: but contrariwise blessing; knowing that ye are thereunto called, that ye should inherit a blessing. — 1 Peter 3:9 (KJV)",
    ],
  },
];

export const PATH_CATEGORIES: PathCategory[] = [
  "Devotion",
  "Body",
  "Purity",
  "Substances",
  "Speech",
  "Mind",
  "Stewardship",
  "Heart & Action",
];

export function getPathTemplate(id: string): PathTemplate | undefined {
  return PATH_TEMPLATES.find((t) => t.id === id);
}
