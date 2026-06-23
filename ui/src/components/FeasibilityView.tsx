import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  FileText,
  Film,
  GitBranch,
  Image as ImageIcon,
  Layers,
  Radar,
  Target,
  TrendingDown,
} from 'lucide-react';
import { RPPG_SINGLE_VIEW_SQI } from '../generated/rppgSingleViewSqi';
import { RPPG_MULTI_VIEW_RGB } from '../generated/rppgMultiViewRgb';
import { RPPG_SINGLE_VIEW_EXPERIMENTS } from '../generated/rppgSingleViewExperiments';
import { RPPG_GT_FREE_FEASIBILITY } from '../generated/rppgGtFreeFeasibility';
import { RPPG_MOTION_BODY_CANDIDATES } from '../generated/rppgMotionBodyCandidates';
import { RPPG_SEGMENTATION_ROI } from '../generated/rppgSegmentationRoi';
import { RPPG_PET_KEYPOINT_READINESS } from '../generated/rppgPetKeypointReadiness';
import { RPPG_DLC_KEYPOINT_ROI_PROBE } from '../generated/rppgDlcKeypointRoiProbe';
import { RPPG_ADAPTIVE_ROI_LATEST } from '../generated/rppgAdaptiveRoiLatest';

const selectorLabels: Record<string, string> = {
  oracle_window_peak: 'Oracle Window Peak',
  oracle_method_region: 'Oracle Method/ROI',
  fixed_chrom_face_full: 'CHROM Full Face',
  fixed_pos_face_full: 'POS Full Face',
  supervised_tracked_ranker_loocv: 'Supervised Tracker',
  supervised_peak_ranker_loocv: 'Supervised Ranker',
  trained_peak_selector_current: 'Trained Selector',
  trained_tracked_selector_current: 'Trained Tracker',
  tracked_sqi: 'SQI Tracker',
  sqi_top_window: 'SQI Per Window',
  train_calibrated_fixed_loocv: 'Fixed LOOCV',
};

const comparisonSelectors = [
  'oracle_window_peak',
  'trained_tracked_selector_current',
  'fixed_chrom_face_full',
  'supervised_tracked_ranker_loocv',
];

function fmt(value: number | string | undefined, digits = 1) {
  if (typeof value === 'number') return value.toFixed(digits);
  if (value === undefined || value === '') return '-';
  return value;
}

function selectorName(selector: string) {
  return selectorLabels[selector] ?? selector.replaceAll('_', ' ');
}

function statusClass(status: string) {
  if (status === 'supportive') return 'text-primary-fixed-dim border-primary-fixed-dim/30 bg-primary-fixed-dim/10';
  if (status === 'weak') return 'text-red-300 border-red-500/30 bg-red-500/10';
  return 'text-secondary border-secondary/30 bg-secondary/10';
}

function labelText(video: (typeof RPPG_SINGLE_VIEW_SQI.videos)[number]) {
  if (!video.usable) return 'No readable monitor';
  return `${fmt(video.bpm_min, 0)}-${fmt(video.bpm_max, 0)} bpm`;
}

export default function FeasibilityView() {
  const data = RPPG_SINGLE_VIEW_SQI;
  const multi = RPPG_MULTI_VIEW_RGB;
  const experiments = RPPG_SINGLE_VIEW_EXPERIMENTS;
  const gtFree = RPPG_GT_FREE_FEASIBILITY;
  const motionBody = RPPG_MOTION_BODY_CANDIDATES;
  const segmentation = RPPG_SEGMENTATION_ROI;
  const keypoints = RPPG_PET_KEYPOINT_READINESS;
  const dlcKeypointProbe = RPPG_DLC_KEYPOINT_ROI_PROBE;
  const adaptiveRoi = RPPG_ADAPTIVE_ROI_LATEST;
  const usableVideos = data.videos.filter(video => video.usable);
  const [selectedVideoName, setSelectedVideoName] = useState(usableVideos[0]?.video ?? data.videos[0]?.video);
  const selectedVideo = data.videos.find(video => video.video === selectedVideoName) ?? data.videos[0];
  const selectedStats = selectedVideo.stats as Record<string, number | string | undefined>;
  const selectedSeries = data.measurementSeries.find(series => series.video === selectedVideo.video) as MeasurementSeries;
  const selectedPredictions = data.selectorPredictions.filter(row => row.video === selectedVideo.video);
  const trainedMeta = data.trainedSelector as {
    training_rows?: number;
    positive_rows?: number;
    positive_rate?: number;
    positive_definition?: string;
    feature_columns?: readonly string[];
    videos?: readonly string[];
    warning?: string;
  };
  const oracle = data.selectorSummary.find(row => row.selector === 'oracle_window_peak') ?? data.selectorSummary[0];
  const trainedCurrent = data.selectorSummary.find(row => row.selector === 'trained_tracked_selector_current') ?? data.selectorSummary[0];
  const loocv = data.selectorSummary.find(row => row.selector === 'supervised_tracked_ranker_loocv') ?? data.selectorSummary[0];
  const motionBodyOracle = motionBody.summary.find(row => row.selector === 'oracle_motion_body_window') ?? motionBody.summary[0];
  const motionBodyBestHeuristic = motionBody.summary.find(row => !row.selector.startsWith('oracle')) ?? motionBody.summary[0];
  const segOracle = segmentation.summary.find(row => row.selector === 'oracle_segmentation_window') ?? segmentation.summary[0];
  const segBestHeuristic = segmentation.summary.find(row => !row.selector.startsWith('oracle')) ?? segmentation.summary[0];
  const maxRangeMae = Math.max(...data.selectorSummary.map(row => row.range_mae), 1);
  const perVideo = useMemo(() => {
    return data.videos.map(video => {
      const rows = data.selectorPredictions.filter(row => row.video === video.video);
      const bySelector = Object.fromEntries(rows.map(row => [row.selector, row]));
      return { video, rows, bySelector };
    });
  }, [data.selectorPredictions, data.videos]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-on-background p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
        <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary-fixed-dim">
                  <Radar className="w-5 h-5" />
                  <span className="font-mono text-xs uppercase tracking-wider">Actual Dataset Front RGB</span>
                </div>
                <h2 className="font-headline text-3xl font-bold mt-2 text-on-surface">
                  rPPG Feasibility Workbench
                </h2>
                <p className="font-mono text-xs text-on-surface-variant/60 uppercase mt-2">
                  {data.setup.labelsCsv} | {data.setup.grid} patches | {data.setup.methods.join(' / ')}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
                <MetricTile icon={Database} label="Videos" value={`${usableVideos.length}/8`} sub="usable" />
                <MetricTile icon={GitBranch} label="Regions" value="29" sub="ROI + patches" />
                <MetricTile icon={Target} label="Oracle" value={fmt(oracle.target_mae)} sub="bpm MAE" accent />
                <MetricTile icon={TrendingDown} label="Trained" value={fmt(trainedCurrent.target_mae)} sub="bpm MAE" accent />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <FindingPanel
                icon={CheckCircle2}
                tone="text-primary-fixed-dim"
                title="Trained selector now follows the HR peak"
                value={`${fmt(trainedCurrent.target_mae)} bpm target MAE`}
                body={`Fitted on the current OCR labels, the trained tracker reaches ${fmt(trainedCurrent.within_range_pct, 0)}% within-range.`}
              />
              <FindingPanel
                icon={AlertTriangle}
                tone="text-secondary"
                title="Generalization gap remains"
                value={`${fmt(loocv.target_mae)} bpm LOOCV MAE`}
                body="The current dataset is too small for unbiased generalization; the fitted selector shows calibration potential, while LOOCV shows data scarcity risk."
              />
            </div>
          </div>

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Selector Ranking</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Actual run output from reports/rppg_single_view_sqi
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="space-y-3">
              {data.selectorSummary.map(row => (
                <div key={row.selector}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-mono text-[11px] text-on-surface uppercase truncate">
                      {selectorName(row.selector)}
                    </span>
                    <span className="font-mono text-xs text-primary-fixed-dim">
                      {fmt(row.range_mae)} bpm
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.selector.startsWith('oracle') ? 'bg-primary-fixed-dim' : 'bg-secondary'}`}
                      style={{ width: `${Math.max(4, 100 - (row.range_mae / maxRangeMae) * 92)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.84fr_1.16fr] gap-4">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Dataset Videos</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Click a real dataset_front recording
                </p>
              </div>
              <Film className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-3">
              {data.videos.map(video => (
                <button
                  key={video.video}
                  onClick={() => setSelectedVideoName(video.video)}
                  className={`text-left border rounded-lg overflow-hidden transition-all ${
                    selectedVideo.video === video.video
                      ? 'border-primary-fixed-dim ring-1 ring-primary-fixed-dim/60 bg-primary-fixed-dim/10'
                      : 'border-white/10 bg-white/5 hover:border-white/25'
                  }`}
                >
                  <div className="aspect-video bg-black relative overflow-hidden">
                    {video.frameUrl ? (
                      <img src={video.frameUrl} alt={`${video.video} preview`} className="w-full h-full object-cover opacity-85" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${
                      video.usable
                        ? 'bg-primary-fixed-dim/15 border-primary-fixed-dim/30 text-primary-fixed-dim'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}>
                      {video.usable ? 'usable' : 'excluded'}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-xs text-on-surface">{video.video}</div>
                    <div className="font-mono text-[10px] text-on-surface-variant/60 mt-1">{labelText(video)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">{selectedVideo.video} Review</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  {selectedVideo.path} | {selectedVideo.label_source}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="Label" value={labelText(selectedVideo)} />
                <StatusPill label="Detect" value={`${fmt(selectedStats.detected_pct, 0)}%`} />
                <StatusPill label="Conf" value={fmt(selectedStats.median_box_conf, 3)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
              <div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                  {selectedVideo.videoUrl ? (
                    <video
                      key={selectedVideo.video}
                      src={selectedVideo.videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-on-surface-variant/50">No video asset</div>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant/70 mt-3 leading-relaxed">
                  {selectedVideo.notes}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <MediaPanel title="OCR Monitor Sheet" src={selectedVideo.monitorSheetUrl} />
                <MediaPanel title="Monitor Crop" src={selectedVideo.monitorCropUrl} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Selected Region Overlay</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Trained selector ROI versus label-leaked oracle ROI
                </p>
              </div>
              <ImageIcon className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="rounded-lg border border-white/10 bg-black overflow-hidden">
              {selectedVideo.regionOverlayUrl ? (
                <img
                  src={selectedVideo.regionOverlayUrl}
                  alt={`${selectedVideo.video} selected region overlay`}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-sm text-on-surface-variant/50">
                  No region overlay for this video
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <StatusPill label="Trained" value={`${selectedVideo.trainedMethod || '-'} / ${selectedVideo.trainedRegion || '-'}`} />
              <StatusPill label="Oracle" value={`${selectedVideo.oracleMethod || '-'} / ${selectedVideo.oracleRegion || '-'}`} />
              <StatusPill label="Frame" value="0.5 sec" />
            </div>
          </div>

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">How The Selector Was Trained</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  RandomForest fitted on current OCR-reviewed videos
                </p>
              </div>
              <GitBranch className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetricTile icon={Database} label="Rows" value={fmt(trainedMeta.training_rows, 0)} sub="candidates" />
              <MetricTile icon={CheckCircle2} label="Positive" value={fmt(trainedMeta.positive_rows, 0)} sub={`${trainedMeta.positive_rate !== undefined ? (trainedMeta.positive_rate * 100).toFixed(1) : '-'}%`} accent />
              <MetricTile icon={BarChart3} label="Features" value={fmt(trainedMeta.feature_columns?.length, 0)} sub="signal + ROI" />
              <MetricTile icon={Film} label="Videos" value={fmt(trainedMeta.videos?.length, 0)} sub="labeled" />
            </div>
            <div className="space-y-3 text-sm text-on-surface-variant/75 leading-relaxed">
              <p>
                Candidate bank: every 20-second window generated peaks from 29 face regions and six RGB rPPG transforms.
              </p>
              <p>
                Positive label: {trainedMeta.positive_definition || 'range error <= 3 bpm OR target error <= 5 bpm'}.
              </p>
              <p>
                Features: peak BPM/rank, SNR, power ratio, entropy, harmonic ratios, valid fraction, face motion, color CV,
                method flags, and ROI/patch position.
              </p>
              <p className="text-secondary">
                Current-label fitted numbers show calibration potential. LOOCV remains the conservative generalization check and is still weak with seven labeled videos.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Measured rPPG Waveform</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Face_full RGB trace transformed into POS / CHROM pulse
                </p>
              </div>
              <Activity className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <WaveformChart series={selectedSeries} />
          </div>

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Window HR Track</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Estimated HR over time with OCR label band
                </p>
              </div>
              <Target className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <HrTrackChart series={selectedSeries} />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Selected Video Predictions</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Ground truth OCR range versus model outputs
                </p>
              </div>
              <Target className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[640px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Selector</th>
                    <th className="py-2 pr-3 text-right">Pred</th>
                    <th className="py-2 pr-3 text-right">Target Err</th>
                    <th className="py-2 pr-3">Method</th>
                    <th className="py-2">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPredictions.map(row => (
                    <tr key={row.selector} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{selectorName(row.selector)}</td>
                      <td className="py-2 pr-3 text-right">
                        <span className={`font-mono text-xs px-2 py-1 rounded border ${
                          row.within_range
                            ? 'text-primary-fixed-dim border-primary-fixed-dim/20 bg-primary-fixed-dim/10'
                            : 'text-on-surface-variant border-white/10 bg-white/5'
                        }`}>
                          {fmt(row.pred_bpm)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.target_abs_error)} bpm</td>
                      <td className="py-2 pr-3 font-mono text-xs text-primary-fixed-dim">{row.selected_method}</td>
                      <td className="py-2 font-mono text-xs text-on-surface-variant">{row.selected_region}</td>
                    </tr>
                  ))}
                  {!selectedPredictions.length && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant/50 text-sm">
                        This video was excluded from the usable OCR-label set.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">All Videos Matrix</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Actual labels and representative selectors
                </p>
              </div>
              <Activity className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[820px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Video</th>
                    <th className="py-2 pr-3">Label</th>
                    {comparisonSelectors.map(selector => (
                      <th key={selector} className="py-2 pr-3 text-right">{selectorName(selector)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {perVideo.map(videoRow => (
                    <tr key={videoRow.video.video} className="border-b border-white/5">
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => setSelectedVideoName(videoRow.video.video)}
                          className="font-mono text-xs text-primary-fixed-dim hover:underline"
                        >
                          {videoRow.video.video}
                        </button>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface-variant">{labelText(videoRow.video)}</td>
                      {comparisonSelectors.map(selector => {
                        const item = videoRow.bySelector[selector];
                        return (
                          <td key={selector} className="py-2 pr-3 text-right">
                            {item ? (
                              <span className={`font-mono text-xs px-2 py-1 rounded border ${
                                item.within_range
                                  ? 'text-primary-fixed-dim border-primary-fixed-dim/20 bg-primary-fixed-dim/10'
                                  : 'text-on-surface-variant border-white/10 bg-white/5'
                              }`}>
                                {fmt(item.pred_bpm)}
                              </span>
                            ) : (
                              <span className="text-on-surface-variant/30">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <ChartPanel title="Selector Ranking Chart" src={data.assets.selectorRankingUrl} />
          <ChartPanel title="Method / Region Ranking Chart" src={data.assets.methodRegionRankingUrl} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <ChartPanel title="Single-View Model Experiments" src={experiments.assets.rankingPlotUrl} />

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Additional Single-View Attempts</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  RF / ExtraTrees / HistGB / regression / harmonic / Kalman SSM
                </p>
              </div>
              <Activity className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetricTile
                icon={Target}
                label="Best Fit"
                value={fmt(experiments.summary[0]?.target_mae)}
                sub="target MAE"
                accent
              />
              <MetricTile
                icon={AlertTriangle}
                label="Best LOOCV"
                value={fmt(experiments.summary.find(row => row.selector.startsWith('loocv_'))?.target_mae)}
                sub="target MAE"
              />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Selector</th>
                    <th className="py-2 pr-3 text-right">Target MAE</th>
                    <th className="py-2 pr-3 text-right">Range MAE</th>
                    <th className="py-2 pr-3 text-right">Within</th>
                    <th className="py-2 text-right">Harmonic</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.summary.slice(0, 32).map(row => (
                    <tr key={row.selector} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{selectorName(row.selector)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.target_mae)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.range_mae)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.within_range_pct, 0)}%</td>
                      <td className="py-2 text-right font-mono text-xs">{fmt(row.median_harmonic_adjusted_pct, 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-secondary mt-3">
              Current-fit rows prove the single-view candidate bank can recover the labels; LOOCV rows show this is not yet a deployable general model.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-4">
          <ChartPanel title="GT-Free Evidence Ranking" src={gtFree.assets.rankingPlotUrl} />

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">GT-Free Feasibility Evidence</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Background control / time shuffle / perturbation / artifact risk
                </p>
              </div>
              <Radar className="w-5 h-5 text-primary-fixed-dim" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              <MetricTile icon={Target} label="Median" value={fmt(gtFree.overview.medianEvidenceScore)} sub="evidence" accent />
              <MetricTile icon={CheckCircle2} label="Supportive" value={`${gtFree.overview.supportive}`} sub="videos" />
              <MetricTile icon={AlertTriangle} label="Inconclusive" value={`${gtFree.overview.inconclusive}`} sub="videos" />
              <MetricTile icon={GitBranch} label="Multi-View" value={`${fmt(gtFree.overview.multiViewAgreementPct, 0)}%`} sub="agreement" accent />
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Video</th>
                    <th className="py-2 pr-3 text-right">Score</th>
                    <th className="py-2 pr-3 text-right">BG Ratio</th>
                    <th className="py-2 pr-3 text-right">Shuffle</th>
                    <th className="py-2 pr-3 text-right">Perturb</th>
                    <th className="py-2 pr-3 text-right">100 bpm</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {gtFree.singleSummary.map(row => (
                    <tr key={row.video} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{row.video}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.evidence_score)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.median_background_snr_ratio, 2)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.shuffle_drop_score, 2)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.perturbation_stability_score, 2)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.artifact_100bpm_window_share * 100, 0)}%</td>
                      <td className="py-2 pr-3">
                        <span className={`inline-flex rounded border px-2 py-1 font-mono text-[10px] uppercase ${statusClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-on-surface-variant">{row.rejection_reasons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-secondary mt-3">
              Current GT-free evidence is inconclusive: the signal is stable, but many windows collapse near 100 bpm or compete with background peaks.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <ChartPanel title="GT-Free Multi-View Agreement" src={gtFree.assets.multiAgreementPlotUrl} />

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Outlier-Rejected View Agreement</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Consensus threshold {fmt(gtFree.setup.agreementBpm, 0)} bpm
                </p>
              </div>
              <GitBranch className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetricTile
                icon={Layers}
                label="Agreement"
                value={`${fmt(gtFree.multiSummary.agreement_pct, 0)}%`}
                sub={`${gtFree.multiSummary.agreement_windows}/${gtFree.multiSummary.windows_with_two_or_more_views} windows`}
                accent
              />
              <MetricTile
                icon={TrendingDown}
                label="Spread"
                value={fmt(gtFree.multiSummary.median_accepted_spread_bpm)}
                sub="accepted bpm"
              />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Start</th>
                    <th className="py-2 pr-3 text-right">Consensus</th>
                    <th className="py-2 pr-3 text-right">Raw Spread</th>
                    <th className="py-2 pr-3 text-right">Accepted</th>
                    <th className="py-2 pr-3">Rejected</th>
                    <th className="py-2">Raw Values</th>
                  </tr>
                </thead>
                <tbody>
                  {gtFree.multiAgreement.map(row => (
                    <tr key={row.window_index} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{fmt(row.window_start_sec, 0)}s</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.consensus_bpm)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.raw_spread_bpm)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{row.accepted_view_count}/{row.raw_view_count}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-secondary">{row.rejected_views}</td>
                      <td className="py-2 font-mono text-xs text-on-surface-variant">{row.raw_values}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <ChartPanel title="Motion / Body ROI Selector Summary" src={motionBody.assets.selectorPlotUrl} />

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Motion / Body ROI Attempts</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Face + neck/chest/body proxy ROI with background and motion residualization
                </p>
              </div>
              <Activity className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              <MetricTile
                icon={Target}
                label="Oracle"
                value={fmt(motionBodyOracle.range_mae)}
                sub="range MAE"
                accent
              />
              <MetricTile
                icon={TrendingDown}
                label="Best Heuristic"
                value={fmt(motionBodyBestHeuristic.range_mae)}
                sub="range MAE"
              />
              <MetricTile
                icon={Layers}
                label="Keypoint"
                value={`${fmt(motionBodyBestHeuristic.keypoint_window_share, 0)}%`}
                sub="selected"
              />
              <MetricTile
                icon={GitBranch}
                label="Stable"
                value={`${fmt(motionBodyBestHeuristic.stable_window_share, 0)}%`}
                sub="state"
              />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[840px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Selector</th>
                    <th className="py-2 pr-3 text-right">Target MAE</th>
                    <th className="py-2 pr-3 text-right">Range MAE</th>
                    <th className="py-2 pr-3 text-right">Within</th>
                    <th className="py-2 pr-3 text-right">Body</th>
                    <th className="py-2 pr-3 text-right">Keypoint</th>
                    <th className="py-2 pr-3 text-right">Residual</th>
                    <th className="py-2 pr-3 text-right">Stable</th>
                    <th className="py-2 text-right">100 bpm</th>
                  </tr>
                </thead>
                <tbody>
                  {motionBody.summary.map(row => (
                    <tr key={row.selector} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{selectorName(row.selector)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.target_mae)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.range_mae)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.within_range_pct, 0)}%</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.body_window_share, 0)}%</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.keypoint_window_share, 0)}%</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.residual_window_share, 0)}%</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.stable_window_share, 0)}%</td>
                      <td className="py-2 text-right font-mono text-xs">{fmt(row.artifact_100bpm_window_share, 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-secondary mt-3">
              Pseudo keypoint ROIs and pet artifact states expose the failure mode: artifact filtering removes many 100 bpm picks, but the selector still moves to other low-HR artifacts instead of the true HR peak.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <ChartPanel title="YOLO Animal Segmentation ROI" src={segmentation.assets.selectorPlotUrl} />

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Real Animal Mask ROI</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  YOLO-seg dog/cat mask only, excluding table/background pixels
                </p>
              </div>
              <ImageIcon className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              <MetricTile icon={Target} label="Oracle" value={fmt(segOracle.range_mae)} sub="range MAE" accent />
              <MetricTile icon={TrendingDown} label="Best Heuristic" value={fmt(segBestHeuristic.range_mae)} sub="range MAE" />
              <MetricTile icon={CheckCircle2} label="Mask Detect" value={`${fmt(segmentation.stats.reduce((sum, row) => sum + row.mask_detected_pct, 0) / Math.max(segmentation.stats.length, 1), 0)}%`} sub="avg" accent />
              <MetricTile icon={Layers} label="Body ROI" value={`${fmt(segBestHeuristic.body_window_share, 0)}%`} sub="selected" />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[820px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Selector</th>
                    <th className="py-2 pr-3 text-right">Target MAE</th>
                    <th className="py-2 pr-3 text-right">Range MAE</th>
                    <th className="py-2 pr-3 text-right">Within</th>
                    <th className="py-2 pr-3 text-right">Body</th>
                    <th className="py-2 pr-3 text-right">Stable</th>
                    <th className="py-2 text-right">100 bpm</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentation.summary.map(row => (
                    <tr key={row.selector} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{selectorName(row.selector)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.target_mae)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.range_mae)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.within_range_pct, 0)}%</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.body_window_share, 0)}%</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.stable_window_share, 0)}%</td>
                      <td className="py-2 text-right font-mono text-xs">{fmt(row.artifact_100bpm_window_share, 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-secondary mt-3">
              Segmentation fixes the ROI contamination problem, but it does not solve correct HR peak selection without synchronized GT or stronger pet keypoints.
            </p>
          </div>
        </section>

        <section className="glass-panel border border-outline-variant/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline text-xl font-semibold">Latest Adaptive ROI Selection</h3>
              <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                {adaptiveRoi.overview.keypointModel} | selector threshold {adaptiveRoi.overview.selectorThreshold}
              </p>
            </div>
            <GitBranch className="w-5 h-5 text-primary-fixed-dim" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Videos</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{adaptiveRoi.evaluation.videos}</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">current best config</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Mean MAE</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{fmt(adaptiveRoi.evaluation.meanAbsError)} bpm</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">median {fmt(adaptiveRoi.evaluation.medianAbsError)} bpm</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">High-HR Recovery</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{adaptiveRoi.evaluation.highHrRecovery}</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">videos 3 and 7</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Smart v2 MAE</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{fmt(adaptiveRoi.evaluation.meanSmartV2Error)} bpm</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">post selector sweep</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {adaptiveRoi.overview.pipelineSteps.map(step => (
              <span key={step} className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase text-on-surface-variant/70">
                {step}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4 mb-4">
            <div className="border border-white/10 bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-headline text-base font-semibold">Per-Zone ROI Decisions</h4>
                  <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">{adaptiveRoi.overview.selectorFormula}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary-fixed-dim" />
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                      <th className="py-2 pr-3">Video</th>
                      <th className="py-2 pr-3">Zone</th>
                      <th className="py-2 pr-3">Chosen ROI</th>
                      <th className="py-2 pr-3 text-right">Q</th>
                      <th className="py-2 pr-3 text-right">BPM</th>
                      <th className="py-2 text-right">SNR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adaptiveRoi.roiSelection.videos.flatMap(video =>
                      video.decisions.map(decision => (
                        <tr key={`${video.video}-${decision.zone}`} className="border-b border-white/5">
                          <td className="py-2 pr-3 font-mono text-xs text-on-surface">{video.video}</td>
                          <td className="py-2 pr-3 text-xs text-on-surface-variant">{decision.label}</td>
                          <td className="py-2 pr-3 text-xs">
                            <span className={`mr-2 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                              decision.chosenFamily === 'multi'
                                ? 'border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim'
                                : 'border-secondary/30 bg-secondary/10 text-secondary'
                            }`}>
                              {decision.chosenFamily}
                            </span>
                            <span className="font-mono text-[11px] text-on-surface">{decision.chosenName}</span>
                          </td>
                          <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(decision.chosenQuality)}</td>
                          <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(decision.chosenBpm)} bpm</td>
                          <td className="py-2 text-right font-mono text-xs">{fmt(decision.chosenSnr)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-white/10 bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-headline text-base font-semibold">Full Evaluation</h4>
                  <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">{adaptiveRoi.overview.status}</p>
                </div>
                <BarChart3 className="w-4 h-4 text-primary-fixed-dim" />
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                      <th className="py-2 pr-3">Video</th>
                      <th className="py-2 pr-3 text-right">Target</th>
                      <th className="py-2 pr-3 text-right">Pred</th>
                      <th className="py-2 pr-3 text-right">Err.</th>
                      <th className="py-2 text-right">Kept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adaptiveRoi.evaluation.rows.map(row => (
                      <tr key={row.video} className="border-b border-white/5">
                        <td className="py-2 pr-3 font-mono text-xs text-on-surface">{row.video}.mp4</td>
                        <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.target_bpm)} bpm</td>
                        <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.best_relaxed_bpm)} bpm</td>
                        <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.abs_error)} bpm</td>
                        <td className="py-2 text-right font-mono text-xs">{fmt(row.kept_pct, 0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            {adaptiveRoi.roiSelection.videos.filter(video => video.gallery.chosenRoisUrl).map(video => (
              <div key={video.video} className="border border-white/10 bg-white/5 rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-on-surface">{video.video} / {video.gallery.frame}</p>
                    <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">target {fmt(video.targetBpm)} bpm</p>
                  </div>
                  <ImageIcon className="w-4 h-4 text-primary-fixed-dim" />
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/10">
                  <div className="bg-surface/80">
                    <img src={video.gallery.keypointsUrl} alt={`${video.video} keypoints`} className="aspect-[4/3] w-full object-cover" />
                    <p className="font-mono text-[9px] uppercase text-center py-1 text-on-surface-variant/60">keypoints</p>
                  </div>
                  <div className="bg-surface/80">
                    <img src={video.gallery.allRoisUrl} alt={`${video.video} candidate ROIs`} className="aspect-[4/3] w-full object-cover" />
                    <p className="font-mono text-[9px] uppercase text-center py-1 text-on-surface-variant/60">candidates</p>
                  </div>
                  <div className="bg-surface/80">
                    <img src={video.gallery.chosenRoisUrl} alt={`${video.video} chosen ROIs`} className="aspect-[4/3] w-full object-cover" />
                    <p className="font-mono text-[9px] uppercase text-center py-1 text-on-surface-variant/60">chosen</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={adaptiveRoi.assets.reportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <FileText className="w-3.5 h-3.5" /> latest report
            </a>
            <a href={adaptiveRoi.assets.deploymentGuideUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <FileText className="w-3.5 h-3.5" /> deployment guide
            </a>
            <a href={adaptiveRoi.assets.dualCandidatesCsvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <Database className="w-3.5 h-3.5" /> dual candidates
            </a>
          </div>
        </section>

        <section className="glass-panel border border-outline-variant/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline text-xl font-semibold">Pet Keypoint Provider Readiness</h3>
              <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                Python {keypoints.pythonVersion} | DLC probe {keypoints.probe.status} | rows {keypoints.normalized.rows}
              </p>
            </div>
            <Target className="w-5 h-5 text-primary-fixed-dim" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Probe Frames</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{keypoints.probe.framesWritten ?? 0}</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">{keypoints.probe.clipFps ?? 0} fps</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Keypoints</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{keypoints.normalized.keypoints.length}</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">{keypoints.normalized.videos} video</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Median Conf.</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">
                {keypoints.normalized.medianConfidence ?? 'n/a'}
              </p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">{keypoints.normalized.highConfidenceRows} rows &gt;= 0.5</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Probe Size</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">
                {keypoints.probe.clipSize ? keypoints.probe.clipSize.join('x') : 'n/a'}
              </p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">CPU sanity run</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
            {keypoints.providers.map(provider => (
              <div key={provider.provider} className="border border-white/10 bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-on-surface uppercase">{provider.provider}</span>
                  <span className={`rounded border px-2 py-1 font-mono text-[9px] uppercase ${
                    provider.installed
                      ? 'border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim'
                      : 'border-secondary/30 bg-secondary/10 text-secondary'
                  }`}>
                    {provider.installed ? 'ready' : 'missing'}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase mt-2">{provider.role}</p>
                <p className="font-mono text-[9px] text-on-surface-variant/45 uppercase mt-1">{provider.runtime}</p>
                <p className="text-xs text-on-surface-variant/65 mt-2 leading-relaxed">{provider.note}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <a href={keypoints.assets.reportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <FileText className="w-3.5 h-3.5" /> report
            </a>
            <a href={keypoints.assets.normalizedCsvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <Database className="w-3.5 h-3.5" /> normalized CSV
            </a>
            {keypoints.assets.probeManifestUrl && (
              <a href={keypoints.assets.probeManifestUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
                <FileText className="w-3.5 h-3.5" /> probe manifest
              </a>
            )}
          </div>
          <p className="text-xs text-secondary leading-relaxed">{keypoints.nextStep}</p>
        </section>

        <section className="glass-panel border border-outline-variant/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline text-xl font-semibold">DLC Keypoint ROI rPPG Probe</h3>
              <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                {dlcKeypointProbe.video} | {dlcKeypointProbe.frames} frames @ {dlcKeypointProbe.fps} fps | target {fmt(dlcKeypointProbe.target.bpm_min, 0)}-{fmt(dlcKeypointProbe.target.bpm_max, 0)} bpm
              </p>
            </div>
            <Activity className="w-5 h-5 text-primary-fixed-dim" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="border border-primary-fixed-dim/25 bg-primary-fixed-dim/10 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/60">Best anatomical ROI</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{dlcKeypointProbe.best.label} / {dlcKeypointProbe.best.method}</p>
              <p className="font-mono text-[10px] text-on-surface-variant/70 mt-1">
                {fmt(dlcKeypointProbe.best.peak_bpm)} bpm, error {fmt(dlcKeypointProbe.best.target_abs_error)} bpm
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Validity</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">{fmt(dlcKeypointProbe.best.valid_fraction * 100, 0)}%</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">{dlcKeypointProbe.best.valid_frames} valid frames</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase text-on-surface-variant/50">Signal Quality</p>
              <p className="font-mono text-lg text-primary-fixed-dim mt-1">SNR {fmt(dlcKeypointProbe.best.snr)}</p>
              <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">mask + keypoint ROI</p>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar mb-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                  <th className="py-2 pr-3">ROI</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3 text-right">Peak</th>
                  <th className="py-2 pr-3 text-right">Range Err.</th>
                  <th className="py-2 pr-3 text-right">SNR</th>
                  <th className="py-2 text-right">Frames</th>
                </tr>
              </thead>
              <tbody>
                {dlcKeypointProbe.summary.slice(0, 10).map(row => (
                  <tr key={`${row.roi}-${row.method}`} className="border-b border-white/5">
                    <td className="py-2 pr-3 text-xs text-on-surface">
                      {row.label}
                      <span className={`ml-2 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                        row.within_range
                          ? 'border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim'
                          : 'border-secondary/30 bg-secondary/10 text-secondary'
                      }`}>
                        {row.kind}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-primary-fixed-dim">{row.method}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.peak_bpm)} bpm</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.range_error)} bpm</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.snr)}</td>
                    <td className="py-2 text-right font-mono text-xs">{row.valid_frames}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <a href={dlcKeypointProbe.assets.reportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <FileText className="w-3.5 h-3.5" /> ROI report
            </a>
            <a href={dlcKeypointProbe.assets.summaryCsvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface">
              <Database className="w-3.5 h-3.5" /> summary CSV
            </a>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            This is the first actual pet-specific ROI signal: DeepLabCut quadruped keypoints define anatomical centers, YOLO mask clips the ROI to animal pixels, and POS on the neck lands inside the OCR HR range for this 30-second probe.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Top Method / Region</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Fixed candidate performance across all usable videos
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Method</th>
                    <th className="py-2 pr-3">Region</th>
                    <th className="py-2 pr-3 text-right">Range MAE</th>
                    <th className="py-2 text-right">Within</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topMethodRegions.slice(0, 10).map(row => (
                    <tr key={`${row.method}-${row.region_id}`} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-primary-fixed-dim">{row.method}</td>
                      <td className="py-2 pr-3 text-xs text-on-surface">{row.region_label}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.range_mae)} bpm</td>
                      <td className="py-2 text-right font-mono text-xs">{fmt(row.within_range_pct, 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Multi-View RGB Evaluation</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Unlabeled consistency check using the trained single-view selector
                </p>
              </div>
              <Layers className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {multi.views.map(asset => (
                <div key={asset.id} className="border border-white/10 bg-white/5 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-black">
                    {asset.regionOverlayUrl ? (
                      <img src={asset.regionOverlayUrl} alt={`${asset.label} selected region`} className="w-full h-full object-contain" />
                    ) : (
                      <video src={asset.videoUrl} className="w-full h-full object-contain" controls preload="metadata" />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs text-on-surface uppercase">{asset.label}</p>
                      <span className="font-mono text-xs text-primary-fixed-dim">{fmt(asset.pred_bpm)} bpm</span>
                    </div>
                    <p className="font-mono text-[10px] text-on-surface-variant/60 mt-1">
                      {asset.top_method} / {asset.top_region}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <StatusPill label="Detect" value={`${fmt(asset.detected_pct, 0)}%`} />
                      <StatusPill label="Score" value={fmt(asset.median_selector_score, 2)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
          <ChartPanel title="Multi-View HR Track" src={multi.assets.trackPlotUrl} />

          <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline text-xl font-semibold">Fusion Windows</h3>
                <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">
                  Weighted median over available views
                </p>
              </div>
              <GitBranch className="w-5 h-5 text-primary-fixed-dim" />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[620px] text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-on-surface-variant/50 border-b border-white/10">
                    <th className="py-2 pr-3">Start</th>
                    <th className="py-2 pr-3 text-right">Fused</th>
                    <th className="py-2 pr-3 text-right">Spread</th>
                    <th className="py-2 pr-3 text-right">Views</th>
                    <th className="py-2">Included</th>
                  </tr>
                </thead>
                <tbody>
                  {multi.fusion.map(row => (
                    <tr key={row.window_index} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-on-surface">{fmt(row.window_start_sec, 0)}s</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-primary-fixed-dim">{fmt(row.fused_bpm)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{fmt(row.view_spread_bpm)} bpm</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{row.view_count}</td>
                      <td className="py-2 font-mono text-xs text-on-surface-variant">{row.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-secondary mt-3">
              Multi-view rows do not have synchronized ground truth labels; use spread and stability before treating a fused BPM as performance.
            </p>
          </div>
        </section>

        <section className="glass-panel border border-outline-variant/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary-fixed-dim" />
            <h3 className="font-headline text-lg font-semibold">Generated Artifacts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <ArtifactLink href={data.assets.reportUrl} label="Markdown report" />
            <ArtifactLink href={data.assets.selectorPredictionsCsvUrl} label="Selector predictions CSV" />
            <ArtifactLink href={data.assets.candidateWindowPeaksCsvUrl} label="Candidate peaks CSV" />
            <ArtifactLink href={data.assets.trainedSelectorMetadataUrl} label="Trained selector metadata" />
            <ArtifactLink href={data.assets.trainedSelectorModelUrl} label="Trained selector model" />
            <ArtifactLink href={experiments.assets.reportUrl} label="Single-view experiments report" />
            <ArtifactLink href={experiments.assets.summaryCsvUrl} label="Single-view experiments CSV" />
            <ArtifactLink href={gtFree.assets.reportUrl} label="GT-free feasibility report" />
            <ArtifactLink href={gtFree.assets.singleSummaryCsvUrl} label="GT-free single-view CSV" />
            <ArtifactLink href={gtFree.assets.multiAgreementCsvUrl} label="GT-free multi-view CSV" />
            <ArtifactLink href={motionBody.assets.reportUrl} label="Motion/body report" />
            <ArtifactLink href={motionBody.assets.summaryCsvUrl} label="Motion/body summary CSV" />
            <ArtifactLink href={motionBody.assets.candidatesCsvUrl} label="Motion/body candidates CSV" />
            <ArtifactLink href={segmentation.assets.reportUrl} label="Segmentation ROI report" />
            <ArtifactLink href={segmentation.assets.summaryCsvUrl} label="Segmentation summary CSV" />
            <ArtifactLink href={segmentation.assets.candidatesCsvUrl} label="Segmentation candidates CSV" />
            <ArtifactLink href={keypoints.assets.reportUrl} label="Pet keypoint readiness" />
            <ArtifactLink href={keypoints.assets.schemaUrl} label="Pet keypoint schema" />
            <ArtifactLink href={keypoints.assets.exampleCsvUrl} label="Pet keypoint example CSV" />
            <ArtifactLink href={multi.assets.reportUrl} label="Multi-view report" />
            <ArtifactLink href={multi.assets.summaryCsvUrl} label="Multi-view summary CSV" />
            <ArtifactLink href={multi.assets.fusionCsvUrl} label="Multi-view fusion CSV" />
          </div>
        </section>
      </div>
    </div>
  );
}

interface MetricTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}

function MetricTile({ icon: Icon, label, value, sub, accent = false }: MetricTileProps) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-lg p-3 min-w-[110px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-on-surface-variant/50 uppercase">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${accent ? 'text-primary-fixed-dim' : 'text-on-surface-variant/60'}`} />
      </div>
      <div className={`font-mono text-2xl font-bold mt-1 ${accent ? 'text-primary-fixed-dim' : 'text-on-surface'}`}>
        {value}
      </div>
      <div className="font-mono text-[9px] text-on-surface-variant/50 uppercase">{sub}</div>
    </div>
  );
}

interface FindingPanelProps {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  title: string;
  value: string;
  body: string;
}

function FindingPanel({ icon: Icon, tone, title, value, body }: FindingPanelProps) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${tone}`} />
        <span className="font-mono text-xs uppercase text-on-surface">{title}</span>
      </div>
      <p className={`font-headline text-2xl font-bold mt-3 ${tone}`}>{value}</p>
      <p className="text-xs text-on-surface-variant/65 mt-1">{body}</p>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/5 px-3 py-1.5">
      <span className="font-mono text-[9px] text-on-surface-variant/50 uppercase mr-2">{label}</span>
      <span className="font-mono text-xs text-on-surface">{value}</span>
    </div>
  );
}

function MediaPanel({ title, src }: { title: string; src: string }) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <ImageIcon className="w-3.5 h-3.5 text-primary-fixed-dim" />
        <span className="font-mono text-[10px] uppercase text-on-surface-variant">{title}</span>
      </div>
      <div className="aspect-video bg-black">
        {src ? (
          <img src={src} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-on-surface-variant/45">No asset</div>
        )}
      </div>
    </div>
  );
}

type WavePoint = {
  t: number;
  r: number;
  g: number;
  b: number;
  pos: number;
  chrom: number;
};

type HrPoint = {
  t: number;
  bpm: number;
};

type MeasurementSeries = {
  video: string;
  durationSec: number;
  label: {
    bpm_min: number | string;
    bpm_max: number | string;
    bpm_target: number | string;
  };
  waveform: readonly WavePoint[];
  hrTracks: {
    pos_face_full: readonly HrPoint[];
    chrom_face_full: readonly HrPoint[];
    sqi_top_window: readonly HrPoint[];
    trained_peak_selector_current: readonly HrPoint[];
    oracle_window_peak: readonly HrPoint[];
  };
} | undefined;

function linePath<T>(
  points: readonly T[],
  x: (point: T) => number,
  y: (point: T) => number,
  width = 1000,
  height = 220,
  pad = 24,
) {
  if (!points.length) return '';
  const coords = points
    .map(point => {
      const px = Math.min(width - pad, Math.max(pad, x(point)));
      const py = Math.min(height - pad, Math.max(pad, y(point)));
      return `${px.toFixed(2)},${py.toFixed(2)}`;
    })
    .join(' L ');
  return `M ${coords}`;
}

function WaveformChart({ series }: { series: MeasurementSeries }) {
  if (!series || !series.waveform.length) {
    return <EmptyChart label="No waveform data for this video" />;
  }
  const duration = Math.max(series.durationSec, series.waveform[series.waveform.length - 1]?.t ?? 1, 1);
  const width = 1000;
  const height = 240;
  const x = (point: WavePoint) => (point.t / duration) * width;
  const pulseY = (value: number) => height / 2 - value * 55;
  const rgbY = (value: number) => height / 2 - value * 28;

  return (
    <div className="rounded-lg border border-white/10 bg-black/50 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]" preserveAspectRatio="none">
        <rect width={width} height={height} fill="rgba(0,0,0,0.15)" />
        {[0.25, 0.5, 0.75].map(ratio => (
          <line key={ratio} x1="0" x2={width} y1={height * ratio} y2={height * ratio} stroke="rgba(255,255,255,0.08)" strokeDasharray="6 8" />
        ))}
        <path d={linePath(series.waveform, x, point => rgbY(point.r), width, height)} fill="none" stroke="rgba(255,90,90,0.45)" strokeWidth="1.2" />
        <path d={linePath(series.waveform, x, point => rgbY(point.g), width, height)} fill="none" stroke="rgba(0,230,57,0.35)" strokeWidth="1.2" />
        <path d={linePath(series.waveform, x, point => rgbY(point.b), width, height)} fill="none" stroke="rgba(70,150,255,0.45)" strokeWidth="1.2" />
        <path d={linePath(series.waveform, x, point => pulseY(point.chrom), width, height)} fill="none" stroke="#00daf3" strokeWidth="2.1" />
        <path d={linePath(series.waveform, x, point => pulseY(point.pos), width, height)} fill="none" stroke="#00e639" strokeWidth="2.4" />
      </svg>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-white/10 font-mono text-[10px] uppercase text-on-surface-variant">
        <Legend color="#00e639" label="POS pulse" />
        <Legend color="#00daf3" label="CHROM pulse" />
        <Legend color="rgba(255,90,90,0.75)" label="R trace" />
        <Legend color="rgba(0,230,57,0.65)" label="G trace" />
        <Legend color="rgba(70,150,255,0.75)" label="B trace" />
      </div>
    </div>
  );
}

function HrTrackChart({ series }: { series: MeasurementSeries }) {
  if (!series) {
    return <EmptyChart label="No HR track for this video" />;
  }
  const tracks: Array<{ id: string; label: string; color: string; points: readonly HrPoint[] }> = [
    { id: 'oracle_window_peak', label: 'Oracle peak', color: '#00e639', points: series.hrTracks.oracle_window_peak },
    { id: 'trained_peak_selector_current', label: 'Trained selector', color: '#ff4fd8', points: series.hrTracks.trained_peak_selector_current },
    { id: 'chrom_face_full', label: 'CHROM face', color: '#00daf3', points: series.hrTracks.chrom_face_full },
    { id: 'pos_face_full', label: 'POS face', color: '#ffbc7c', points: series.hrTracks.pos_face_full },
    { id: 'sqi_top_window', label: 'SQI top', color: '#ffffff', points: series.hrTracks.sqi_top_window },
  ];
  const allPoints = tracks.flatMap(track => track.points);
  if (!allPoints.length) {
    return <EmptyChart label="No HR track for this video" />;
  }

  const width = 1000;
  const height = 240;
  const pad = 30;
  const duration = Math.max(series.durationSec, ...allPoints.map(point => point.t), 1);
  const bpmValues = allPoints.map(point => point.bpm);
  const labelMin = typeof series.label.bpm_min === 'number' ? series.label.bpm_min : Math.min(...bpmValues);
  const labelMax = typeof series.label.bpm_max === 'number' ? series.label.bpm_max : Math.max(...bpmValues);
  const minBpm = Math.max(40, Math.min(80, labelMin - 25, ...bpmValues) - 5);
  const maxBpm = Math.min(260, Math.max(180, labelMax + 25, ...bpmValues) + 5);
  const x = (point: HrPoint) => pad + (point.t / duration) * (width - pad * 2);
  const yForBpm = (bpm: number) => pad + (maxBpm - bpm) / (maxBpm - minBpm || 1) * (height - pad * 2);
  const labelY1 = yForBpm(labelMax);
  const labelY2 = yForBpm(labelMin);

  return (
    <div className="rounded-lg border border-white/10 bg-black/50 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]" preserveAspectRatio="none">
        <rect width={width} height={height} fill="rgba(0,0,0,0.15)" />
        <rect x={pad} y={labelY1} width={width - pad * 2} height={Math.max(2, labelY2 - labelY1)} fill="rgba(0,230,57,0.11)" stroke="rgba(0,230,57,0.35)" />
        {[minBpm, (minBpm + maxBpm) / 2, maxBpm].map(value => (
          <g key={value}>
            <line x1={pad} x2={width - pad} y1={yForBpm(value)} y2={yForBpm(value)} stroke="rgba(255,255,255,0.09)" strokeDasharray="6 8" />
            <text x={8} y={yForBpm(value) + 4} fill="rgba(255,255,255,0.45)" fontSize="18" fontFamily="monospace">{Math.round(value)}</text>
          </g>
        ))}
        {tracks.map(track => (
          <path
            key={track.id}
            d={linePath(track.points, x, point => yForBpm(point.bpm), width, height, pad)}
            fill="none"
            stroke={track.color}
            strokeWidth={track.id === 'oracle_window_peak' || track.id === 'trained_peak_selector_current' ? 2.6 : 1.9}
            opacity={track.id === 'sqi_top_window' ? 0.55 : 0.95}
          />
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-white/10 font-mono text-[10px] uppercase text-on-surface-variant">
        <Legend color="rgba(0,230,57,0.5)" label={`OCR label ${fmt(series.label.bpm_min, 0)}-${fmt(series.label.bpm_max, 0)} bpm`} />
        {tracks.map(track => (
          <React.Fragment key={track.id}>
            <Legend color={track.color} label={track.label} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-1 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[260px] rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-sm text-on-surface-variant/50">
      {label}
    </div>
  );
}

function ChartPanel({ title, src }: { title: string; src: string }) {
  return (
    <div className="glass-panel border border-outline-variant/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary-fixed-dim" />
        <h3 className="font-headline text-lg font-semibold">{title}</h3>
      </div>
      <div className="bg-white rounded-lg overflow-hidden border border-white/10">
        <img src={src} alt={title} className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}

function ArtifactLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-on-surface hover:border-primary-fixed-dim/40 hover:text-primary-fixed-dim"
    >
      <FileText className="w-3.5 h-3.5" />
      {label}
    </a>
  );
}
