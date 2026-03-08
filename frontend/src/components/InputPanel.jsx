import { useState, useEffect, useRef } from 'react';

export default function InputPanel({ onSubmit, submitting }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef(null);
  const MAX = 160;

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    const submittedText = text;
    setText('');
    setIsFocused(false);
    await onSubmit(submittedText);
    setShowSuccess(true);
  }

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const charCountColor = text.length > 140 ? 'critical' : text.length > 120 ? 'warning' : 'normal';

  return (
    <div className="input-zone">
      <div className={`input-shell ${isFocused ? 'focused' : ''} ${showSuccess ? 'success' : ''}`}>
        <div className="input-header">
          <h3>Share Your Truth</h3>
          <p className="input-prompt">
            Say the sentence you were never allowed to say —{' '}
            <strong>at work, at home, in society.</strong>
          </p>
        </div>

        <div className="input-row">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX))}
            onKeyDown={handleKey}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="I was told to smile and be quiet…"
            disabled={submitting}
            rows={3}
            maxLength={MAX}
            className="whisper-input"
            aria-label="Your anonymous whisper"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className={`send-btn ${submitting ? 'sending' : ''} ${text.trim() ? 'ready' : ''}`}
            aria-label="Send whisper"
          >
            {submitting ? (
              <span className="sending-spinner">⟳</span>
            ) : (
              <span className="send-arrow">↑</span>
            )}
          </button>
        </div>

        <div className="input-meta">
          <div className="meta-left">
            <span className="anon-label">
              <span className="anon-dot"></span>
              Fully anonymous
            </span>
            <span className="permanence-label">
              <span className="perm-icon">∞</span>
              Permanent
            </span>
          </div>
          <div className="meta-right">
            <span className={`char-count ${charCountColor}`}>
              {MAX - text.length}
            </span>
          </div>
        </div>

        {submitting && (
          <div className="processing">
            <div className="processing-content">
              <span className="processing-text">Embedding your voice into the archive</span>
              <span className="processing-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
            <div className="processing-bar">
              <div className="processing-progress"></div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            <span className="success-text">Your whisper has been added to the archive</span>
          </div>
        )}

        <div className="input-footer">
          <p className="footer-text">
            No name. No trace. Just the truth.
          </p>
        </div>
      </div>
    </div>
  );
}
