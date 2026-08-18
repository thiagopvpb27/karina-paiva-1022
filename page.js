'use client';

import { useEffect, useRef, useState } from 'react';

const FRAME_SRC = '/moldura.png';

export default function Home() {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const frameRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const frame = new Image();
    frame.onload = () => { frameRef.current = frame; draw(); };
    frame.src = FRAME_SRC;
  }, []);

  useEffect(() => { draw(); }, [photoUrl, scale, x, y]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 1200;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    // Base background.
    ctx.fillStyle = '#07132f';
    ctx.fillRect(0, 0, W, H);

    // Circular photo area matches the transparent opening in the frame.
    const cx = W * 0.49, cy = H * 0.49;
    const rx = W * 0.385, ry = H * 0.365;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    const img = imgRef.current;
    if (img) {
      const base = Math.max((rx * 2) / img.naturalWidth, (ry * 2) / img.naturalHeight);
      const s = base * scale;
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      const dx = cx - dw / 2 + x;
      const dy = cy - dh / 2 + y;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#0c2f6f'); g.addColorStop(1, '#07132f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // Frame on top.
    const frame = frameRef.current;
    if (frame) ctx.drawImage(frame, 0, 0, W, H);
  }

  function choosePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Escolha uma imagem JPG, PNG ou WEBP.');
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url); setScale(1); setX(0); setY(0);
    const img = new Image();
    img.onload = () => { imgRef.current = img; draw(); };
    img.src = url;
  }

  function pointerDown(e) {
    if (!imgRef.current) return;
    setDragging(true);
    const p = point(e);
    dragStart.current = { x: p.x, y: p.y, ox: x, oy: y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function pointerMove(e) {
    if (!dragging) return;
    const p = point(e);
    setX(dragStart.current.ox + p.x - dragStart.current.x);
    setY(dragStart.current.oy + p.y - dragStart.current.y);
  }

  function pointerUp() { setDragging(false); }

  function point(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (1200 / r.width), y: (e.clientY - r.top) * (1200 / r.height) };
  }

  function reset() { setScale(1); setX(0); setY(0); }

  function download() {
    if (!imgRef.current) return alert('Primeiro escolha sua foto.');
    const canvas = canvasRef.current;
    canvas.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'minha-foto-karina-paiva-1022.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, 'image/png');
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="badge">MOLDURA OFICIAL</div>
        <h1>Coloque sua foto nessa campanha!</h1>
        <p>Escolha uma foto, ajuste e baixe pronta para usar no perfil.</p>
      </section>

      <section className="editor">
        <div className="preview-wrap">
          <div className="preview-title">PRÉ-VISUALIZAÇÃO</div>
          <div
            className={`canvas-box ${dragging ? 'dragging' : ''}`}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
            onPointerLeave={pointerUp}
          >
            <canvas ref={canvasRef} />
            {!photoUrl && <div className="hint">Sua foto aparecerá aqui</div>}
          </div>
          <small>Arraste a foto para posicionar. Use o zoom abaixo.</small>
        </div>

        <div className="controls">
          <button className="primary" onClick={() => fileRef.current?.click()}>📷 Escolher minha foto</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={choosePhoto} hidden />

          <label>Zoom <strong>{scale.toFixed(2)}×</strong></label>
          <input type="range" min="0.8" max="2.2" step="0.01" value={scale} onChange={e => setScale(Number(e.target.value))} />

          <div className="buttons">
            <button onClick={reset}>↺ Ajustar</button>
            <button className="download" onClick={download}>⬇ Baixar foto</button>
          </div>

          <div className="tips">
            <strong>💡 Dica</strong>
            <span>Prefira uma foto vertical, com o rosto bem iluminado. Você pode arrastar a imagem até ficar no enquadramento.</span>
          </div>
        </div>
      </section>

      <footer>Karina Paiva • Deputada Federal • 1022</footer>
    </main>
  );
}
