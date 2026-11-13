import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  aivisStyleLabel,
  agentPromptFor,
  modeSettingsFor,
  switchVideoMode,
  switchStyleMode,
  type StyleMode,
  type ModeSettings,
  createProject,
  characterProfiles,
  defaults,
  generateJob,
  urlLines,
  validateForm,
  usesFullScreen,
  type CharacterForm,
  type JobAssets,
  type MotionForm,
  parseGhostCheckReport,
  ghostCheckVerdict,
  type GhostCheckSummary,
} from "./job";
import { loadTemplates, templates } from "./templates";
import {
  directionAxes,
  directionCandidates,
  formatCandidate,
  lyricStats,
  mvQualityChecklist,
} from "./mv-assist";
import {
  explainerAxesForContext,
  explainerCandidates,
  explainerQualityChecklist,
  explainerStyles,
  formatExplainerCandidate,
  scriptStats,
} from "./explainer-assist";

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

/** Family theme notch: a 45° pixel cut on the top-left corner of a region
 * (same shape as the CyberSprite panel notch, 10px cut with a 2px line). */
function Notch() {
  return (
    <svg className="notch" width={11} height={11} aria-hidden="true">
      <path
        className="notch-out"
        d="M0 0h10v1h-10zM0 1h9v1h-9zM0 2h8v1h-8zM0 3h7v1h-7zM0 4h6v1h-6zM0 5h5v1h-5zM0 6h4v1h-4zM0 7h3v1h-3zM0 8h2v1h-2zM0 9h1v1h-1z"
      />
      <path
        className="notch-halo"
        d="M10 0h1v1h-1zM9 1h1v1h-1zM8 2h1v1h-1zM7 3h1v1h-1zM6 4h1v1h-1zM5 5h1v1h-1zM4 6h1v1h-1zM3 7h1v1h-1zM2 8h1v1h-1zM1 9h1v1h-1zM0 10h1v1h-1z"
      />
      <path
        className="notch-line"
        d="M10 1h1v1h-1zM9 2h2v1h-2zM8 3h2v1h-2zM7 4h2v1h-2zM6 5h2v1h-2zM5 6h2v1h-2zM4 7h2v1h-2zM3 8h2v1h-2zM2 9h2v1h-2zM1 10h2v1h-2z"
      />
    </svg>
  );
}

/** 16×16 pixel icon copied from the family icon set (public/icons/). */
function PixelIcon({ name }: { name: "info" | "validate-ok" | "warning" | "error" }) {
  return (
    <img
      className="ico"
      src={`${import.meta.env.BASE_URL}icons/${name}.png`}
      width={16}
      height={16}
      alt=""
    />
  );
}

const sections = [
  { id: "concept", title: "動画の企画", caption: "CONCEPT" },
  { id: "sources", title: "参考資料と指示", caption: "SOURCES" },
  { id: "direction", title: "デザイン方向性", caption: "DIRECTION" },
  { id: "character", title: "キャラクター", caption: "CHARACTER" },
  { id: "voice", title: "音声と出力", caption: "VOICE & OUTPUT" },
];
const sizeLabel = (size: number) =>
  size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;
const motionKitCount = Object.keys(templates).filter((path) =>
  /^motion-kit\/[^/]+\.tsx$/.test(path),
).length;

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
  const [secondCharacter, setSecondCharacter] = useState<File>();
  const [bgm, setBgm] = useState<File>();
  const [music, setMusic] = useState<File>();
  const [musicStatus, setMusicStatus] = useState("");
  const modeDrafts = useRef<
    Partial<Record<MotionForm["videoMode"], ModeSettings>>
  >({});
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
  const [directionSeed, setDirectionSeed] = useState(() =>
    Math.floor(Math.random() * 2 ** 31),
  );
  const [addedCandidate, setAddedCandidate] = useState<number | null>(null);
  const [explainerSeed, setExplainerSeed] = useState(() =>
    Math.floor(Math.random() * 2 ** 31),
  );
  const [addedExplainerCandidate, setAddedExplainerCandidate] = useState<number | null>(null);
  const [adoptedExplainerCandidates, setAdoptedExplainerCandidates] = useState<
    { text: string; mode: StyleMode }[]
  >([]);
  const [ghostSummary, setGhostSummary] = useState<GhostCheckSummary | null>(
    null,
  );
  const [ghostStills, setGhostStills] = useState<Record<string, string>>({});
  const [ghostError, setGhostError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isMV = form.videoMode === "mv";
  const agentPrompt = agentPromptFor(form.videoMode, form.styleMode);
  const assets: JobAssets = {
    sources: sources.map((file) => ({
      name: file.name,
      data: file,
      size: file.size,
      type: file.type,
    })),
    character:
      !isMV && character
        ? {
            name: character.name,
            data: character,
            size: character.size,
            type: character.type,
          }
        : undefined,
    secondCharacter:
      !isMV && form.characterMode === "duo" && secondCharacter
        ? {
            name: secondCharacter.name,
            data: secondCharacter,
            size: secondCharacter.size,
            type: secondCharacter.type,
          }
        : undefined,
    bgm:
      !isMV && bgm
        ? { name: bgm.name, data: bgm, size: bgm.size, type: bgm.type }
        : undefined,
    music:
      isMV && music
        ? { name: music.name, data: music, size: music.size, type: music.type }
        : undefined,
  };
  const project = createProject(form, assets);
  const fullScreen = usesFullScreen(form);
  const portrait = form.height > form.width;
  const lyrics = lyricStats(form.musicLyrics);
  const candidates = directionCandidates(directionSeed);
  const explainerOptions = explainerCandidates(explainerSeed, 3, form);
  const explainerContextAxes = explainerAxesForContext(form);
  const scriptSpeed = Number.isFinite(form.voiceSpeed) && form.voiceSpeed > 0 ? form.voiceSpeed : 1;
  const script = scriptStats(form.outline, { project, speed: scriptSpeed });
  const nonBiimStyle = !isMV && (form.styleMode === "anime" || form.styleMode === "motion");
  const conceptReady = Boolean(
    form.title.trim() && form.description.trim() && form.audience.trim(),
  );
  const mvReadiness: [string, boolean, string][] = [
    ["タイトル・表現したいこと・視聴者", conceptReady, "必須"],
    [
      "完成音源",
      Boolean(music && form.musicDurationSec),
      form.musicDurationSec
        ? `${form.musicDurationSec.toFixed(1)}秒`
        : "必須",
    ],
    ["曲の雰囲気・世界観", Boolean(form.musicMood.trim()), "推奨"],
    [
      "歌詞",
      lyrics.lines > 0,
      lyrics.lines ? `${lyrics.lines}行` : "任意",
    ],
    ["デザイン方向性", Boolean(form.design.trim()), "推奨"],
    ["差別化メモ", Boolean(form.differentiation.trim()), "任意"],
  ];
  const explainerReadiness: [string, boolean, string][] = [
    ["タイトル", Boolean(form.title.trim()), "必須"],
    ["説明目的", Boolean(form.description.trim()), "必須"],
    ["視聴者", Boolean(form.audience.trim()), "必須"],
    ["理解ゴール", Boolean(form.takeaway.trim()), "推奨"],
    ["根拠（資料・URL・追加Web調査）", sources.length > 0 || urlLines(form.urls).length > 0 || form.allowWebResearch, "推奨"],
    ["デザイン方向性", Boolean(form.design.trim()), "推奨"],
    ...(form.characterUsage !== "none" ? [
      ["キャラモデル", Boolean(character && (form.characterMode !== "duo" || secondCharacter)), "推奨"] as [string, boolean, string],
    ] : []),
    ["構成メモ", Boolean(form.outline.trim()), "任意"],
    ["差別化メモ", Boolean(form.explainerDifferentiation.trim()), "任意"],
    ["BGM", Boolean(bgm), "任意"],
  ];
  const explainerWarnings = [
    ...(form.evidencePolicy === "supplied-only" && sources.length === 0 && urlLines(form.urls).length === 0
      ? ["根拠方針が「提供資料の範囲」ですが、資料も参考URLもありません。"] : []),
    ...(form.outline.trim() && form.durationSec > 0 && Math.abs(script.estimatedSeconds - form.durationSec) / form.durationSec >= 0.3
      ? [`構成メモの推定読み上げ ${script.estimatedSeconds.toFixed(1)}秒（目安）が希望尺 ${form.durationSec}秒と3割以上ずれています。`] : []),
    ...(adoptedExplainerCandidates.some((candidate) => candidate.mode !== form.styleMode && form.design.includes(candidate.text))
      ? ["追記したたたき台と、選択中の様式モードが異なります。採る要素を調整するか、様式を選び直してください。"] : []),
    ...(form.styleMode === "mixed" && portrait
      ? ["縦向きでは様式「混在」を使えません。横向きにするか、別の様式を選んでください。"] : []),
    ...(form.styleMode === "mixed" && (form.fullScreen || form.biimUsage === "never")
      ? ["様式「混在」にはBiim区間が必要です。全画面をオフにし、Biim使用率を選び直してください。"] : []),
  ];
  const completed = [
    isMV ? conceptReady && Boolean(music && form.musicDurationSec) : conceptReady,
    sources.length > 0 ||
      urlLines(form.urls).length > 0 ||
      Boolean(form.instructions.trim()),
    Boolean(form.design.trim()),
    Boolean(character || form.characterNotes.trim()),
    Boolean(
      (isMV ? music && form.musicDurationSec : form.voiceEngine) &&
      form.width &&
      form.height,
    ),
  ];
  const valid = validateForm(form, assets).length === 0;
  const totalBytes =
    sources.reduce((sum, file) => sum + file.size, 0) +
    (!isMV ? (character?.size ?? 0) : 0) +
    (!isMV && form.characterMode === "duo" ? (secondCharacter?.size ?? 0) : 0) +
    (isMV ? (music?.size ?? 0) : (bgm?.size ?? 0));
  function selectVideoMode(mode: MotionForm["videoMode"]) {
    if (mode === form.videoMode) return;
    modeDrafts.current[form.videoMode] = modeSettingsFor(form);
    setForm(switchVideoMode(form, mode, modeDrafts.current[mode]));
    setCopyStatus("");
    changed();
  }
  function changed() {
    setSuccess("");
    setErrors([]);
  }
  function field<K extends keyof MotionForm>(key: K, value: MotionForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    changed();
  }
  function characterField<K extends keyof CharacterForm>(
    index: number,
    key: K,
    value: CharacterForm[K],
  ) {
    const firstKeys = {
      name: "characterName",
      reading: "characterReading",
      personality: "characterPersonality",
      speakingStyle: "characterSpeakingStyle",
      role: "characterRole",
      notes: "characterNotes",
      position: "characterPosition",
      subtitleColor: "subtitleColor",
      styleId: "styleId",
      voiceSpeed: "voiceSpeed",
      voiceNotes: "voiceNotes",
    } as const;
    setForm((previous) =>
      index === 0
        ? { ...previous, [firstKeys[key]]: value }
        : {
            ...previous,
            secondCharacter: { ...previous.secondCharacter, [key]: value },
          },
    );
    changed();
  }
  function addSources(list: FileList | File[]) {
    const files = Array.from(list);
    setSources((previous) => [...previous, ...files]);
    changed();
  }

  useEffect(() => {
    if (!music) {
      setMusicStatus("");
      return;
    }
    const url = URL.createObjectURL(music);
    const audio = new Audio();
    let live = true;
    audio.preload = "metadata";
    setMusicStatus("音源の尺を確認中…");
    audio.onloadedmetadata = () => {
      if (!live) return;
      const duration = audio.duration;
      if (!Number.isFinite(duration) || duration <= 0 || duration > 7200) {
        setMusicStatus("0秒超〜7,200秒の音源を選択してください。");
        return;
      }
      setForm((prev) => ({ ...prev, musicDurationSec: duration }));
      setMusicStatus(
        `完成音源の尺: ${duration.toFixed(2)}秒。この尺でMVを制作します。`,
      );
    };
    audio.onerror = () => {
      if (live)
        setMusicStatus(
          "音源を読み込めません。再生できるMP3 / WAV / OGG / M4A / AACを選択してください。",
        );
    };
    audio.src = url;
    return () => {
      live = false;
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(url);
    };
  }, [music]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -50% 0px", threshold: 0 },
    );
    (isMV ? sections.slice(0, 3) : sections).forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [isMV]);
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
  async function loadGhostCheck(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const stillUrls: Record<string, string> = {};
    for (const file of list) {
      if (/\.png$/i.test(file.name))
        stillUrls[file.name] = URL.createObjectURL(file);
    }
    if (Object.keys(stillUrls).length) {
      setGhostStills((previous) => {
        for (const url of Object.values(previous)) URL.revokeObjectURL(url);
        return stillUrls;
      });
    }
    const json = list.find((file) => /\.json$/i.test(file.name));
    if (!json) {
      if (!Object.keys(stillUrls).length)
        setGhostError("ghost-check のJSON（reports/ghost-check*.json）を選んでください。");
      return;
    }
    const parsed = parseGhostCheckReport(await json.text());
    if (!parsed) {
      setGhostSummary(null);
      setGhostError(
        "ghost-check のJSONとして読み取れませんでした。reports/ghost-check.md と同じフォルダのJSONを選んでください。",
      );
      return;
    }
    setGhostError("");
    setGhostSummary(parsed);
  }
  function sample() {
    modeDrafts.current = {};
    setAdoptedExplainerCandidates([]);
    setAddedExplainerCandidate(null);
    setMusic(undefined);
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
    disabled = false,
  ) => (
    <label>
      {title}
      <select
        disabled={disabled}
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
      <header className="app-bar">
        <a className="brand" href="#concept" aria-label="BiimMotion トップ">
          BiimMotion
        </a>
        <h1 className="app-task">動画ジョブを作成</h1>
        <span className="local-note">
          ブラウザ内で完結<small>資料のアップロードは不要です</small>
        </span>
        <button
          type="button"
          className="text-button about-button"
          onClick={() => setInfo(true)}
        >
          <PixelIcon name="info" />
          このスタジオについて
        </button>
        <small className="version">BiimMotion · v0.1</small>
      </header>

      <form className="studio" onSubmit={submit} noValidate>
        <main className="region region-main">
          <Notch />
          <div className="toc-bar">
            <nav className="toc" aria-label="入力セクション">
              {(isMV ? sections.slice(0, 3) : sections).map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={active === section.id ? "active" : ""}
                  aria-current={active === section.id ? "location" : undefined}
                >
                  <span className={`toc-number ${completed[i] ? "done" : ""}`}>
                    0{i + 1}
                  </span>
                  {section.title}
                  <span className="toc-mark" aria-hidden="true">
                    {completed[i] ? "✓" : ""}
                  </span>
                  {completed[i] && <span className="sr-only">（入力済み）</span>}
                </a>
              ))}
            </nav>
            <button
              type="button"
              className="sample-button"
              disabled={busy}
              onClick={sample}
            >
              30秒のサンプルを入力
            </button>
          </div>
              <fieldset className="form-body" disabled={busy}>
                <Section index={0}>
                  <label>
                    制作モード
                    <select
                      value={form.videoMode}
                      onChange={(e) =>
                        selectVideoMode(
                          e.target.value as MotionForm["videoMode"],
                        )
                      }
                    >
                      <option value="explanation">解説動画</option>
                      <option value="mv">MV — 完成音源から制作</option>
                    </select>
                    <small>
                      {isMV
                        ? "完成音源と資料を使い、曲の雰囲気に合う全画面のMVを制作します。"
                        : "企画・資料を基に、音声と映像を制作します。"}
                    </small>
                  </label>
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
                    {isMV ? "MVで表現したいこと" : "何を説明する動画か"}{" "}
                    <em>必須</em>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) => field("description", e.target.value)}
                      placeholder={
                        isMV
                          ? "この曲で何を表現したいか。茶化したい、怒りをぶつけたい、懐かしさを残したい、とにかく楽しませたい等。見終わった後に残したい感情。"
                          : "扱うテーマ、伝えたい結論、見終わった後に理解してほしいこと。"
                      }
                    />
                    {isMV && (
                      <small>
                        何を表現するかが先、作り方は後。演出の判断基準になります。
                      </small>
                    )}
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
                        {isMV
                          ? "MVは完成音源の実測尺を優先します。"
                          : `${Math.floor(form.durationSec / 60)}分 ${form.durationSec % 60}秒を目安に制作`}
                      </small>
                    </label>
                  </div>
                  {!isMV && (
                    <>
                      <label>
                        理解ゴール
                        <textarea
                          rows={3}
                          value={form.takeaway}
                          onChange={(e) => field("takeaway", e.target.value)}
                          placeholder="視聴後に、視聴者が言えること・できること。"
                        />
                      </label>
                      <label>
                        前提知識と想定される誤解
                        <textarea
                          rows={3}
                          value={form.priorKnowledge}
                          onChange={(e) => field("priorKnowledge", e.target.value)}
                          placeholder="すでに知っていること、説明が必要なこと、訂正したい誤解。"
                        />
                      </label>
                      <label>
                        構成メモ・台本の下書き
                        <textarea
                          rows={8}
                          value={form.outline}
                          onChange={(e) => field("outline", e.target.value)}
                          placeholder={"見出しや段落、台本を改行したまま入力できます。\n原文をplan/outline.txtに保存します。"}
                        />
                        <span className="lyric-stats" role="status" aria-label="構成メモの統計">
                          <span>{script.characters}文字</span>
                          <span>推定読み上げ {script.estimatedSeconds.toFixed(1)}秒（目安）</span>
                          <span>見出し {script.headings} / {script.blocks}ブロック</span>
                          <span>最長文 {script.longestSentence}文字</span>
                          <span className={script.overCapacitySentences ? "warn" : ""}>
                            字幕容量超過 {script.overCapacitySentences}文
                          </span>
                          <span>数値・数式を含む行 {script.numericLines}</span>
                        </span>
                        <small>
                          話速 {scriptSpeed} での目安です。字幕領域は
                          {script.captionBoxes.map((box) => `${box.charsPerLine}文字×${box.lines}行`).join(" / ")}。
                          場面は未定のため、いずれかの領域に収まらない文を数えます。超過は字幕単位を分割して直します。数値・数式の行は根拠を確かめる箇所の目安です。
                        </small>
                      </label>
                    </>
                  )}
                  {isMV && (
                    <>
                      <label>
                        曲の雰囲気・世界観
                        <textarea
                          rows={4}
                          value={form.musicMood}
                          onChange={(e) => field("musicMood", e.target.value)}
                          placeholder="例：夜の街を感じる浮遊感のあるエレクトロ。青と紫、静かなAメロからサビで大きく広がる映像。ジャンル、感情、テンポ、色、モチーフなど。"
                        />
                      </label>
                      <label>
                        歌詞（任意）
                        <textarea
                          rows={8}
                          value={form.musicLyrics}
                          onChange={(e) => field("musicLyrics", e.target.value)}
                          placeholder={
                            "歌詞を改行したまま入力してください。\nAメロ・サビなどの区切りも記入できます。"
                          }
                        />
                        <small>
                          原文と改行を保存し、歌詞の表示・タイポグラフィ演出に使用します。
                        </small>
                        {lyrics.lines > 0 && (
                          <span className="lyric-stats" role="status">
                            <span>{lyrics.lines}行</span>
                            <span>{lyrics.blocks}ブロック</span>
                            <span>
                              見出し{" "}
                              {lyrics.sections.length
                                ? lyrics.sections.slice(0, 6).join(" ") +
                                  (lyrics.sections.length > 6 ? " …" : "")
                                : "なし"}
                            </span>
                            <span className={lyrics.longLines ? "warn" : ""}>
                              最長 {lyrics.longest}文字
                              {lyrics.longLines
                                ? `（20文字超 ${lyrics.longLines}行）`
                                : ""}
                            </span>
                          </span>
                        )}
                        {lyrics.lines > 0 && (
                          <small>
                            {lyrics.sections.length
                              ? "見出しは楽曲分析の手がかりになります（実際の時刻は音源で確認します）。"
                              : "[Verse] [サビ] などの見出しを行に書くと、構成の手がかりになります。"}
                            {lyrics.longLines
                              ? " 長い行は、表示時に改行位置と文字サイズを設計します。"
                              : ""}
                          </small>
                        )}
                      </label>
                      <div className="asset-picker">
                        <span className="asset-icon music">♫</span>
                        <div>
                          <strong>
                            完成音源 <em>必須</em>
                          </strong>
                          <small>MP3 / WAV / OGG / M4A / AAC</small>
                        </div>
                        <label className="file-button">
                          音源を選ぶ
                          <input
                            type="file"
                            accept=".mp3,.wav,.ogg,.m4a,.aac"
                            aria-label="MVの完成音源を選択"
                            onChange={(e) => {
                              setMusic(e.target.files?.[0]);
                              field("musicDurationSec", null);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <AttachmentList
                        files={music ? [music] : []}
                        remove={() => {
                          setMusic(undefined);
                          field("musicDurationSec", null);
                        }}
                      />
                      <small role="status">
                        {musicStatus ||
                          "音源の尺を確認し、曲全体に合わせて映像を構成します。歌詞や画像などは02の参考資料へ添付できます。"}
                      </small>
                    </>
                  )}
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
                    <span>{fullScreen ? "Full screen" : "Biim layout"}</span>
                    <span>Motion graphics</span>
                    <span>{isMV ? "Lyric typography" : "3D character"}</span>
                  </div>
                  {!isMV && (
                    <label>
                      様式モード
                      <select
                        value={form.styleMode}
                        onChange={(e) => {
                          setForm((previous) => switchStyleMode(previous, e.target.value as StyleMode));
                          setCopyStatus("");
                          changed();
                        }}
                      >
                        {(Object.entries(explainerStyles) as [StyleMode, typeof explainerStyles.biim][]).map(([mode, style]) => (
                          <option key={mode} value={mode} disabled={portrait && mode === "mixed"}>
                            {style.label}
                          </option>
                        ))}
                      </select>
                      <small>{explainerStyles[form.styleMode].hint}</small>
                      {portrait && form.styleMode === "biim" && (
                        <small>縦向きではBiim枠を使えないため、Biim様式の全画面（枠なし）になります。</small>
                      )}
                      {nonBiimStyle && <small>この様式では常に全画面・枠なし。全画面モードとBiim使用率の値は保持します。</small>}
                    </label>
                  )}
                  <label className="check-label layout-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={fullScreen}
                      disabled={portrait || isMV || nonBiimStyle}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          fullScreen: e.target.checked,
                          biimUsage: e.target.checked ? "never" : "sometimes",
                        }));
                        changed();
                      }}
                    />
                    <span>
                      全画面アニメーション・モーショングラフィックス
                      <small>
                        {isMV
                          ? "MVではBiim枠を使用せず、画面全体を使います。"
                          : nonBiimStyle
                            ? "この様式では常に全画面・枠なし。"
                          : portrait
                            ? "縦9:16ではBiim枠を使用しません。"
                            : "オンにするとBiim枠を外し、映像に画面全体を使います。"}
                      </small>
                    </span>
                  </label>
                  <label>
                    デザイン方向性
                    <textarea
                      rows={6}
                      value={form.design}
                      onChange={(e) => field("design", e.target.value)}
                      placeholder="配色、タイポグラフィ、画面の雰囲気、モーションの参考など。"
                    />
                  </label>
                  {!fullScreen && (
                    <small>
                      標準Biim枠は黒系背景（#1e1e1e）＋グレーの枠線（#cccccc）。Opusが場面ごとにnote_top（右上）・note_bottom（右下）・script（読み上げと字幕）を作成します。本文・ノートはNoto
                      Sans JP、字幕はM PLUS Rounded
                      1c。枠・フォントは同梱します。
                    </small>
                  )}
                  {isMV && (
                    <div className="direction-lab">
                      <div className="direction-lab-heading">
                        <div>
                          <strong>方向性のたたき台</strong>
                          <small>
                            固定のプリセットではなく、6つの軸を毎回組み替えた候補です。曲に合う要素だけ拾い、デザイン方向性へ追記できます。
                          </small>
                        </div>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => {
                            setDirectionSeed(
                              (seed) => (seed * 48271 + 11) % 2147483647,
                            );
                            setAddedCandidate(null);
                          }}
                        >
                          別の組み合わせ
                        </button>
                      </div>
                      <div className="candidate-grid">
                        {candidates.map((candidate, i) => (
                          <article className="candidate-card" key={i}>
                            <span className="candidate-label">
                              案 {String.fromCharCode(65 + i)}
                            </span>
                            <dl>
                              {directionAxes.map((axis) => (
                                <div key={axis.key}>
                                  <dt>{axis.label}</dt>
                                  <dd>{candidate[axis.key]}</dd>
                                </div>
                              ))}
                            </dl>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => {
                                const current = form.design.trim();
                                field(
                                  "design",
                                  [current, formatCandidate(candidate)]
                                    .filter(Boolean)
                                    .join("\n"),
                                );
                                setAddedCandidate(i);
                              }}
                            >
                              {addedCandidate === i
                                ? "追記しました"
                                : "この案を追記"}
                            </button>
                          </article>
                        ))}
                      </div>
                      <details className="axis-hints">
                        <summary>変化の軸と考え方</summary>
                        <ul>
                          {directionAxes.map((axis) => (
                            <li key={axis.key}>
                              <strong>{axis.label}</strong> {axis.hint}
                            </li>
                          ))}
                        </ul>
                        <small>
                          制作時もOpusが曲ごとに3案を作って選び、前作や過去事例の組み合わせをそのまま踏襲しないようにします。
                        </small>
                      </details>
                      <label>
                        差別化メモ（任意）
                        <textarea
                          rows={3}
                          value={form.differentiation}
                          onChange={(e) =>
                            field("differentiation", e.target.value)
                          }
                          placeholder="前作と変えたい点、似せたくない作品、避けたい表現。例：前作はピンクの高速タイポだったので、今回は余白の多いモノクロにする。"
                        />
                      </label>
                    </div>
                  )}
                  {!isMV && (
                    <div className="direction-lab">
                      <div className="direction-lab-heading">
                        <div>
                          <strong>方向性のたたき台</strong>
                          <small>
                            説明の運び方と様式を組み替えた3案です。固定の正解ではなく、採る要素だけデザイン方向性へ追記します。様式モードは選択欄で指定してください。
                          </small>
                        </div>
                        <button type="button" className="ghost-button" onClick={() => {
                          setExplainerSeed((seed) => (seed * 48271 + 11) % 2147483647);
                          setAddedExplainerCandidate(null);
                        }}>別の組み合わせ</button>
                      </div>
                      <div className="candidate-grid">
                        {explainerOptions.map((candidate, i) => (
                          <article className="candidate-card" key={i}>
                            <span className="candidate-label">案 {String.fromCharCode(65 + i)}</span>
                            <dl>
                              {explainerContextAxes.map((axis) => (
                                <div key={axis.key}><dt>{axis.label}</dt><dd>{candidate[axis.key]}</dd></div>
                              ))}
                            </dl>
                            <button type="button" className="ghost-button" onClick={() => {
                              const text = formatExplainerCandidate(candidate);
                              field("design", [form.design.trim(), text].filter(Boolean).join("\n"));
                              setAdoptedExplainerCandidates((previous) => [...previous.filter((entry) => entry.text !== text), { text, mode: candidate.styleMode }]);
                              setAddedExplainerCandidate(i);
                            }}>{addedExplainerCandidate === i ? "追記しました" : "この案を追記"}</button>
                          </article>
                        ))}
                      </div>
                      <details className="axis-hints">
                        <summary>変化の軸と考え方</summary>
                        <ul>{explainerContextAxes.map((axis) => <li key={axis.key}><strong>{axis.label}</strong> {axis.hint}</li>)}</ul>
                        <small>制作時は理解ゴールに照らして3案を比較し、3軸以上と、説明の骨格か図解の核を変えます。キャラなしでは役回りを外します。</small>
                      </details>
                      <label>
                        差別化メモ
                        <textarea rows={3} value={form.explainerDifferentiation} onChange={(e) => field("explainerDifferentiation", e.target.value)} placeholder="前作と変えたい説明の運び方・図解・演技、避けたい表現。MV用のメモとは別々に保持します。" />
                      </label>
                    </div>
                  )}
                  <fieldset className="asset-options">
                    <legend>素材の生成</legend>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={form.imageGeneration}
                        onChange={(e) =>
                          field("imageGeneration", e.target.checked)
                        }
                      />
                      <span>
                        画像素材をCodex CLI + imagegenで生成する
                        <small>
                          背景・透過素材・キャラシートなどが必要な場面で使用します。Codexがない環境では素材なしで進めます。
                        </small>
                      </span>
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={form.videoGeneration}
                        onChange={(e) =>
                          field("videoGeneration", e.target.checked)
                        }
                      />
                      <span>
                        動画生成AI（Seedance等）の使用を許可する
                        <small>
                          既定はオフ。オンにした場合だけ、必要な場面の素材として使えます。
                        </small>
                      </span>
                    </label>
                  </fieldset>
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

                {!isMV && (
                  <>
                    <Section index={3}>
                      <p className="section-intro">
                        3Dキャラクターを、説明を支える演者に。
                      </p>
                      {select("characterMode", "キャラクターモード", [
                        ["solo", "1人で解説"],
                        ["duo", "2人の掛け合い"],
                      ])}
                      {characterProfiles(form).map((profile, index) => {
                        const model = index === 0 ? character : secondCharacter;
                        const setModel =
                          index === 0 ? setCharacter : setSecondCharacter;
                        const label = `${index + 1}人目`;
                        return (
                          <fieldset className="character-card" key={index}>
                            <legend>
                              {label}
                              {profile.name ? ` · ${profile.name}` : ""}
                            </legend>
                            <div className="row">
                              <label>
                                名前（表記）
                                <input
                                  aria-label={`${label}の名前（表記）`}
                                  value={profile.name}
                                  onChange={(e) =>
                                    characterField(
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="例：春日あかり"
                                />
                              </label>
                              <label>
                                読み仮名
                                <input
                                  aria-label={`${label}の読み仮名`}
                                  value={profile.reading}
                                  onChange={(e) =>
                                    characterField(
                                      index,
                                      "reading",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="例：かすがあかり"
                                />
                              </label>
                            </div>
                            <label>
                              役割
                              <input
                                aria-label={`${label}の役割`}
                                value={profile.role}
                                onChange={(e) =>
                                  characterField(index, "role", e.target.value)
                                }
                              />
                            </label>
                            <label>
                              キャラの初期配置
                              <select
                                aria-label={`${label}の配置`}
                                value={profile.position}
                                onChange={(e) =>
                                  characterField(
                                    index,
                                    "position",
                                    e.target.value as CharacterForm["position"],
                                  )
                                }
                              >
                                <option value="left">左</option>
                                <option value="right">右</option>
                              </select>
                              <small>
                                字幕はこの配置に合わせた位置に固定します。1人・2人とも、普段は基本位置を保ち、必要な場面では枠を越えて自由に移動・拡縮できます。
                              </small>
                            </label>
                            <label>
                              性格
                              <textarea
                                aria-label={`${label}の性格`}
                                rows={2}
                                value={profile.personality}
                                onChange={(e) =>
                                  characterField(
                                    index,
                                    "personality",
                                    e.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              口調
                              <textarea
                                aria-label={`${label}の口調`}
                                rows={2}
                                value={profile.speakingStyle}
                                onChange={(e) =>
                                  characterField(
                                    index,
                                    "speakingStyle",
                                    e.target.value,
                                  )
                                }
                              />
                            </label>
                            <label>
                              表情・動きなどへの指示
                              <textarea
                                aria-label={`${label}の動きへの指示`}
                                rows={2}
                                value={profile.notes}
                                onChange={(e) =>
                                  characterField(index, "notes", e.target.value)
                                }
                              />
                            </label>
                            <div className="subtitle-settings">
                              <label>
                                字幕色
                                <input
                                  type="color"
                                  aria-label={`${label}の字幕色`}
                                  value={
                                    /^#[0-9a-f]{6}$/i.test(
                                      profile.subtitleColor,
                                    )
                                      ? profile.subtitleColor
                                      : index === 0
                                        ? defaults.subtitleColor
                                        : defaults.secondCharacter.subtitleColor
                                  }
                                  onChange={(e) =>
                                    characterField(
                                      index,
                                      "subtitleColor",
                                      e.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label>
                                HEX
                                <input
                                  className="color-hex"
                                  aria-label={`${label}の字幕色（HEX）`}
                                  value={profile.subtitleColor}
                                  maxLength={7}
                                  onChange={(e) =>
                                    characterField(
                                      index,
                                      "subtitleColor",
                                      e.target.value,
                                    )
                                  }
                                />
                              </label>
                              <span
                                className="subtitle-sample"
                                style={{ color: profile.subtitleColor }}
                              >
                                {profile.name || label}の字幕
                              </span>
                              <small>白ふち · {profile.subtitleColor}</small>
                            </div>
                            <div className="asset-picker">
                              <span className="asset-icon">
                                <Icon name="box" size={24} />
                              </span>
                              <div>
                                <strong>{label}の3Dモデル</strong>
                                <small>GLB形式 · 任意</small>
                              </div>
                              <label className="file-button">
                                モデルを選ぶ
                                <input
                                  type="file"
                                  accept=".glb"
                                  aria-label={`${label}の3Dモデルを選択`}
                                  onChange={(e) => {
                                    setModel(e.target.files?.[0]);
                                    e.target.value = "";
                                    changed();
                                  }}
                                />
                              </label>
                            </div>
                            <AttachmentList
                              files={model ? [model] : []}
                              remove={() => {
                                setModel(undefined);
                                changed();
                              }}
                            />
                            {form.characterMode === "duo" &&
                              !isMV &&
                              form.voiceEngine === "aivis" && (
                                <>
                                  <div className="row">
                                    <label>
                                      Style ID
                                      <input
                                        aria-label={`${label}のStyle ID`}
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={profile.styleId}
                                        onChange={(e) =>
                                          characterField(
                                            index,
                                            "styleId",
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      <small>
                                        {aivisStyleLabel(profile.styleId)}
                                      </small>
                                    </label>
                                    <label>
                                      話速
                                      <input
                                        aria-label={`${label}の話速`}
                                        type="number"
                                        min={0.5}
                                        max={2}
                                        step={0.05}
                                        value={profile.voiceSpeed}
                                        onChange={(e) =>
                                          characterField(
                                            index,
                                            "voiceSpeed",
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                    </label>
                                  </div>
                                  <label>
                                    声・読み方への指示
                                    <textarea
                                      aria-label={`${label}の声への指示`}
                                      rows={2}
                                      value={profile.voiceNotes}
                                      onChange={(e) =>
                                        characterField(
                                          index,
                                          "voiceNotes",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                </>
                              )}
                          </fieldset>
                        );
                      })}
                      <small>
                        モデル未添付でもジョブを作成できます。必要な素材や代替案はOpusが整理します。
                      </small>
                    </Section>

                    <Section index={4}>
                      {isMV && (
                        <p className="section-intro">
                          完成音源を通常音量で最初から最後まで使用します。曲に合わせて映像を制作し、Aivis音声や追加BGM・SEは生成しません。
                        </p>
                      )}
                      {!isMV && (
                        <>
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
                                  onChange={(e) =>
                                    field("engineUrl", e.target.value)
                                  }
                                />
                                <small>
                                  制作するPCで起動するエンジンのURLです。WebUIからは接続しません。
                                </small>
                              </label>
                              {form.characterMode === "solo" && (
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
                                    <small>
                                      {aivisStyleLabel(form.styleId)}
                                    </small>
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
                                          field(
                                            "voiceSpeed",
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      <span>×</span>
                                    </div>
                                  </label>
                                </div>
                              )}
                            </>
                          )}
                          {form.characterMode === "solo" && (
                            <label>
                              声・読み方への指示
                              <textarea
                                rows={2}
                                value={form.voiceNotes}
                                onChange={(e) =>
                                  field("voiceNotes", e.target.value)
                                }
                              />
                            </label>
                          )}
                          {form.characterMode === "duo" && (
                            <small>
                              Style
                              ID・話速・読み方は各キャラクター欄で設定します。同じStyle
                              IDでは同じ声になります。
                            </small>
                          )}
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
                              onChange={(e) =>
                                field("generateAudio", e.target.checked)
                              }
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
                              onChange={(e) =>
                                field("audioNotes", e.target.value)
                              }
                              placeholder="音の雰囲気、SEを入れたい場面、避けたい音など。"
                            />
                          </label>
                        </>
                      )}
                      <label>
                        画面の向き
                        <select
                          value={portrait ? "portrait" : "landscape"}
                          onChange={(e) => {
                            const toPortrait = e.target.value === "portrait";
                            setForm((prev) => ({
                              ...prev,
                              width: Math[toPortrait ? "min" : "max"](
                                prev.width,
                                prev.height,
                              ),
                              height: Math[toPortrait ? "max" : "min"](
                                prev.width,
                                prev.height,
                              ),
                            }));
                            changed();
                          }}
                        >
                          <option value="landscape">横16:9</option>
                          <option value="portrait">縦9:16（Biim枠なし）</option>
                        </select>
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
                            {(portrait
                              ? [
                                  [1080, 1920, "Full HD"],
                                  [720, 1280, "HD"],
                                  [2160, 3840, "4K"],
                                ]
                              : [
                                  [1920, 1080, "Full HD"],
                                  [1280, 720, "HD"],
                                  [3840, 2160, "4K"],
                                ]
                            ).map(([w, h, title]) => (
                              <option key={`${w}x${h}`} value={`${w}x${h}`}>
                                {title} · {w} × {h}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          フレームレート
                          <select
                            value={form.fps}
                            onChange={(e) =>
                              field("fps", Number(e.target.value))
                            }
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
                  </>
                )}
                {!isMV && (
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
                        {(!fullScreen || nonBiimStyle || form.styleMode === "mixed") &&
                          select("biimUsage", "Biimレイアウト使用率", [
                            ["never", "使わない"],
                            ["sometimes", "場面に応じて"],
                            ["mostly", "主なレイアウトにする"],
                          ], nonBiimStyle)}
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
                          onChange={(e) =>
                            field("diagramPolicy", e.target.value)
                          }
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
                )}
                <p className="editor-footnote">
                  <Icon name="shield" size={16} />
                  入力と添付ファイルはブラウザのメモリ内で処理されます。再読み込みすると消えます。
                </p>
              </fieldset>
          <footer className="main-footer">
            <span>BiimMotion</span>
            <button
              type="button"
              className="text-button"
              onClick={() => setInfo(true)}
            >
              同梱物とデータの扱い
            </button>
          </footer>
        </main>

        <div className="note-column">
          <aside className="region region-note-top" aria-label="ジョブの要点">
            <Notch />
            <h2 className="region-head">ジョブの要点</h2>
            <div className="region-body">
                    <div className="job-title">
                      <h3>{form.title || "まだ名前のない、次の動画。"}</h3>
                    </div>
                    <dl className="job-specs">
                      <div>
                        <dt>モード</dt>
                        <dd>{isMV ? "MV" : "解説動画"}</dd>
                      </div>
                      <div>
                        <dt>尺の目安</dt>
                        <dd>
                          {isMV
                            ? form.musicDurationSec
                              ? `${form.musicDurationSec.toFixed(2)} sec（音源）`
                              : "音源を選択"
                            : form.durationSec
                              ? `${form.durationSec} sec`
                              : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>出力</dt>
                        <dd>
                          {portrait ? "縦9:16" : "横16:9"} · {form.width} ×{" "}
                          {form.height} / {form.fps} fps
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
                          {isMV
                            ? music?.name || "完成音源未選択"
                            : form.voiceEngine === "aivis"
                              ? "AivisSpeech"
                              : "なし"}
                        </dd>
                      </div>
                    </dl>
                    <ul className="readiness" aria-label={isMV ? "MV入力の状況" : "解説入力の状況"}>
                        {(isMV ? mvReadiness : explainerReadiness).map(([label, done, note]) => (
                          <li key={label} className={done ? "done" : ""}>
                            <span className="readiness-mark">
                              {done ? <Icon name="check" size={12} /> : null}
                            </span>
                            {label}
                            <small>{note}</small>
                          </li>
                        ))}
                      </ul>
                    {!isMV && explainerWarnings.length > 0 && (
                      <div className="ghost-verdict warn" role="status" aria-label="解説入力の注意">
                        <ul>{explainerWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                        <small>準備度と注意は入力の助言です。必須入力と設定の整合性は生成時に確認します。</small>
                      </div>
                    )}
            </div>
          </aside>
          <aside className="region region-note-bottom" aria-label="補足">
            <Notch />
            <h2 className="region-head">補足</h2>
            <div className="region-body">
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
                            className={`video-schematic ${fullScreen ? "full-screen" : ""} ${portrait ? "portrait" : ""} ${form.characterMode === "duo" ? "duo" : ""}`}
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
                            {!fullScreen && (
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
                              <div
                                className="schematic-character"
                                style={{
                                  left: `${(project.layout.regions.character[0] / project.layout.base_width) * 100}%`,
                                  right: "auto",
                                }}
                              >
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
                            {form.characterUsage !== "none" &&
                              form.characterMode === "duo" && (
                                <div
                                  className="schematic-character second"
                                  style={{
                                    left: `${(project.layout.regions.character_second[0] / project.layout.base_width) * 100}%`,
                                    right: "auto",
                                  }}
                                  aria-label="2人目のキャラクター"
                                >
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
                                      fill="#c0d6ef"
                                    />
                                    <path
                                      d="M3 56V42a19 19 0 0 1 38 0v14"
                                      fill="#8caac9"
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
                            <div
                              className="schematic-subtitle"
                              style={{
                                left: `${(project.layout.regions.subtitle[0] / project.layout.base_width) * 100}%`,
                                width: `${(project.layout.regions.subtitle[2] / project.layout.base_width) * 100}%`,
                              }}
                            >
                              <span
                                style={{ background: form.subtitleColor }}
                              />
                              <span
                                style={{
                                  background:
                                    form.characterMode === "duo"
                                      ? form.secondCharacter.subtitleColor
                                      : form.subtitleColor,
                                }}
                              />
                            </div>
                          </div>
                          <p className="preview-caption">
                            レイアウトの参考イメージ · 完成映像はOpusが制作
                          </p>
                        </div>
                      )}
                      {preview === "files" && (
                        <pre className="file-tree">{`my-video/\n├─ AGENTS.md\n├─ project.json\n├─ brief.md\n├─ sources/  (${sources.length} files)\n├─ assets/\n│  ${!isMV && character ? "├─ character.glb" : "└─ (素材は任意)"}\n${!isMV && form.characterMode === "duo" && secondCharacter ? "│  ├─ character2.glb\n" : ""}${!isMV && bgm ? "│  └─ bgm" + bgm.name.slice(bgm.name.lastIndexOf(".")) + "\n" : ""}${isMV && music ? "│  └─ music" + music.name.slice(music.name.lastIndexOf(".")) + "\n" : ""}├─ runtime/\n│  ├─ package.json\n│  ├─ src/\n│  └─ scripts/\n├─ motion-kit/  (${motionKitCount} components)\n├─ scenes/\n│  └─ Scene001.tsx\n└─ reports/`}</pre>
                      )}
                      {preview === "json" && (
                        <pre className="json-preview">
                          {JSON.stringify(project, null, 2)}
                        </pre>
                      )}
                    </div>
                  <div className="handoff-card">
                    <h3>ZIPを展開して、Opusへ。</h3>
                    <p>展開したフォルダを開き、この指示を渡すだけ。</p>
                    <div className="prompt-box">
                      <p>{agentPrompt}</p>
                    </div>
                    <small className="export-note">
                      AIの自動実行・動画のレンダリングは行いません。
                    </small>
                  </div>
                      <details className="quality-checklist">
                        <summary>previewで確認する失敗パターン</summary>
                        <ul>
                          {(isMV ? mvQualityChecklist : explainerQualityChecklist).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <small>
                          指摘は「時刻・問題・期待する改善」をセットで伝えると、良い部分を壊さずに直せます。
                        </small>
                      </details>
                    <div className="runtime-tags">
                      <span>Remotion</span>
                      <span>React Three Fiber</span>
                      <span>{isMV ? "Music Video" : "Aivis"}</span>
                    </div>
                    <div className="ghost-check-viewer">
                      <span className="eyebrow">GHOST CHECK</span>
                      <h3>レンダーゴースト検査の結果</h3>
                      <p>
                        ローカル（runtime）で{" "}
                        <code>npm run ghost-check -- --target=preview</code>
                        （final後は引数なし）を実行すると、reports/に
                        ghost-check*.json と ghost-stills/ の静止画が出ます。
                        そのJSONと静止画PNGをここで開くと、結果をこの画面で確認できます（ファイルは送信されません）。
                      </p>
                      <label className="file-button">
                        検査結果を開く
                        <input
                          type="file"
                          accept=".json,.png"
                          multiple
                          aria-label="ghost-checkのJSONと静止画を選択"
                          onChange={(e) => {
                            void loadGhostCheck(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {ghostError && (
                        <p className="ghost-check-error" role="alert">
                          {ghostError}
                        </p>
                      )}
                      {ghostSummary && (
                        <div className="ghost-check-result">
                          <p
                            className={
                              ghostSummary.isolated > 0
                                ? "ghost-verdict warn"
                                : "ghost-verdict"
                            }
                          >
                            {ghostCheckVerdict(ghostSummary)}
                          </p>
                          <ul className="ghost-counts">
                            <li>対象 {ghostSummary.video}</li>
                            <li>
                              {ghostSummary.frames} フレーム（{ghostSummary.duration}）
                            </li>
                            <li>1フレーム検出 {ghostSummary.singleFrameEvents} 件</li>
                            <li>孤立 {ghostSummary.isolated} 件</li>
                            <li>
                              連続クラスタ {ghostSummary.clusteredRuns} ラン（{ghostSummary.clusteredEvents} 件）
                            </li>
                          </ul>
                          {ghostSummary.worst.length > 0 && (
                            <>
                              <strong>ワーストフレーム</strong>
                              <ul className="ghost-worst">
                                {ghostSummary.worst.map((event) => (
                                  <li key={event.frame}>
                                    frame {event.frame}（{event.time}）: {event.tiles} タイル
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {ghostSummary.stills.length > 0 && (
                            <div className="ghost-stills">
                              {ghostSummary.stills.map((still) => (
                                <figure key={still.frame}>
                                  <figcaption>
                                    frame {still.frame}（{still.time}）
                                    {still.kind === "isolated" ? " 孤立" : " クラスタ代表"}
                                  </figcaption>
                                  <div className="ghost-still-images">
                                    {still.files.map((file) => {
                                      const name = file.split("/").pop() ?? file;
                                      const url = ghostStills[name];
                                      return url ? (
                                        <img key={file} src={url} alt={`${name}`} />
                                      ) : (
                                        <span key={file} className="ghost-still-missing">
                                          {name}（未選択）
                                        </span>
                                      );
                                    })}
                                  </div>
                                </figure>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
            </div>
          </aside>
        </div>

        <div className="region subtitle-band" role="region" aria-label="書き出し">
          <Notch />
          <div
            className={`band-caption ${isMV ? "plain" : "caption"}`}
            style={
              isMV
                ? undefined
                : ({
                    "--caption-color": form.subtitleColor,
                    "--caption-alert-color": form.secondCharacter.subtitleColor,
                  } as CSSProperties)
            }
          >
            <p className={`band-status ${valid ? "ready" : ""}`}>
              <PixelIcon name={valid ? "validate-ok" : "warning"} />
              <span className="band-line">
                {valid ? "ジョブを書き出せます" : "企画の必須項目を入力"}
              </span>
              {isMV && (
                <small>
                  音源{" "}
                  {form.musicDurationSec
                    ? `${form.musicDurationSec.toFixed(2)} sec`
                    : "未選択"}
                </small>
              )}
              <small>添付 {sizeLabel(totalBytes)}</small>
            </p>
            {errors.length > 0 && (
              <div
                className="errors"
                role="alert"
                ref={errorRef}
                tabIndex={-1}
              >
                <strong>
                  <PixelIcon name="error" />
                  入力を確認してください
                </strong>
                <ul>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {success && (
              <div className="success" role="status">
                <span>{success}</span>
              </div>
            )}
          </div>
          <div className="band-actions">
            <button
              type="submit"
              className="download-button"
              disabled={busy}
            >
              {busy
                ? `ZIPを生成中… ${progress}%`
                : "Motion Job ZIPを生成"}
            </button>
            {busy && (
              <progress
                aria-label="ZIP生成の進行状況"
                max={100}
                value={progress}
              />
            )}
            <button
              type="button"
              className="copy-button"
              onClick={copyPrompt}
            >
              指示をコピー
            </button>
            <small className="copy-status" role="status">{copyStatus}</small>
          </div>
        </div>
      </form>

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
          Three.jsプロジェクト、Aivisラッパー、字幕・BGMの再生口、Codex imagegenラッパー、{motionKitCount}個のmotion-kitコンポーネント、preview
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
