import { HeadingTextWithPermalink } from '../../../components/typography/HeadingPermalink';

/** Proposed controller behavior, not an implemented or validated protection system. */
const sequences = [
  {
    name: 'Calibration',
    purpose: 'Establish a lot-specific reference',
    states: [
      { id: 'TARE', label: 'Tare' },
      { id: 'ALIQUOT_LOAD', label: 'Load aliquot' },
      { id: 'REFERENCE_HEAT', label: 'Reference heat' },
      { id: 'REFERENCE_COOL', label: 'Reference cool' },
      { id: 'SAVE', label: 'Save calibration' },
    ],
  },
  {
    name: 'Production',
    purpose: 'Track a calibrated bulk run',
    states: [
      { id: 'SELECT_LOT', label: 'Select lot' },
      { id: 'TARE', label: 'Tare' },
      { id: 'BULK_LOAD', label: 'Load bulk sample' },
      { id: 'TARGET_CONFIRM', label: 'Confirm target' },
      { id: 'HEAT', label: 'Heat' },
      { id: 'STOPPING', label: 'Stop heating' },
      { id: 'COOLING', label: 'Cool' },
      { id: 'COMPLETE', label: 'Complete' },
    ],
  },
] as const;

const faultResponses = [
  {
    condition: 'Sensor output missing, stale, or implausible',
    action: 'Disable heating.',
    response: 'Mark the affected interval invalid; require sensor revalidation before resuming.',
  },
  {
    condition: 'Vessel removed, shifted, or touching the heater',
    action: 'Interrupt heating.',
    response: 'Reject readings affected by a changed load path and require operator inspection.',
  },
  {
    condition: 'Load-cell temperature, process temperature, or maximum run time exceeds its limit',
    action: 'Enter independent fault shutdown.',
    response: 'The progress estimate must not override thermal or time limits.',
  },
  {
    condition: 'Observed mass loss exceeds saved reference capacity',
    action: 'Terminate automatic target seeking.',
    response: 'Preserve the measured value and flag the lot-calibration mismatch, or excess beyond predicted CO₂ yield in stoichiometric mode.',
  },
  {
    condition: 'Power or controller connection lost',
    action: 'Default to heater-off.',
    response: 'Do not resume automatically when power or communication returns; require revalidation.',
  },
] as const;

export function ControllerStatesAndFaults() {
  return (
    <div className="research-controller-model">
      <p className="research-controller-model__intro">
        The proposed controller has separate calibration and production sequences.
        An ordinary stop follows the cooling path. Fault detection takes precedence
        over automatic target seeking, commands heater-off, and requires revalidation
        before a new run.
      </p>

      <figure className="research-controller-flow" aria-labelledby="research-controller-flow-title">
        <figcaption id="research-controller-flow-title" className="research-controller-flow__caption">
          <strong>Operating sequences</strong>
          <span>Proposed controller states</span>
        </figcaption>
        {sequences.map(sequence => (
          <div className="research-controller-flow__lane" key={sequence.name}>
            <div className="research-controller-flow__lane-heading">
              <strong>{sequence.name}</strong>
              <span>{sequence.purpose}</span>
            </div>
            <ol className="research-controller-flow__steps" aria-label={`${sequence.name} state sequence`}>
              {sequence.states.map((state, index) => (
                <li className="research-controller-flow__step" key={state.id}>
                  <span className="research-controller-flow__step-top">
                    <span className="research-controller-flow__index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="research-controller-flow__name">{state.label}</span>
                  </span>
                  <code className="research-controller-flow__identifier">{state.id}</code>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </figure>

      <div className="research-controller-model__section-heading">
        <h4 id="research-controller-fault-heading" aria-label="Fault response" className="research-anchor-heading">
          <HeadingTextWithPermalink title="Fault response" targetId="research-controller-fault-heading" />
        </h4>
        <p>Required behavior of the proposed controller</p>
      </div>
      <dl className="research-controller-faults" aria-labelledby="research-controller-fault-heading">
        {faultResponses.map(fault => (
          <div className="research-controller-faults__row" key={fault.condition}>
            <dt>{fault.condition}</dt>
            <dd><strong>{fault.action}</strong> {fault.response}</dd>
          </div>
        ))}
      </dl>

      <div className="research-controller-model__stop">
        <strong>Normal stop</strong>
        <p>
          When the operator requests a stop or the selected apparent target is reached,
          remove or reduce heater power as permitted, preserve the sensor and event
          record, monitor the cooling tail, and report the observed endpoint.
        </p>
      </div>

      <p className="research-controller-model__safety">
        <strong>Independent protection.</strong> Heater shutoff, thermal limiting,
        electrical isolation, and pressure relief must not depend on the mass-loss
        progress estimator.
      </p>
    </div>
  );
}