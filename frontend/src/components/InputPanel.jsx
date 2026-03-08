import { useState } from 'react';

export default function InputPanel({ onSubmit, submitting }) {
  const [text, setText] = useState('');
  const MAX = 160;

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    await onSubmit(text);
    setText('');
  }

  return (
    <div className="input-zone">
      <div className="input-shell">
        <p className="input-prompt">
          Say the sentence you were never allowed to say —{' '}
          <strong>at work, at home, in society.</strong>{' '}
          No name. No trace. Just the truth.
        </p>

        <div className="input-row">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX))}
            onKeyDown={handleKey}
            placeholder="I was told to smile and be quiet…"
            disabled={submitting}
            rows={2}
            maxLength={MAX}
            className="whisper-input"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="send-btn"
          >
            {submitting ? '…' : '↑'}
          </button>
        </div>

        <div className="input-meta">
          <span className="anon-label">
            <span className="anon-dot" /> Fully anonymous
          </span>
          <span className={`char-count ${text.length > 130 ? 'warn' : ''}`}>
            {MAX - text.length}
          </span>
        </div>

        {submitting && (
          <div className="processing">
            Embedding your voice into the archive
            <span className="dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
