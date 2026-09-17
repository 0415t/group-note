// クライアント側のサンプルデータ。実DBに差し替えやすいよう、型に沿って定義する。
import type {
  User,
  Group,
  Template,
  Memo,
  Tag,
  AppNotification,
} from './types'

export const CURRENT_USER_ID = 'u_me'

export const users: User[] = [
  { id: 'u_me', name: 'あなた', email: 'you@example.com', avatarUrl: '/placeholder-user.jpg' },
  { id: 'u_tanaka', name: '田中', email: 'tanaka@example.com' },
  { id: 'u_sato', name: '佐藤', email: 'sato@example.com' },
  { id: 'u_suzuki', name: '鈴木', email: 'suzuki@example.com' },
  { id: 'u_kimura', name: '木村', email: 'kimura@example.com' },
]

// ---- 飲食店テンプレートのフィールド ----
const FOOD_FIELDS = {
  shopName: 'f_shop_name',
  area: 'f_area',
  price: 'f_price',
  rating: 'f_rating',
  scenes: 'f_scenes',
  review: 'f_review',
  visitedAt: 'f_visited',
  url: 'f_url',
}

const PLAY_FIELDS = {
  place: 'f_place',
  area: 'f_area_play',
  budget: 'f_budget',
  duration: 'f_duration',
  people: 'f_people',
  note: 'f_note',
  url: 'f_url_play',
}

export const groups: Group[] = [
  {
    id: 'g_food',
    name: '家族',
    description: '家族みんなでお店・遊び場・候補を同じ形式で共有するための場です。',
    icon: '🍜',
    color: 'oklch(0.63 0.19 27)',
    ownerId: 'u_me',
    inviteCode: 'FOOD-8823',
    members: [
      { userId: 'u_me', role: 'owner', joinedAt: '2026-05-01T10:00:00Z' },
      { userId: 'u_tanaka', role: 'member', joinedAt: '2026-05-01T12:00:00Z' },
      { userId: 'u_sato', role: 'member', joinedAt: '2026-05-02T09:00:00Z' },
      { userId: 'u_suzuki', role: 'member', joinedAt: '2026-05-03T15:00:00Z' },
      { userId: 'u_kimura', role: 'member', joinedAt: '2026-05-10T11:00:00Z' },
    ],
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'g_jobhunt',
    name: '情シス2組',
    description: '説明会・選考体験・企業研究をテンプレートごとに整理できる情シス2組の仲間向けの場です。',
    icon: '💼',
    color: 'oklch(0.55 0.14 260)',
    ownerId: 'u_tanaka',
    inviteCode: 'JOB-1177',
    members: [
      { userId: 'u_me', role: 'member', joinedAt: '2026-06-01T10:00:00Z' },
      { userId: 'u_tanaka', role: 'owner', joinedAt: '2026-05-20T10:00:00Z' },
      { userId: 'u_sato', role: 'member', joinedAt: '2026-06-02T09:00:00Z' },
    ],
    createdAt: '2026-05-20T10:00:00Z',
  },
]

export const templates: Template[] = [
  {
    id: 't_food',
    groupId: 'g_food',
    name: 'おすすめ飲食店',
    description: 'お店の感想・写真・価格帯を記録するテンプレート',
    icon: '🍽️',
    createdBy: 'u_me',
    createdAt: '2026-05-01T10:05:00Z',
    fields: [
      { id: FOOD_FIELDS.shopName, name: '店名', type: 'short_text', required: true, visibleInList: true, searchable: true, filterable: false, sortOrder: 0 },
      { id: FOOD_FIELDS.area, name: 'エリア', type: 'single_select', options: ['渋谷', '新宿', '池袋', '吉祥寺', '横浜'], required: false, visibleInList: true, searchable: true, filterable: true, sortOrder: 1 },
      { id: FOOD_FIELDS.price, name: '価格帯', type: 'single_select', options: ['〜1,000円', '1,000〜2,000円', '2,000〜3,000円', '3,000円〜'], required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 2 },
      { id: FOOD_FIELDS.rating, name: '評価', type: 'rating', required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 3 },
      { id: FOOD_FIELDS.scenes, name: '利用シーン', type: 'multi_select', options: ['ランチ', 'ディナー', 'デート', '大人数', '作業向き', '一人'], required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 4 },
      { id: FOOD_FIELDS.review, name: '感想', type: 'long_text', required: false, visibleInList: false, searchable: true, filterable: false, sortOrder: 5 },
      { id: FOOD_FIELDS.visitedAt, name: '訪問日', type: 'date', required: false, visibleInList: false, searchable: false, filterable: true, sortOrder: 6 },
      { id: FOOD_FIELDS.url, name: '参考サイト', type: 'url', required: false, visibleInList: false, searchable: false, filterable: false, sortOrder: 7 },
    ],
  },
  {
    id: 't_play',
    groupId: 'g_food',
    name: '遊び場',
    description: '友達と行きたい場所や遊びの候補をまとめるテンプレート',
    icon: '🎯',
    createdBy: 'u_me',
    createdAt: '2026-05-01T10:06:00Z',
    fields: [
      { id: PLAY_FIELDS.place, name: '場所', type: 'short_text', required: true, visibleInList: true, searchable: true, filterable: false, sortOrder: 0 },
      { id: PLAY_FIELDS.area, name: 'エリア', type: 'single_select', options: ['渋谷', '新宿', '池袋', '吉祥寺', '横浜'], required: false, visibleInList: true, searchable: true, filterable: true, sortOrder: 1 },
      { id: PLAY_FIELDS.budget, name: '予算', type: 'single_select', options: ['〜1,000円', '1,000〜2,000円', '2,000〜3,000円', '3,000円〜'], required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 2 },
      { id: PLAY_FIELDS.duration, name: '所要時間', type: 'short_text', required: false, visibleInList: true, searchable: false, filterable: false, sortOrder: 3 },
      { id: PLAY_FIELDS.people, name: 'おすすめ人数', type: 'short_text', required: false, visibleInList: true, searchable: false, filterable: false, sortOrder: 4 },
      { id: PLAY_FIELDS.note, name: 'メモ', type: 'long_text', required: false, visibleInList: false, searchable: true, filterable: false, sortOrder: 5 },
      { id: PLAY_FIELDS.url, name: 'URL', type: 'url', required: false, visibleInList: false, searchable: false, filterable: false, sortOrder: 6 },
    ],
  },
  {
    id: 't_job',
    groupId: 'g_jobhunt',
    name: '説明会・選考',
    description: '説明会や選考の体験を記録するテンプレート',
    icon: '🏢',
    createdBy: 'u_tanaka',
    createdAt: '2026-05-20T10:05:00Z',
    fields: [
      { id: 'jf_company', name: '企業名', type: 'short_text', required: true, visibleInList: true, searchable: true, filterable: false, sortOrder: 0 },
      { id: 'jf_industry', name: '業界', type: 'single_select', options: ['IT', 'メーカー', '金融', '商社', '広告'], required: false, visibleInList: true, searchable: true, filterable: true, sortOrder: 1 },
      { id: 'jf_stage', name: '選考段階', type: 'single_select', options: ['説明会', 'ES提出', '一次面接', '最終面接', '内定'], required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 2 },
      { id: 'jf_interest', name: '志望度', type: 'rating', required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 3 },
      { id: 'jf_memo', name: '体験メモ', type: 'long_text', required: false, visibleInList: false, searchable: true, filterable: false, sortOrder: 4 },
    ],
  },
  {
    id: 't_job_research',
    groupId: 'g_jobhunt',
    name: '企業研究',
    description: '企業の特徴・志望理由を整理するテンプレート',
    icon: '📘',
    createdBy: 'u_tanaka',
    createdAt: '2026-05-20T10:06:00Z',
    fields: [
      { id: 'jfr_company', name: '企業名', type: 'short_text', required: true, visibleInList: true, searchable: true, filterable: false, sortOrder: 0 },
      { id: 'jfr_industry', name: '業界', type: 'single_select', options: ['IT', 'メーカー', '金融', '商社', '広告'], required: false, visibleInList: true, searchable: true, filterable: true, sortOrder: 1 },
      { id: 'jfr_strength', name: '魅力', type: 'long_text', required: false, visibleInList: false, searchable: true, filterable: false, sortOrder: 2 },
      { id: 'jfr_note', name: 'メモ', type: 'long_text', required: false, visibleInList: false, searchable: true, filterable: false, sortOrder: 3 },
      { id: 'jfr_status', name: '状態', type: 'single_select', options: ['調査中', '志望候補', '検討中'], required: false, visibleInList: true, searchable: false, filterable: true, sortOrder: 4 },
    ],
  },
]

export const tags: Tag[] = [
  { id: 'tag_osusume', groupId: 'g_food', name: 'おすすめ', color: 'oklch(0.63 0.19 27)' },
  { id: 'tag_sagyo', groupId: 'g_food', name: '作業向き', color: 'oklch(0.55 0.14 260)' },
  { id: 'tag_ninzu', groupId: 'g_food', name: '大人数向け', color: 'oklch(0.6 0.12 160)' },
  { id: 'tag_teikakaku', groupId: 'g_food', name: '低価格', color: 'oklch(0.72 0.14 70)' },
  { id: 'tag_date', groupId: 'g_food', name: 'デート', color: 'oklch(0.65 0.15 330)' },
  { id: 'tag_2026', groupId: 'g_jobhunt', name: '2026年度', color: 'oklch(0.55 0.14 260)' },
  { id: 'tag_sanka', groupId: 'g_jobhunt', name: '説明会参加済み', color: 'oklch(0.6 0.12 160)' },
]

export const memos: Memo[] = [
  {
    id: 'm_1',
    groupId: 'g_food',
    templateId: 't_food',
    title: 'STREAM COFFEE 渋谷店',
    values: {
      [FOOD_FIELDS.shopName]: 'STREAM COFFEE 渋谷店',
      [FOOD_FIELDS.area]: '渋谷',
      [FOOD_FIELDS.price]: '1,000〜2,000円',
      [FOOD_FIELDS.rating]: 4,
      [FOOD_FIELDS.scenes]: ['作業向き', '一人', 'ランチ'],
      [FOOD_FIELDS.review]:
        'Wi-Fiと電源が充実していて、平日の昼は空いてる。ラテが美味しくて長居しやすい。奥の席がおすすめ。レポート作業がめちゃくちゃ捗った。',
      [FOOD_FIELDS.visitedAt]: '2026-07-28',
      [FOOD_FIELDS.url]: 'https://example.com/stream-coffee',
    },
    tagIds: ['tag_sagyo', 'tag_osusume'],
    attachments: [
      { id: 'a_1', kind: 'image', name: 'cafe.jpg', url: '/memos/cafe-interior.png', size: 2_400_000 },
    ],
    createdBy: 'u_me',
    visibility: 'group',
    status: 'published',
    reactions: [
      { userId: 'u_tanaka', type: 'helpful' },
      { userId: 'u_sato', type: 'wanna_go' },
      { userId: 'u_suzuki', type: 'saved' },
    ],
    comments: [
      { id: 'c_1', memoId: 'm_1', userId: 'u_tanaka', body: '先週行ったら朝は結構混んでた！開店直後が狙い目かも。', createdAt: '2026-07-30T09:20:00Z' },
    ],
    activity: [
      { id: 'l_1', memoId: 'm_1', userId: 'u_me', action: 'created', detail: 'メモを作成しました', createdAt: '2026-07-28T18:00:00Z' },
      { id: 'l_2', memoId: 'm_1', userId: 'u_me', action: 'file_added', detail: '「cafe.jpg」を追加しました', createdAt: '2026-07-28T18:01:00Z' },
    ],
    viewCount: 42,
    createdAt: '2026-07-28T18:00:00Z',
    updatedAt: '2026-07-30T09:20:00Z',
  },
  {
    id: 'm_2',
    groupId: 'g_food',
    templateId: 't_food',
    title: 'トラットリア ソーレ',
    values: {
      [FOOD_FIELDS.shopName]: 'トラットリア ソーレ',
      [FOOD_FIELDS.area]: '吉祥寺',
      [FOOD_FIELDS.price]: '2,000〜3,000円',
      [FOOD_FIELDS.rating]: 5,
      [FOOD_FIELDS.scenes]: ['ディナー', 'デート'],
      [FOOD_FIELDS.review]:
        '生パスタが本当に美味しい。トマトソースが濃厚で感動した。雰囲気も良くてデートにぴったり。予約必須。',
      [FOOD_FIELDS.visitedAt]: '2026-07-15',
      [FOOD_FIELDS.url]: '',
    },
    tagIds: ['tag_date', 'tag_osusume'],
    attachments: [
      { id: 'a_2', kind: 'image', name: 'pasta.jpg', url: '/memos/pasta-dish.png', size: 3_100_000 },
    ],
    createdBy: 'u_sato',
    visibility: 'group',
    status: 'published',
    reactions: [
      { userId: 'u_me', type: 'wanna_go' },
      { userId: 'u_tanaka', type: 'helpful' },
      { userId: 'u_kimura', type: 'wanna_go' },
      { userId: 'u_suzuki', type: 'helpful' },
    ],
    comments: [
      { id: 'c_2', memoId: 'm_2', userId: 'u_me', body: 'ここ行きたい！今度みんなで予約しよう。', createdAt: '2026-07-16T21:00:00Z' },
      { id: 'c_3', memoId: 'm_2', userId: 'u_kimura', body: '週末は混むから平日夜がおすすめです。', createdAt: '2026-07-17T12:30:00Z' },
    ],
    activity: [
      { id: 'l_3', memoId: 'm_2', userId: 'u_sato', action: 'created', detail: 'メモを作成しました', createdAt: '2026-07-15T22:00:00Z' },
    ],
    viewCount: 67,
    createdAt: '2026-07-15T22:00:00Z',
    updatedAt: '2026-07-17T12:30:00Z',
  },
  {
    id: 'm_3',
    groupId: 'g_food',
    templateId: 't_food',
    title: '麺屋 一进 新宿',
    values: {
      [FOOD_FIELDS.shopName]: '麺屋 一进 新宿',
      [FOOD_FIELDS.area]: '新宿',
      [FOOD_FIELDS.price]: '〜1,000円',
      [FOOD_FIELDS.rating]: 4,
      [FOOD_FIELDS.scenes]: ['ランチ', '一人'],
      [FOOD_FIELDS.review]:
        'コスパ最高の家系ラーメン。学割があるので学生証を忘れずに。チャーシューが厚くて満足感がすごい。',
      [FOOD_FIELDS.visitedAt]: '2026-08-02',
      [FOOD_FIELDS.url]: '',
    },
    tagIds: ['tag_teikakaku', 'tag_osusume'],
    attachments: [
      { id: 'a_3', kind: 'image', name: 'ramen.jpg', url: '/memos/ramen-bowl.png', size: 2_800_000 },
    ],
    createdBy: 'u_suzuki',
    visibility: 'group',
    status: 'published',
    reactions: [
      { userId: 'u_me', type: 'saved' },
      { userId: 'u_tanaka', type: 'experienced' },
    ],
    comments: [],
    activity: [
      { id: 'l_4', memoId: 'm_3', userId: 'u_suzuki', action: 'created', detail: 'メモを作成しました', createdAt: '2026-08-02T13:00:00Z' },
    ],
    viewCount: 25,
    createdAt: '2026-08-02T13:00:00Z',
    updatedAt: '2026-08-02T13:00:00Z',
  },
  {
    id: 'm_4',
    groupId: 'g_food',
    templateId: 't_food',
    title: '居酒屋 のみち 池袋',
    values: {
      [FOOD_FIELDS.shopName]: '居酒屋 のみち 池袋',
      [FOOD_FIELDS.area]: '池袋',
      [FOOD_FIELDS.price]: '2,000〜3,000円',
      [FOOD_FIELDS.rating]: 3,
      [FOOD_FIELDS.scenes]: ['ディナー', '大人数'],
      [FOOD_FIELDS.review]:
        '飲み放題付きで大人数の飲み会に便利。個室があるので騒いでも大丈夫。料理は普通だけど、コスパは悪くない。',
      [FOOD_FIELDS.visitedAt]: '2026-06-20',
      [FOOD_FIELDS.url]: '',
    },
    tagIds: ['tag_ninzu'],
    attachments: [
      { id: 'a_4', kind: 'image', name: 'izakaya.jpg', url: '/memos/izakaya.png', size: 2_600_000 },
      { id: 'a_5', kind: 'pdf', name: '宴会コースメニュー.pdf', url: '#', size: 1_200_000 },
    ],
    createdBy: 'u_kimura',
    visibility: 'group',
    status: 'published',
    reactions: [{ userId: 'u_tanaka', type: 'helpful' }],
    comments: [
      { id: 'c_4', memoId: 'm_4', userId: 'u_sato', body: '新歓の会場候補にいいかも。', createdAt: '2026-06-21T10:00:00Z' },
    ],
    activity: [
      { id: 'l_5', memoId: 'm_4', userId: 'u_kimura', action: 'created', detail: 'メモを作成しました', createdAt: '2026-06-20T23:00:00Z' },
    ],
    viewCount: 38,
    createdAt: '2026-06-20T23:00:00Z',
    updatedAt: '2026-06-21T10:00:00Z',
  },
  {
    id: 'm_5',
    groupId: 'g_food',
    templateId: 't_play',
    title: '新宿のカラオケ・ゲームスポット',
    values: {
      [PLAY_FIELDS.place]: '新宿のカラオケ＆ゲーム',
      [PLAY_FIELDS.area]: '新宿',
      [PLAY_FIELDS.budget]: '2,000〜3,000円',
      [PLAY_FIELDS.duration]: '2〜3時間',
      [PLAY_FIELDS.people]: '3〜4人',
      [PLAY_FIELDS.note]: '平日夜なら比較的空いていて、友達との会話も楽しめる。',
      [PLAY_FIELDS.url]: 'https://example.com/party-place',
    },
    tagIds: ['tag_date', 'tag_sagyo'],
    attachments: [],
    createdBy: 'u_me',
    visibility: 'group',
    status: 'published',
    reactions: [{ userId: 'u_tanaka', type: 'wanna_go' }],
    comments: [],
    activity: [
      { id: 'l_6', memoId: 'm_5', userId: 'u_me', action: 'created', detail: 'メモを作成しました', createdAt: '2026-08-04T20:30:00Z' },
    ],
    viewCount: 18,
    createdAt: '2026-08-04T20:30:00Z',
    updatedAt: '2026-08-04T20:30:00Z',
  },
]

export const notifications: AppNotification[] = [
  { id: 'n_1', type: 'comment', title: '新しいコメント', body: '田中さんが「STREAM COFFEE 渋谷店」にコメントしました', createdAt: '2026-07-30T09:20:00Z', read: false, memoId: 'm_1' },
  { id: 'n_2', type: 'memo_update', title: 'メモが更新されました', body: '保存した「トラットリア ソーレ」に新しいコメントが付きました', createdAt: '2026-07-17T12:30:00Z', read: false, memoId: 'm_2' },
  { id: 'n_3', type: 'invite', title: 'グループ招待', body: '「就活情報共有」に招待されました', createdAt: '2026-06-01T10:00:00Z', read: true },
]

// お気に入り（memoId の配列）
export const favoriteMemoIds: string[] = ['m_2']
