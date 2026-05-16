#!/usr/bin/env python3
"""
生成 promo.html 旁白配音 MP3 (参考 fanghu/scripts/generate-tutorial-audio.py).

流程:
  1. 解析 promo.html 的 SCRIPT 数组 (t / duration / zh / en)
  2. 用指定 TTS 引擎合成每条旁白片段到 /tmp/promo-tts-{lang}/seg-XXX.mp3
  3. 用 ffmpeg 按 t 时间码精确对齐 + 静音填空, 拼接成完整 promo-{lang}.mp3
  4. 输出到 scripts/video/dist/promo-{lang}.mp3

支持两种 TTS 引擎:
  - say (默认): macOS 内置, 完全离线, 不依赖网络
                zh: Tingting (婷婷, zh_CN)
                en: Samantha  (en_US)
  - edge-tts:   微软 Edge 神经网络, 质量更高但需要代理访问 bing.com
                zh: zh-CN-XiaoxiaoNeural
                en: en-US-AriaNeural
                用法: --engine edge-tts --proxy http://127.0.0.1:7897

依赖:
  - ffmpeg (brew install ffmpeg)
  - 用 edge-tts 时: pip install edge-tts (推荐复用 /Users/leo/code/me/fanghu/.venv-tts)

用法:
  python3 scripts/video/tts.py zh                          # 中文版, say 引擎
  python3 scripts/video/tts.py en                          # 英文版, say 引擎
  python3 scripts/video/tts.py zh --engine edge-tts        # 中文版, edge-tts 引擎
"""

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROMO_HTML = ROOT / "promo.html"
DIST_DIR = ROOT / "dist"

# 音色映射
SAY_VOICES = {"zh": "Tingting", "en": "Samantha"}
EDGE_VOICES = {"zh": "zh-CN-XiaoxiaoNeural", "en": "en-US-AriaNeural"}


def parse_script(html: str):
    """从 promo.html 抽 const SCRIPT = [...] 的所有 entries."""
    m = re.search(r"const\s+SCRIPT\s*=\s*\[", html)
    if not m:
        raise RuntimeError("找不到 const SCRIPT = [")
    i = m.end()
    depth = 1
    while i < len(html) and depth > 0:
        c = html[i]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
        i += 1
    arr_body = html[m.end() : i - 1]

    entries = []
    pos = 0
    while True:
        m2 = re.search(
            r"\{\s*t:\s*(\d+)\s*,\s*duration:\s*(\d+)\s*,",
            arr_body[pos:],
        )
        if not m2:
            break
        t = int(m2.group(1))
        duration = int(m2.group(2))

        # 找到本 entry 的配对 }
        entry_start = pos + m2.start()
        depth = 1
        j = pos + m2.end()
        while j < len(arr_body) and depth > 0:
            ch = arr_body[j]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
            j += 1
        entry_src = arr_body[entry_start:j]

        zh_match = re.search(r"zh:\s*'((?:[^'\\]|\\.)*)'", entry_src, re.DOTALL)
        en_match = re.search(r"en:\s*'((?:[^'\\]|\\.)*)'", entry_src, re.DOTALL)
        zh = (zh_match.group(1) if zh_match else "").replace("\\'", "'").replace("\\n", " ").strip()
        en = (en_match.group(1) if en_match else "").replace("\\'", "'").replace("\\n", " ").strip()

        entries.append({"t": t, "duration": duration, "zh": zh, "en": en})
        pos = j

    return entries


def parse_total_ms(html: str) -> int:
    m = re.search(r"const\s+TOTAL\s*=\s*([\d.]+)\s*;", html)
    if not m:
        raise RuntimeError("找不到 const TOTAL = ...")
    return int(float(m.group(1)) * 1000)


# ----------------------------------------------------------------------------
# TTS engines
# ----------------------------------------------------------------------------


def tts_say(text: str, voice: str, out_path: Path, rate_wpm: int = 240) -> None:
    """用 macOS say 合成 aiff → 转 mp3.

    rate_wpm: 朗读速率 (词/分钟). 默认 240, 比 say 默认 175 快 40%, 适合短促的宣传旁白.
              这样可以避免 atempo 后处理时的机器音感.
    """
    aiff_path = out_path.with_suffix(".aiff")
    subprocess.run(
        ["say", "-v", voice, "-r", str(rate_wpm), "-o", str(aiff_path), text],
        check=True,
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(aiff_path),
            "-acodec", "libmp3lame", "-b:a", "96k", "-ar", "24000", "-ac", "1",
            str(out_path),
        ],
        check=True,
        capture_output=True,
    )
    aiff_path.unlink(missing_ok=True)


async def tts_edge_async(text: str, voice: str, rate: str, proxy: str | None, out_path: Path) -> None:
    """用 edge-tts 合成 mp3."""
    try:
        import edge_tts  # type: ignore
    except ImportError:
        sys.exit("edge-tts 未安装. 用 macOS say (默认) 或 pip install edge-tts")

    kwargs = {"text": text, "voice": voice, "rate": rate}
    if proxy:
        kwargs["proxy"] = proxy
    communicate = edge_tts.Communicate(**kwargs)
    await communicate.save(str(out_path))


def synth_one(idx: int, text: str, engine: str, voice: str, rate: str, proxy: str | None, out_path: Path, say_wpm: int = 240):
    if out_path.exists() and out_path.stat().st_size > 0:
        print(f"  [{idx:02d}] 已存在, 跳过: {out_path.name}")
        return
    short = (text[:30] + "...") if len(text) > 30 else text
    print(f"  [{idx:02d}] {engine}: {short}")
    if engine == "say":
        tts_say(text, voice, out_path, rate_wpm=say_wpm)
    elif engine == "edge-tts":
        asyncio.run(tts_edge_async(text, voice, rate, proxy, out_path))
    else:
        sys.exit(f"不支持的引擎: {engine}")


# ----------------------------------------------------------------------------
# Audio assembly (仿 fanghu)
# ----------------------------------------------------------------------------


def get_mp3_duration_ms(path: Path) -> int:
    res = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True,
    )
    return int(float(res.stdout.strip()) * 1000)


def assemble(entries: list, total_ms: int, lang: str, seg_dir: Path, out_path: Path):
    """按 t 对齐拼接 + 静音填空 + 超时 atempo 加速.

    fitted_dir 存调速后的片段, 每段 ≤ entry.duration * 0.95.
    """
    fitted_dir = seg_dir / "fitted"
    fitted_dir.mkdir(exist_ok=True)
    print("\n🎚️  调速对齐每段 TTS 到 entry.duration...")
    fitted_paths = []
    for idx, e in enumerate(entries):
        seg = seg_dir / f"seg-{idx:03d}.mp3"
        if not seg.exists():
            raise RuntimeError(f"片段缺失: {seg}")
        actual_ms = get_mp3_duration_ms(seg)
        budget_ms = int(e["duration"] * 0.95)  # 留 5% 给停顿
        fitted = fitted_dir / f"seg-{idx:03d}.mp3"

        if actual_ms <= budget_ms:
            if not fitted.exists() or fitted.stat().st_size != seg.stat().st_size:
                shutil.copy(seg, fitted)
            print(f"  [{idx:02d}] ok   实际 {actual_ms}ms ≤ 预算 {budget_ms}ms")
        else:
            tempo = actual_ms / budget_ms
            print(f"  [{idx:02d}] 加速 实际 {actual_ms}ms > 预算 {budget_ms}ms, atempo={tempo:.3f}")
            # atempo 单次范围 [0.5, 2.0], 超出要级联
            filters = []
            t = tempo
            while t > 2.0:
                filters.append("atempo=2.0")
                t /= 2.0
            filters.append(f"atempo={t:.4f}")
            filter_str = ",".join(filters)
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(seg),
                 "-filter:a", filter_str,
                 "-c:a", "libmp3lame", "-b:a", "96k", "-ac", "1",
                 str(fitted)],
                check=True, capture_output=True,
            )
        fitted_paths.append(fitted)

    # 拼接: 按 t 推进, 不足处插静音
    pieces = []
    cursor = 0
    for idx, e in enumerate(entries):
        start = e["t"]
        if start < cursor:
            print(f"  ⚠️  entry {idx} t={start} < cursor={cursor}, 顺延", file=sys.stderr)
            start = cursor
        gap = start - cursor
        if gap > 0:
            pieces.append(("__silence__", gap))
        pieces.append((fitted_paths[idx], None))
        cursor = start + get_mp3_duration_ms(fitted_paths[idx])
    if cursor < total_ms:
        pieces.append(("__silence__", total_ms - cursor))

    # 写 concat list
    concat_list = seg_dir / "concat.txt"
    silence_dir = seg_dir / "silence"
    silence_dir.mkdir(exist_ok=True)
    used_silence: dict = {}
    with concat_list.open("w", encoding="utf-8") as f:
        for path, ms in pieces:
            if path == "__silence__":
                sp = used_silence.get(ms)
                if sp is None:
                    sp = silence_dir / f"silence-{ms}ms.mp3"
                    if not sp.exists():
                        subprocess.run(
                            ["ffmpeg", "-y", "-f", "lavfi",
                             "-i", "anullsrc=r=24000:cl=mono",
                             "-t", f"{ms / 1000:.3f}",
                             "-q:a", "9", "-acodec", "libmp3lame",
                             str(sp)],
                            check=True, capture_output=True,
                        )
                    used_silence[ms] = sp
                f.write(f"file '{sp}'\n")
            else:
                f.write(f"file '{path}'\n")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"\n📦 拼接 → {out_path}")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
         "-i", str(concat_list),
         "-c:a", "libmp3lame", "-b:a", "96k", "-ac", "1",
         str(out_path)],
        check=True, capture_output=True,
    )
    actual_ms = get_mp3_duration_ms(out_path)
    size_kb = out_path.stat().st_size / 1024
    print(f"\n✅ {lang} 旁白完成: {out_path}")
    print(f"   时长: {actual_ms / 1000:.1f}s (期望 {total_ms / 1000:.1f}s)")
    print(f"   大小: {size_kb:.1f} KB")


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lang", choices=["zh", "en"])
    ap.add_argument("--engine", choices=["say", "edge-tts"], default="say",
                    help="TTS 引擎 (默认 say, 离线; edge-tts 质量更高但需要代理)")
    ap.add_argument("--rate", default="-5%", help="edge-tts 语速 (say 引擎忽略)")
    ap.add_argument("--proxy", default=None, help="edge-tts 代理 URL")
    ap.add_argument("--voice", default=None, help="覆盖默认音色")
    ap.add_argument("--say-wpm", type=int, default=240, help="say 引擎朗读速率 词/分钟 (默认 240)")
    ap.add_argument("--clean", action="store_true", help="清空旧片段重新生成")
    args = ap.parse_args()

    voice = args.voice or (SAY_VOICES[args.lang] if args.engine == "say" else EDGE_VOICES[args.lang])
    seg_dir = Path(f"/tmp/promo-tts-{args.lang}-{args.engine}")
    if args.clean and seg_dir.exists():
        shutil.rmtree(seg_dir)
    seg_dir.mkdir(parents=True, exist_ok=True)

    html = PROMO_HTML.read_text(encoding="utf-8")
    entries = parse_script(html)
    total_ms = parse_total_ms(html)
    print(f"📜 解析到 {len(entries)} 条旁白, TOTAL = {total_ms}ms ({total_ms / 1000:.1f}s)")
    print(f"🎙️  引擎: {args.engine}, 音色: {voice}, 语种: {args.lang}")

    text_key = args.lang  # 'zh' or 'en'
    for idx, e in enumerate(entries):
        text = e[text_key]
        if not text:
            print(f"  [{idx:02d}] ⚠️  {text_key} 文本为空, 跳过")
            continue
        out = seg_dir / f"seg-{idx:03d}.mp3"
        synth_one(idx, text, args.engine, voice, args.rate, args.proxy, out, say_wpm=args.say_wpm)

    out_path = DIST_DIR / f"promo-{args.lang}.mp3"
    assemble(entries, total_ms, args.lang, seg_dir, out_path)


if __name__ == "__main__":
    main()
