// Vercel Serverless Function
// ユーザーの自撮り写真（1枚）＋ 目標の髪型（テキスト指定）を Gemini API に渡し、
// 顔立ち・肌の色・背景を保持したまま、指定の髪型に変更した「正面＋横顔（2面図・16:9）」の
// 合成画像を1枚生成する。
//
// 参照写真（2枚目の画像）は使わない方式。実際にコピペ用プロンプトとして動作実績のある
// 「自撮り1枚＋髪型のテキスト指定」の構成をそのままAPI化したもの。
//
// 見本写真（referenceImage）が付いている場合は、見本の髪型を1枚目の人物に移す方式（正面1枚）で生成する。
// 髪以外（顔・肌質感・服・背景）は変更しない。2面図より顔の保持精度が高いため、見本がある場合はこちらを優先。
//
// リクエストBody: { userFaceImage: "data:image/...;base64,...", styleName: string, styleSub?: string, referenceImage?: "data:image/...", view?: "side" }
// view:"side" のときは userFaceImage に「髪型変更済みの正面写真」を渡す。同じ人物・同じ髪の横顔（右向き）を1枚生成して返す。
// レスポンス: { image: "data:image/...;base64,..." } または { error: string }
//
// 🔧 差し替えポイント：
//  - 画像生成に対応したモデル名は、実際に利用可能なGemini APIのモデル一覧に合わせて調整してください
//  - レスポンスの構造（candidates[0].content.parts）はAPIのバージョンにより変わる可能性があります

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userFaceImage, styleName, styleSub, referenceImage, view } = req.body || {};
  const isSide = view === "side";

  if (!userFaceImage || (!isSide && !styleName && !referenceImage)) {
    res.status(400).json({ error: "userFaceImage と styleName（または referenceImage）が必要です" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "サーバー側にGEMINI_API_KEYが設定されていません" });
    return;
  }

  function toInlineData(dataUrl) {
    const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || "");
    if (!match) return null;
    return { mimeType: match[1], data: match[2] };
  }

  const imageA = toInlineData(userFaceImage);
  if (!imageA) {
    res.status(400).json({ error: "画像はdata URL形式（data:image/...;base64,...）である必要があります" });
    return;
  }

  const imageRef = referenceImage ? toInlineData(referenceImage) : null;
  if (referenceImage && !imageRef) {
    res.status(400).json({ error: "referenceImageはdata URL形式である必要があります" });
    return;
  }

  const styleLabel = styleName ? (styleSub ? `${styleName}（${styleSub}）` : styleName) : "";

  // 🔧 差し替えポイント：髪色のタグ名（例：「ベージュ・ハイトーン」）だけでは
  // 画像生成AIが具体的な色味（トーン・彩度）を誤解しやすい（例：ゴールドの金髪になってしまう等）。
  // 実際の狙いに近づけるため、代表的な色タグごとに具体的な見た目の説明を補足する。
  const COLOR_HINTS = {
    "黒髪": "赤みや茶色みのない、地毛に近い自然な黒〜濃い黒。",
    "暗髪ブラウン": "一見黒に近いが、光に当たるとほんのり茶色みが見える暗めのブラウン。",
    "ブラウン": "赤み〜黄みのある、はっきりとしたライトブラウン〜ミディアムブラウン。金色に寄りすぎない落ち着いた茶色。",
    "ベージュ・ハイトーン": "黄み・オレンジみを抑えた、明るく柔らかいベージュ系のハイトーンカラー。派手な金髪（ゴールドブロンド）にはしないこと。",
    "アッシュ・グレー": "赤み・黄みを抑えた、灰色がかった寒色系のカラー。くすみ・透明感のあるモノトーン系。",
    "ピンク・レッド・オレンジ": "ピンク・レッド・オレンジ系のはっきりした暖色カラー。",
    "ブルー・パープル・グリーン": "ブルー・パープル・グリーン系のはっきりした寒色〜中間色カラー。",
    "ホワイト・ペール": "脱色による白髪風のホワイト、または彩度を抑えたペールカラー。",
  };
  const colorHintEntry = Object.entries(COLOR_HINTS).find(([tag]) => styleLabel.includes(tag));

  // 🔧 差し替えポイント：長さの指定（例：「ミディアム」）も、タグ名だけでは
  // 画像生成AIが自身の判断で伸ばしてしまう等、指定通りにならないことがある。
  // 具体的な長さの目安を補足し、元の自撮り写真の髪の長さに引っ張られないよう明示する。
  const LENGTH_HINTS = {
    "スキンヘッド": "髪をすべて剃り上げた、髪の毛がほぼ無い状態。頭皮が完全に見える。",
    "ボウズ": "長さ約12mmまでのバリカン刈り。髪はあるがごく短く、地肌が透けて見える程度の長さ。",
    "ショート": "耳が半分〜完全に見える程度の長さ。あごのラインより上で収まる、コンパクトなシルエット。",
    "ミディアム": "あごのライン〜鎖骨・肩にかかる程度の長さ。胸元までは届かない（ボブ・ロブを含む）。",
    "ロング": "肩よりも下、鎖骨〜胸元、あるいはそれよりも長く伸びた長さ。",
  };
  const lengthHintEntry = Object.entries(LENGTH_HINTS).find(([tag]) => styleLabel.includes(tag));

  // 見本写真あり：髪の領域だけを置き換える部分編集として指示する（顔・肌・服・背景の保持を優先）
  const referencePrompt = [
    "これは髪型の部分編集（インペイント）の依頼です。",
    "1枚目＝編集対象の人物写真（ベース）。2枚目＝髪型の見本写真（髪型の参照のみ）。",
    "【変更してよいのは1枚目の「髪の毛」の領域だけ】髪の長さ・シルエット・分け目・前髪・毛量・毛流れ・質感・髪色を、2枚目の髪型に合わせてください。見本の髪型が自分の頭に実際に生えているように、生え際・もみあげ・襟足を自然につなげてください。必ず見本とはっきり分かるレベルまで髪型を変えてください（元の髪型のまま、わずかな変化にとどめるのは不可）。",
    "【髪以外は1枚目のピクセルをそのまま維持】顔（目・鼻・口・輪郭・歯・表情・笑い方）、肌の質感（シワ・ほくろ・毛穴・肌色・ツヤ）、年齢感、眉毛、服装、背景、構図、トリミング、ライティングは1枚目から一切変えない。美肌補正・若返り・小顔補正・フィルター加工は禁止。",
    "2枚目の人物の顔・肌・服・背景・アクセサリーは絶対に取り込まない。",
    "出力は1枚目と同じ画角・同じ縦横比の写真1枚のみ。文字・ロゴ・透かしなし。",
  ].join("\n");

  // 横顔：髪型変更済みの正面写真から、同じ人物・同じ髪の横顔を作る（正面と髪が食い違わないようにする）
  const sidePrompt = [
    "1枚目は、髪型を変更済みの人物の正面写真です。同じ人物・同じ髪型（長さ・毛量・毛流れ・髪色・質感すべて同一）を、真横（右向きの横顔）から撮影した写真を生成してください。",
    "顔立ち・肌の質感・年齢感・服装・背景・ライティングは1枚目と同じにし、髪型だけが1枚目と食い違わないこと。耳・もみあげ・襟足・後頭部のボリュームも自然に描写してください。",
    "出力は横顔の写真1枚のみ。文字・ロゴ・透かしなし。",
  ].join("\n");

  const prompt = [
    `添付した人物写真の髪型だけを「${styleLabel}」に変更してください。`,
    "顔立ち・肌の色・背景はそのまま保持してください。別人にならないよう、顔のパーツ（目・鼻・口・輪郭）は一切変形させないでください。",
    colorHintEntry ? `髪色「${colorHintEntry[0]}」の具体的な見た目：${colorHintEntry[1]}` : null,
    lengthHintEntry
      ? `髪の長さ「${lengthHintEntry[0]}」の具体的な目安：${lengthHintEntry[1]} 元の自撮り写真の髪の長さがこれと異なっていても、必ず指定の長さに変更してください（伸ばす方向・切る方向のどちらであっても、指定の長さを優先すること）。`
      : null,
    "正面から見た写真と、横顔（サイド）から見た写真の2枚を、1枚の画像の中に左右に並べて生成してください（アスペクト比16:9、左：正面、右：横顔）。",
    "この2枚は「同じ日に同じ美容室で施術した直後の、同一人物・同一の髪」を正面と横から撮影しただけのものです。左右で髪の長さ・髪色・前髪・質感が少しでも異なることは絶対にありません。",
    "左側の正面写真は、元の写真をそのまま使い回さず、必ず指定した新しい髪型（長さ・前髪・質感）・髪色に変更した状態で生成してください。右側の横顔写真も同様です。生成した後、左右の髪の長さ・髪色が完全に一致しているか自己チェックしてから出力してください（例：片方が指定の長さ・色でも、もう片方が元の写真のまま、あるいは別の色・長さになっている状態は不可）。",
    "画像内に文字・タイトル・ロゴ・透かし・キャプション・番号は一切含めないでください。写真のみを生成してください。",
  ].filter(Boolean).join("\n");

  try {
    // 🔧 差し替えポイント：画像生成対応モデル名（例：gemini-2.5-flash-image 等）を実際の利用可能モデルに合わせてください
    const model = "gemini-2.5-flash-image";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 見本写真の髪を先に文章で言語化し、指示に添える（画像だけだと「長めのウェーブ」など一般的な形に寄りやすいため）
    let referenceDetail = "";
    if (imageRef && !isSide) {
      try {
        const descRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [
                  { text: "この写真の人物の「髪型だけ」を、美容師が再現できるよう日本語で簡潔に箇条書きで説明してください。見たままを正確に書き、一般的な髪型に当てはめて推測しないこと。必ず含める項目：全体の長さ（顔まわり・サイド・後ろそれぞれ、耳・あご・襟・肩のどこまで届くか）、分け目（センター／7:3／なし）と前髪、サイド（耳が出ているか・隠れているか）、襟足（短いか）、質感（ストレートか、ウェーブか。ツヤ・束感・濡れ感）、毛量、髪色。顔・服・背景には触れない。見えない部分は「不明」。" },
                  { inlineData: { mimeType: imageRef.mimeType, data: imageRef.data } },
                ],
              }],
            }),
          }
        );
        if (descRes.ok) {
          const descData = await descRes.json();
          referenceDetail = descData?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text || "";
        }
      } catch (e) {
        console.error("reference description failed:", e);
      }
    }
    const referenceFinal = referenceDetail
      ? `${referencePrompt}\n【見本の髪型の詳細（必ずこのとおりに再現。これより長く・ボリュームを多くしない）】\n${referenceDetail}`
      : referencePrompt;

    const parts = [
      { text: isSide ? sidePrompt : imageRef ? referenceFinal : prompt },
      { inlineData: { mimeType: imageA.mimeType, data: imageA.data } },
    ];
    // 見本あり：本人→見本の順で渡す。見本→本人の順にすると、白背景の写真などで人物ごと見本モデルに入れ替わる事故が起きた
    if (imageRef && !isSide) parts.push({ inlineData: { mimeType: imageRef.mimeType, data: imageRef.data } });

    // 画像が返らずテキストだけ返る場合があるため、1回だけ再試行する
    let imagePart = null;
    for (let attempt = 0; attempt < 2 && !imagePart; attempt++) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("Gemini API error:", response.status, errText);
        res.status(502).json({ error: "画像の生成に失敗しました。時間をおいて再度お試しください。" });
        return;
      }

      const data = await response.json();
      imagePart = (data?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
      if (!imagePart) console.error("No image returned from Gemini:", JSON.stringify(data).slice(0, 300));
    }

    if (!imagePart) {
      res.status(502).json({ error: "画像の生成に失敗しました。時間をおいて再度お試しください。" });
      return;
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const base64 = imagePart.inlineData.data;

    res.status(200).json({ image: `data:${mimeType};base64,${base64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "画像の生成に失敗しました。時間をおいて再度お試しください。" });
  }
}
