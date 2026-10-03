import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  createProject,
  defaults,
  generateJob,
  urlLines,
  validateForm,
  type JobAssets,
  type MotionForm,
} from "./job";
import { loadTemplates } from "./templates";

function Icon({
  name,
  size = 20,
}: {
  name:
    | "play"
    | "arrow"
    | "download"
    | "file"
    | "layers"
    | "sliders"
    | "check"
    | "plus"
    | "close"
    | "copy"
    | "shield"
    | "box";
  size?: number;
}) {
  const paths = {
    play: <path d="m9 5 11 7-11 7Z" />,
    arrow: (
      <>
        <path d="M4 12h16M14 6l6 6-6 6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H5v18h14V8Z" />
        <path d="M14 3v5h5M8 13h8M8 17h5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 6-10 6L2 9Zm-10 11 10 6 10-6M2 18l10 6 10-6" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M8 3v6m8 0v6m-6 0v6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M15 8V3H3v13h5" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    box: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7Zm-9 5 9 5 9-5M12 12v10M7 4.8l9 5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const sections = [
  { id: "concept", title: "動画の企画", caption: "CONCEPT" },
  { id: "sources", title: "参考資料と指示", caption: "SOURCES" },
  { id: "direction", title: "デザイン方向性", caption: "DIRECTION" },
  { id: "character", title: "キャラクター", caption: "CHARACTER" },
  { id: "voice", title: "音声と出力", caption: "VOICE & OUTPUT" },
];
const agentPrompt =
  "AGENTS.mdを読み、brief.mdとsourcesを基に動画を制作してください。台本・ストーリーボード・Remotionシーン・Aivis音声・3Dキャラ同期を実装し、設定に応じて場面に合う簡単なBGM・SEも制作してください。previewを映像と音で確認して修正後、final.mp4を完成させてください。";
const sizeLabel = (size: number) =>
  size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;

function Section({ index, children }: { index: number; children: ReactNode }) {
  const section = sections[index];
  return (
    <section className="form-section" id={section.id}>
      <div className="section-heading">
        <span className="section-number">0{index + 1}</span>
        <div>
          <span className="eyebrow">{section.caption}</span>
          <h2>{section.title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function AttachmentList({
  files,
  remove,
}: {
  files: File[];
  remove: (index: number) => void;
}) {
  return (
    <ul className="attachments">
      {files.map((file, i) => (
        <li key={`${i}-${file.name}`}>
          <span className="attachment-icon">
            <Icon name="file" size={18} />
          </span>
          <div>
            <strong title={file.name}>{file.name}</strong>
            <small>{sizeLabel(file.size)}</small>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={`${file.name}を削除`}
            onClick={() => remove(i)}
          >
            <Icon name="close" size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [form, setForm] = useState<MotionForm>({ ...defaults });
  const [sources, setSources] = useState<File[]>([]);
  const [character, setCharacter] = useState<File>();
  const [bgm, setBgm] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState("concept");
  const [preview, setPreview] = useState<"layout" | "files" | "json">("layout");
  const [advanced, setAdvanced] = useState(false);
  const [info, setInfo] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const assets: JobAssets = {
    sources: sources.map((file) => ({
      name: file.name,
      data: file,
      size: file.size,
      type: file.type,
    })),
    character: character && {
      name: character.name,
      data: character,
      size: character.size,
      type: character.type,
    },
    bgm: bgm && { name: bgm.name, data: bgm, size: bgm.size, type: bgm.type },
  };
  const project = createProject(form, assets);
  const completed = [
    Boolean(
      form.title.trim() && form.description.trim() && form.audience.trim(),
    ),
    sources.length > 0 ||
      urlLines(form.urls).length > 0 ||
      Boolean(form.instructions.trim()),
    Boolean(form.design.trim()),
    Boolean(character || form.characterNotes.trim()),
    Boolean(form.voiceEngine && form.width && form.height),
  ];
  const valid = validateForm(form, assets).length === 0;
  const totalBytes =
    sources.reduce((sum, file) => sum + file.size, 0) +
    (character?.size ?? 0) +
    (bgm?.size ?? 0);
  function changed() {
    setSuccess("");
    setErrors([]);
  }
  function field<K extends keyof MotionForm>(key: K, value: MotionForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    changed();
  }
  function addSources(list: FileList | File[]) {
    const files = Array.from(list);
    setSources((previous) => [...previous, ...files]);
    changed();
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (info) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [info]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    const issues = validateForm(form, assets);
    setErrors(issues);
    if (issues.length) {
      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        errorRef.current?.focus();
      });
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const result = await generateJob(
        form,
        assets,
        await loadTemplates(),
        setProgress,
      );
      const url = URL.createObjectURL(
        new Blob([result.data as BlobPart], { type: "application/zip" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setSuccess(
        `${result.filename} を生成しました。展開してOpusへ渡してください。`,
      );
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "ZIPの生成に失敗しました。",
      ]);
    } finally {
      setBusy(false);
    }
  }
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(agentPrompt);
      setCopyStatus("コピーしました");
    } catch {
      setCopyStatus(
        "コピーできませんでした。下の指示を選択してコピーしてください。",
      );
    }
  }
  function sample() {
    setForm({
      ...defaults,
      title: "虹はどうしてできる？",
      description:
        "光の屈折と分散を、雨粒を通る光の動きで説明する30秒動画。最後に「虹は光が分かれて見える現象」と理解できるようにする。",
      audience: "理科に興味がある中高生。屈折の前提知識は不要。",
      durationSec: 30,
      instructions:
        "雨粒の断面と光線をアニメーションで示す。冒頭で疑問を提示し、赤と青の光が異なる角度で進むところを視覚的に強調。",
    });
    changed();
  }

  const select = <K extends keyof MotionForm>(
    key: K,
    title: string,
    options: [string, string][],
  ) => (
    <label>
      {title}
      <select
        value={String(form[key])}
        onChange={(e) => field(key, e.target.value as MotionForm[K])}
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#concept" aria-label="BiimMaker トップ">
          <span className="brand-symbol">
            <Icon name="play" size={22} />
          </span>
          <span>
            BiimMaker<small>MOTION JOB STUDIO</small>
          </span>
        </a>
        <div className="workspace-label">
          WORKSPACE <span>01</span>
        </div>
        <div className="workspace-current">
          <Icon name="layers" size={18} />
          動画ジョブを作成
          <span className="status-dot" />
        </div>
        <div className="nav-label">YOUR BRIEF</div>
        <nav aria-label="入力セクション">
          {sections.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={active === section.id ? "active" : ""}
              aria-current={active === section.id ? "location" : undefined}
            >
              <span className={`nav-number ${completed[i] ? "done" : ""}`}>
                {completed[i] ? <Icon name="check" size={13} /> : `0${i + 1}`}
              </span>
              {section.title}
              <span className="nav-arrow">↗</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <Icon name="shield" size={18} />
            <span>
              あなたのブラウザで完結<small>資料のアップロードは不要です</small>
            </span>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => setInfo(true)}
          >
            このスタジオについて <span>↗</span>
          </button>
          <small className="version">BiimMakerWebUI · v0.1</small>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <span>
            Workspace <span className="breadcrumb-slash">/</span>{" "}
            <strong>New motion job</strong>
          </span>
          <span className="local-badge">
            <span className="status-dot" />
            LOCAL ONLY
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="tiny-square" />
                FROM IDEA TO MOTION
              </div>
              <h1>
                伝えたいことを、
                <br />
                <span>動きのある動画へ。</span>
              </h1>
              <p>
                企画と資料をまとめて、映像制作の準備を。
                <br />
                構成も、演出も、実装も。あとはOpusへ。
              </p>
            </div>
            <button
              type="button"
              className="sample-button"
              disabled={busy}
              onClick={sample}
            >
              <Icon name="plus" size={16} />
              30秒のサンプルを入力
            </button>
          </div>
          <div className="pipeline" aria-label="制作の流れ">
            <div className="pipeline-step current">
              <span>01</span>企画をつくる
            </div>
            <Icon name="arrow" size={17} />
            <div className="pipeline-step">
              <span>02</span>Job ZIPを書き出す
            </div>
            <Icon name="arrow" size={17} />
            <div className="pipeline-step">
              <span>03</span>Opusが動画を制作
            </div>
            <span className="pipeline-end">.mp4</span>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="editor-grid">
              <fieldset className="form-body" disabled={busy}>
                <Section index={0}>
                  <p className="section-intro">
                    まずは、動画のゴールを決めましょう。
                  </p>
                  <label>
                    動画タイトル <em>必須</em>
                    <input
                      required
                      maxLength={200}
                      value={form.title}
                      onChange={(e) => field("title", e.target.value)}
                      placeholder="例：腎障害を5分で理解する"
                    />
                  </label>
                  <label>
                    何を説明する動画か <em>必須</em>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) => field("description", e.target.value)}
                      placeholder="扱うテーマ、伝えたい結論、見終わった後に理解してほしいこと。"
                    />
                  </label>
                  <div className="row concept-row">
                    <label>
                      対象視聴者 <em>必須</em>
                      <input
                        required
                        value={form.audience}
                        onChange={(e) => field("audience", e.target.value)}
                        placeholder="例：初期研修医"
                      />
                    </label>
                    <label>
                      希望尺
                      <div className="unit-input">
                        <input
                          aria-label="希望尺（秒）"
                          type="number"
                          min={5}
                          max={7200}
                          step={1}
                          value={form.durationSec || ""}
                          onChange={(e) =>
                            field("durationSec", Number(e.target.value))
                          }
                        />
                        <span>秒</span>
                      </div>
                      <small>
                        {Math.floor(form.durationSec / 60)}分{" "}
                        {form.durationSec % 60}秒を目安に制作
                      </small>
                    </label>
                  </div>
                </Section>

                <Section index={1}>
                  <p className="section-intro">
                    説明の根拠と、動画全体へのリクエストを。
                  </p>
                  <label>
                    参考URL
                    <textarea
                      rows={3}
                      value={form.urls}
                      onChange={(e) => field("urls", e.target.value)}
                      placeholder={"https://example.com/article\n1行に1つのURL"}
                    />
                    <small>
                      URLの内容は、ZIPを受け取ったOpusが確認します。
                    </small>
                  </label>
                  <div
                    className={`dropzone ${dragging ? "dragging" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!busy) setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      if (!busy) addSources(e.dataTransfer.files);
                    }}
                  >
                    <span className="drop-icon">
                      <Icon name="download" size={22} />
                    </span>
                    <strong>参考資料をここにドロップ</strong>
                    <span>PDF、画像、テキスト、データなど</span>
                    <label className="file-button">
                      ファイルを選ぶ
                      <input
                        type="file"
                        multiple
                        aria-label="参考資料を選択"
                        onChange={(e) => {
                          if (e.target.files) addSources(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <AttachmentList
                    files={sources}
                    remove={(i) => {
                      setSources((prev) =>
                        prev.filter((_, index) => index !== i),
                      );
                      changed();
                    }}
                  />
                  <small className="attachment-count">
                    {sources.length}件の資料 ·{" "}
                    {sizeLabel(sources.reduce((sum, f) => sum + f.size, 0))} /
                    添付は合計500MBまで
                  </small>
                  <label>
                    動画全体への指示
                    <textarea
                      rows={4}
                      value={form.instructions}
                      onChange={(e) => field("instructions", e.target.value)}
                      placeholder="必ず扱いたい内容、避けたい表現、語り口、参考にしたい演出など。自由に書いてください。"
                    />
                    <small>
                      入力した指示は原文のままブリーフに保存されます。
                    </small>
                  </label>
                </Section>

                <Section index={2}>
                  <p className="section-intro">
                    細部を決めすぎず、目指す雰囲気を伝えます。
                  </p>
                  <div className="direction-tags" aria-hidden="true">
                    <span>Biim layout</span>
                    <span>Motion graphics</span>
                    <span>3D character</span>
                  </div>
                  <label>
                    デザイン方向性
                    <textarea
                      rows={4}
                      value={form.design}
                      onChange={(e) => field("design", e.target.value)}
                      placeholder="配色、タイポグラフィ、画面の雰囲気、モーションの参考など。"
                    />
                  </label>
                  <small>
                    標準Biim枠は黒系背景（#1e1e1e）＋グレーの枠線（#cccccc）。Opusが場面ごとにnote_top（右上）・note_bottom（右下）・script（読み上げと字幕）を作成します。本文・ノートはNoto
                    Sans JP、字幕はM PLUS Rounded 1c。枠・フォントは同梱します。
                  </small>
                  <div className="creative-note">
                    <span>↗</span>
                    <p>
                      シーンの構成と演出はOpusに委ねます。
                      <small>
                        Remotion / React / SVG / Canvas /
                        Three.jsを自由に使えるジョブです。
                      </small>
                    </p>
                  </div>
                </Section>

                <Section index={3}>
                  <p className="section-intro">
                    3Dキャラクターを、説明を支える演者に。
                  </p>
                  <label>
                    キャラクター設定
                    <textarea
                      rows={3}
                      value={form.characterNotes}
                      onChange={(e) => field("characterNotes", e.target.value)}
                      placeholder="性格、役割、表情や動きの方向性。"
                    />
                  </label>
                  <div className="asset-picker">
                    <span className="asset-icon">
                      <Icon name="box" size={24} />
                    </span>
                    <div>
                      <strong>3Dキャラクターモデル</strong>
                      <small>GLB形式 · 任意</small>
                    </div>
                    <label className="file-button">
                      モデルを選ぶ
                      <input
                        type="file"
                        accept=".glb"
                        aria-label="3Dモデルを選択"
                        onChange={(e) => {
                          setCharacter(e.target.files?.[0]);
                          e.target.value = "";
                          changed();
                        }}
                      />
                    </label>
                  </div>
                  <AttachmentList
                    files={character ? [character] : []}
                    remove={() => {
                      setCharacter(undefined);
                      changed();
                    }}
                  />
                  <small>
                    モデル未添付でもジョブを作成できます。必要な素材や代替案はOpusが整理します。
                  </small>
                </Section>

                <Section index={4}>
                  <p className="section-intro">
                    声と、最終的な動画の仕様を設定します。
                  </p>
                  {select("voiceEngine", "音声エンジン", [
                    ["aivis", "AivisSpeech — ローカル音声合成"],
                    ["none", "音声合成なし"],
                  ])}
                  {form.voiceEngine === "aivis" && (
                    <>
                      <label>
                        Aivis Engine URL
                        <input
                          type="url"
                          value={form.engineUrl}
                          onChange={(e) => field("engineUrl", e.target.value)}
                        />
                        <small>
                          制作するPCで起動するエンジンのURLです。WebUIからは接続しません。
                        </small>
                      </label>
                      <div className="row">
                        <label>
                          Style ID
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={form.styleId}
                            onChange={(e) =>
                              field("styleId", Number(e.target.value))
                            }
                          />
                        </label>
                        <label>
                          話速
                          <div className="unit-input">
                            <input
                              aria-label="話速"
                              type="number"
                              min={0.5}
                              max={2}
                              step={0.05}
                              value={form.voiceSpeed}
                              onChange={(e) =>
                                field("voiceSpeed", Number(e.target.value))
                              }
                            />
                            <span>×</span>
                          </div>
                        </label>
                      </div>
                    </>
                  )}
                  <label>
                    声・読み方への指示
                    <textarea
                      rows={2}
                      value={form.voiceNotes}
                      onChange={(e) => field("voiceNotes", e.target.value)}
                    />
                  </label>
                  <div className="asset-picker">
                    <span className="asset-icon music">♫</span>
                    <div>
                      <strong>BGM</strong>
                      <small>MP3 / WAV / OGG / M4A / AAC · 任意</small>
                    </div>
                    <label className="file-button">
                      音源を選ぶ
                      <input
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,.aac"
                        aria-label="BGMを選択"
                        onChange={(e) => {
                          setBgm(e.target.files?.[0]);
                          e.target.value = "";
                          changed();
                        }}
                      />
                    </label>
                  </div>
                  <AttachmentList
                    files={bgm ? [bgm] : []}
                    remove={() => {
                      setBgm(undefined);
                      changed();
                    }}
                  />
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={form.generateAudio}
                      onChange={(e) => field("generateAudio", e.target.checked)}
                    />
                    <span>
                      場面に合う簡単なBGM・SEをOpusに作らせる
                      <small>
                        添付BGMを優先し、必要な効果音やループを制作します。
                      </small>
                    </span>
                  </label>
                  <label>
                    BGM・SEへの指示
                    <textarea
                      rows={3}
                      value={form.audioNotes}
                      onChange={(e) => field("audioNotes", e.target.value)}
                      placeholder="音の雰囲気、SEを入れたい場面、避けたい音など。"
                    />
                  </label>
                  <div className="row">
                    <label>
                      出力解像度
                      <select
                        value={`${form.width}x${form.height}`}
                        onChange={(e) => {
                          const [width, height] = e.target.value
                            .split("x")
                            .map(Number);
                          setForm((prev) => ({ ...prev, width, height }));
                          changed();
                        }}
                      >
                        <option value="1920x1080">Full HD · 1920 × 1080</option>
                        <option value="1280x720">HD · 1280 × 720</option>
                        <option value="3840x2160">4K · 3840 × 2160</option>
                      </select>
                    </label>
                    <label>
                      フレームレート
                      <select
                        value={form.fps}
                        onChange={(e) => field("fps", Number(e.target.value))}
                      >
                        {[24, 25, 30, 60].map((fps) => (
                          <option key={fps} value={fps}>
                            {fps} fps
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </Section>

                <section className="advanced-section">
                  <button
                    type="button"
                    className="advanced-toggle"
                    aria-expanded={advanced}
                    aria-controls="advanced-controls"
                    onClick={() => setAdvanced(!advanced)}
                  >
                    <span>
                      <Icon name="sliders" size={19} />
                      <strong>演出と調査の詳細</strong>
                      <small>ADVANCED</small>
                    </span>
                    <span>{advanced ? "−" : "+"}</span>
                  </button>
                  <div id="advanced-controls" hidden={!advanced}>
                    <p className="section-intro">
                      演出の強さと調査方針。数値でシーンを縛らず、方向性を渡します。
                    </p>
                    <div className="row">
                      {select("tempo", "テンポ", [
                        ["slow", "ゆっくり、理解を優先"],
                        ["balanced", "緩急をつける"],
                        ["fast", "テンポよく進める"],
                      ])}
                      {select("energy", "派手さ", [
                        ["restrained", "控えめ"],
                        ["balanced", "要所で強調"],
                        ["bold", "大胆で華やか"],
                      ])}
                    </div>
                    <div className="row">
                      {select("motionAmount", "モーショングラフィックス量", [
                        ["minimal", "必要なところに"],
                        ["balanced", "バランスよく"],
                        ["rich", "豊富に使う"],
                      ])}
                      {select("biimUsage", "Biimレイアウト使用率", [
                        ["never", "使わない"],
                        ["sometimes", "場面に応じて"],
                        ["mostly", "主なレイアウトにする"],
                      ])}
                    </div>
                    {select("characterUsage", "3Dキャラ登場頻度", [
                      ["none", "登場させない"],
                      ["occasional", "ときどき登場"],
                      ["frequent", "頻繁に登場"],
                    ])}
                    <label>
                      数式・図解・チャート方針
                      <textarea
                        rows={3}
                        value={form.diagramPolicy}
                        onChange={(e) => field("diagramPolicy", e.target.value)}
                      />
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={form.allowWebResearch}
                        onChange={(e) =>
                          field("allowWebResearch", e.target.checked)
                        }
                      />
                      <span>
                        追加のWeb調査を許可する
                        <small>
                          オフでも、提供した参考URLの直接参照は許可します。
                        </small>
                      </span>
                    </label>
                    {select("evidencePolicy", "根拠資料の扱い", [
                      ["primary", "一次資料を優先、出典を記録"],
                      ["supplied-only", "提供資料の範囲で説明"],
                      ["balanced", "提供資料と追加資料を照合"],
                    ])}
                  </div>
                </section>
                <p className="editor-footnote">
                  <Icon name="shield" size={16} />
                  入力と添付ファイルはブラウザのメモリ内で処理されます。再読み込みすると消えます。
                </p>
              </fieldset>

              <aside className="review-column">
                <div className="review-sticky">
                  <div className="preview-card">
                    <div className="preview-heading">
                      <span className="eyebrow">JOB OVERVIEW</span>
                      <span className="outline-badge">LIVE</span>
                    </div>
                    <div
                      className="preview-tabs"
                      role="tablist"
                      aria-label="ジョブ概要"
                    >
                      {(
                        [
                          ["layout", "イメージ"],
                          ["files", "同梱ファイル"],
                          ["json", "JSON"],
                        ] as const
                      ).map(([value, title]) => (
                        <button
                          type="button"
                          role="tab"
                          id={`tab-${value}`}
                          aria-controls={`panel-${value}`}
                          aria-selected={preview === value}
                          key={value}
                          className={preview === value ? "selected" : ""}
                          onClick={() => setPreview(value)}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                    <div
                      role="tabpanel"
                      id={`panel-${preview}`}
                      aria-labelledby={`tab-${preview}`}
                    >
                      {preview === "layout" && (
                        <div className="layout-preview">
                          <div
                            className={`video-schematic ${form.biimUsage === "never" ? "full-screen" : ""}`}
                          >
                            <div className="schematic-main">
                              <span className="scene-label">SCENE / 01</span>
                              <strong>
                                Ideas in
                                <br />
                                <i>motion.</i>
                              </strong>
                              <svg
                                className="schematic-diagram"
                                viewBox="0 0 240 75"
                                aria-hidden="true"
                              >
                                <path
                                  d="M20 55C60 55 50 15 95 25S160 70 215 10"
                                  stroke="#ddeb9a"
                                  fill="none"
                                  strokeWidth="2"
                                />
                                <circle cx="95" cy="25" r="7" fill="#ddeb9a" />
                                <circle cx="20" cy="55" r="4" fill="#9bbaa4" />
                                <circle cx="215" cy="10" r="4" fill="#ddeb9a" />
                                <path d="M20 70h195" stroke="#506555" />
                              </svg>
                            </div>
                            {form.biimUsage !== "never" && (
                              <div className="schematic-notes">
                                <span>POINT</span>
                                <div />
                                <div />
                                <div />
                                <span>CONTEXT</span>
                                <div />
                                <div />
                                <div />
                                <div />
                              </div>
                            )}
                            {form.characterUsage !== "none" && (
                              <div className="schematic-character">
                                <svg
                                  width="45"
                                  height="57"
                                  viewBox="0 0 45 57"
                                  aria-hidden="true"
                                >
                                  <circle
                                    cx="22"
                                    cy="14"
                                    r="12"
                                    fill="#ddedbb"
                                  />
                                  <path
                                    d="M3 56V42a19 19 0 0 1 38 0v14"
                                    fill="#a5be8e"
                                  />
                                  <circle
                                    cx="18"
                                    cy="14"
                                    r="1.5"
                                    fill="#3b5244"
                                  />
                                  <circle
                                    cx="27"
                                    cy="14"
                                    r="1.5"
                                    fill="#3b5244"
                                  />
                                  <path d="M18 20h9" stroke="#3b5244" />
                                </svg>
                              </div>
                            )}
                            <div className="schematic-subtitle">
                              <span />
                              <span />
                            </div>
                          </div>
                          <p className="preview-caption">
                            レイアウトの参考イメージ · 完成映像はOpusが制作
                          </p>
                        </div>
                      )}
                      {preview === "files" && (
                        <pre className="file-tree">{`my-video/\n├─ AGENTS.md\n├─ project.json\n├─ brief.md\n├─ sources/  (${sources.length} files)\n├─ assets/\n│  ${character ? "├─ character.glb" : "└─ (素材は任意)"}\n${bgm ? "│  └─ bgm" + bgm.name.slice(bgm.name.lastIndexOf(".")) + "\n" : ""}├─ runtime/\n│  ├─ package.json\n│  ├─ src/\n│  └─ scripts/\n├─ motion-kit/  (10 components)\n├─ scenes/\n│  └─ Scene001.tsx\n└─ reports/`}</pre>
                      )}
                      {preview === "json" && (
                        <pre className="json-preview">
                          {JSON.stringify(project, null, 2)}
                        </pre>
                      )}
                    </div>
                    <div className="job-title">
                      <span>YOUR NEXT VIDEO</span>
                      <h3>{form.title || "まだ名前のない、次の動画。"}</h3>
                    </div>
                    <dl className="job-specs">
                      <div>
                        <dt>尺の目安</dt>
                        <dd>
                          {form.durationSec ? `${form.durationSec} sec` : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>出力</dt>
                        <dd>
                          {form.width === 3840
                            ? "4K"
                            : form.width === 1280
                              ? "HD"
                              : "Full HD"}{" "}
                          / {form.fps} fps
                        </dd>
                      </div>
                      <div>
                        <dt>資料</dt>
                        <dd>
                          {sources.length} files / {urlLines(form.urls).length}{" "}
                          URLs
                        </dd>
                      </div>
                      <div>
                        <dt>音声</dt>
                        <dd>
                          {form.voiceEngine === "aivis"
                            ? "AivisSpeech"
                            : "なし"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="export-card">
                    <div className="export-title">
                      <Icon name="box" size={22} />
                      <strong>制作のバトンを渡す。</strong>
                    </div>
                    <p>
                      企画・資料と、動画制作に必要な
                      <br />
                      ランタイムをひとつのZIPに。
                    </p>
                    <div className="export-meta">
                      <span className={valid ? "ready" : ""}>
                        <span className="status-dot" />
                        {valid
                          ? "ジョブを書き出せます"
                          : "企画の必須項目を入力"}
                      </span>
                      <small>添付 {sizeLabel(totalBytes)}</small>
                    </div>
                    <button
                      type="submit"
                      className="download-button"
                      disabled={busy}
                    >
                      <Icon name="download" size={18} />
                      {busy
                        ? `ZIPを生成中… ${progress}%`
                        : "Motion Job ZIPを生成"}
                      {!busy && <span>↗</span>}
                    </button>
                    {busy && (
                      <progress
                        aria-label="ZIP生成の進行状況"
                        max={100}
                        value={progress}
                      />
                    )}
                    {errors.length > 0 && (
                      <div
                        className="errors"
                        role="alert"
                        ref={errorRef}
                        tabIndex={-1}
                      >
                        <strong>入力を確認してください</strong>
                        <ul>
                          {errors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {success && (
                      <div className="success" role="status">
                        <Icon name="check" size={17} />
                        <span>{success}</span>
                      </div>
                    )}
                    <small className="export-note">
                      AIの自動実行・動画のレンダリングは行いません。
                    </small>
                  </div>

                  <div className="handoff-card">
                    <span className="eyebrow">AFTER DOWNLOAD</span>
                    <h3>ZIPを展開して、Opusへ。</h3>
                    <p>展開したフォルダを開き、この指示を渡すだけ。</p>
                    <div className="prompt-box">
                      <p>{agentPrompt}</p>
                      <button
                        type="button"
                        className="copy-button"
                        onClick={copyPrompt}
                      >
                        <Icon name="copy" size={14} />
                        指示をコピー
                      </button>
                    </div>
                    <small role="status">{copyStatus}</small>
                    <div className="runtime-tags">
                      <span>Remotion</span>
                      <span>React Three Fiber</span>
                      <span>Aivis</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </form>
          <footer>
            <span>
              BiimMaker <small>IDEAS DESERVE MOTION.</small>
            </span>
            <button
              type="button"
              className="text-button"
              onClick={() => setInfo(true)}
            >
              同梱物とデータの扱い ↗
            </button>
          </footer>
        </main>
      </div>

      <dialog
        ref={dialogRef}
        onCancel={() => setInfo(false)}
        onClose={() => setInfo(false)}
      >
        <div className="dialog-heading">
          <span className="eyebrow">ABOUT THE STUDIO</span>
          <button
            className="icon-button"
            type="button"
            aria-label="閉じる"
            onClick={() => setInfo(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <h2>
          動画制作のための、
          <br />
          小さな出発点。
        </h2>
        <p>
          BiimMakerは企画・資料・演出方針を、外部のAIエージェントへ渡すMotion
          Job ZIPを作ります。AI API、バックエンド、アカウントは必要ありません。
        </p>
        <h3>同梱するもの</h3>
        <p>
          制作指示、JSON設定、ブリーフ、添付資料、最小Remotion / React /
          Three.jsプロジェクト、Aivisラッパー、字幕・BGMの再生口、10個のmotion-kitコンポーネント、preview
          / build /
          validateコマンド。依存パッケージやNode.js、Aivisエンジン、3Dモデルは自動で同梱しません。
        </p>
        <h3>データの扱い</h3>
        <p>
          入力やファイルはサーバーへ送信せず、ブラウザのメモリ内でZIP化します。再読み込みすると入力は消えます。参考URLはこの画面では取得しません。ZIPを渡したエージェントや、その制作環境でのデータ処理は各サービスの設定に従います。
        </p>
        <h3>制作環境と参考元</h3>
        <p>
          ZIPの実行にはNode.js
          22以上、依存パッケージの取得、Remotionのレンダリング用ブラウザが必要です。音声合成には別途AivisSpeechを起動します。Remotionの利用条件は同梱READMEの公式リンクで確認できます。
        </p>
        <p>
          <a
            href="https://github.com/kokuren333/BookOrderWebUI"
            target="_blank"
            rel="noreferrer"
          >
            BookOrderWebUI
          </a>
          のジョブ生成構成と、
          <a
            href="https://github.com/kokuren333/BiimSlideMaker"
            target="_blank"
            rel="noreferrer"
          >
            BiimSlideMaker
          </a>
          の音声合成・動画制作方針を参考にしています。
        </p>
      </dialog>
    </div>
  );
}
