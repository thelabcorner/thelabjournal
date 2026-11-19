import { ManuscriptLabel } from '../../../components/typography/ManuscriptLabel';
import { ScientificFigureCaption } from '../../../components/typography/ScientificFigureCaption';

export function CalibrationWorkflowFigure() {
  return (
    <figure className="research-scientific-figure research-calibration-figure my-5 rounded-lg border border-[var(--border)] bg-[var(--figure-bg)] p-3 sm:p-4">
      <ScientificFigureCaption
        title="Figure 3. One reactor, two sequential operating modes"
        detail="Proposed control workflow"
      />
      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-3">
        <p className="text-center text-sm font-semibold text-[var(--text)]">Same heated vessel and weighing system</p>
        <p className="mt-1 text-center text-xs text-[var(--text-secondary)]">Tare → weigh loaded sample → heat → log mass and temperature</p>
      </div>
      <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
        <div className="research-calibration-mode research-calibration-mode--reference rounded-md border border-[var(--border)] bg-[var(--bg-panel)]">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <div className="research-calibration-mode__heading">
              <p>Calibrate a representative aliquot</p>
              <span className="research-calibration-mode__badge">Mode A</span>
            </div>
            <ManuscriptLabel className="research-calibration-mode__context">When a lot is new</ManuscriptLabel>
          </div>
          <div className="space-y-2 px-3 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text)]">01</strong> Measure aliquot mass.</p>
            <p><strong className="text-[var(--text)]">02</strong> Heat through a defined reference endpoint.</p>
            <p><strong className="text-[var(--text)]">03</strong> Save observed endpoint loss per gram and the complete reference trace.</p>
          </div>
        </div>
        <div className="research-calibration-mode research-calibration-mode--process rounded-md border border-[var(--border)] bg-[var(--bg-panel)]">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <div className="research-calibration-mode__heading">
              <p>Process the bulk sample</p>
              <span className="research-calibration-mode__badge">Mode B</span>
            </div>
            <ManuscriptLabel className="research-calibration-mode__context">For later portions</ManuscriptLabel>
          </div>
          <div className="space-y-2 px-3 py-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text)]">01</strong> Select a saved calibration for the same lot.</p>
            <p><strong className="text-[var(--text)]">02</strong> Automatically weigh the new portion and set a reference-loss target.</p>
            <p><strong className="text-[var(--text)]">03</strong> Monitor progress, stop heat and measure the cooling tail.</p>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-3">
        <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3 sm:items-center">
          <p className="text-xs text-[var(--text-secondary)]">Measured aliquot loss<br/><strong className="text-[var(--text)]">÷ aliquot mass</strong></p>
          <p className="rounded-sm bg-[var(--bg-surface)] px-2 py-2 font-mono text-xs font-semibold text-[var(--text)]">
            q_cal [g/g]
          </p>
          <p className="text-xs text-[var(--text-secondary)]">× bulk sample mass<br/><strong className="text-[var(--text)]">= expected reference loss</strong></p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
        A calibration is reused, not a second physical chamber. Bulk samples must be representative of the calibrated
        lot; the reference endpoint and selected percentage describe measured mass loss, not verified chemical conversion.
      </p>
    </figure>
  );
}
