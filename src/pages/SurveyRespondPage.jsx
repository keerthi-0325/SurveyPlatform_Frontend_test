import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { surveysApi, responsesApi } from '../services/api';
import { Spinner } from '../components/ui';

// ─── Session persistence ──────────────────────────────────────────────────────
const DRAFT_KEY  = (id) => `survey_draft_${id}`;
const saveDraft  = (id, data) => { try { sessionStorage.setItem(DRAFT_KEY(id), JSON.stringify(data)); } catch {} };
const loadDraft  = (id) => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY(id))) || {}; } catch { return {}; } };
const clearDraft = (id) => { try { sessionStorage.removeItem(DRAFT_KEY(id)); } catch {} };

// ─── Anonymous session ID (stable per browser tab) ────────────────────────────
const getSessionId = (surveyId) => {
  const key = `session_${surveyId}`;
  let sid = sessionStorage.getItem(key);
  if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem(key, sid); }
  return sid;
};

// ─── Question field renderer ──────────────────────────────────────────────────
function QuestionField({ question, register, errors }) {
  const { question_id, question_text, question_type, is_required, Options } = question;
  const rules  = is_required ? { required: 'This field is required' } : {};
  const errMsg = errors?.answers?.[question_id];
  const firstErr = errMsg
    ? (errMsg.value_text?.message || errMsg.value_number?.message || errMsg.selected_option_id?.message || errMsg.message)
    : null;

  return (
    <div className="card">
      <p className="font-medium text-gray-900 mb-3">
        {question_text}
        {is_required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {question_type === 'text' && (
        <textarea className="input resize-none" rows={3} placeholder="Your answer…"
          {...register(`answers.${question_id}.value_text`, rules)} />
      )}
      {question_type === 'rating' && (
        <div className="flex gap-3 flex-wrap">
          {[1,2,3,4,5].map((n) => (
            <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
              <input type="radio" value={n} className="sr-only peer"
                {...register(`answers.${question_id}.value_number`, rules)} />
              <span className="w-11 h-11 rounded-full border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white flex items-center justify-center text-sm font-semibold text-gray-600 transition-all hover:border-indigo-400">{n}</span>
            </label>
          ))}
        </div>
      )}
      {question_type === 'scale' && (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" value={n} className="sr-only peer"
                {...register(`answers.${question_id}.value_number`, rules)} />
              <span className="w-9 h-9 rounded-lg border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white flex items-center justify-center text-sm font-semibold text-gray-600 transition-all">{n}</span>
            </label>
          ))}
        </div>
      )}
      {question_type === 'yes_no' && (
        <div className="flex gap-4">
          {['Yes','No'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={opt} {...register(`answers.${question_id}.value_text`, rules)} />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}
      {question_type === 'mcq' && Options?.map((opt) => (
        <label key={opt.option_id} className="flex items-center gap-3 mb-2 cursor-pointer group">
          <input type="radio" value={opt.option_id} {...register(`answers.${question_id}.selected_option_id`, rules)} />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.option_text}</span>
        </label>
      ))}
      {question_type === 'checkbox' && Options?.map((opt) => (
        <label key={opt.option_id} className="flex items-center gap-3 mb-2 cursor-pointer group">
          <input type="checkbox"
            value={opt.option_text}
            {...register(`answers.${question_id}.value_json`)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.option_text}</span>
        </label>
      ))}
      {question_type === 'dropdown' && (
        <select className="input" {...register(`answers.${question_id}.selected_option_id`, rules)}>
          <option value="">Select an option…</option>
          {Options?.map((opt) => (
            <option key={opt.option_id} value={opt.option_id}>{opt.option_text}</option>
          ))}
        </select>
      )}
      {question_type === 'date' && (
        <input type="date" className="input" {...register(`answers.${question_id}.value_text`, rules)} />
      )}

      {firstErr && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <AlertCircle size={12} />{firstErr}
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SurveyRespondPage() {
  const { surveyId }     = useParams();
  const [searchParams]   = useSearchParams();
  const channel          = searchParams.get('ch') || 'link'; // set by distribution links
  const startedAtRef     = useRef(new Date().toISOString());
  const sessionId        = getSessionId(surveyId);

  const [submitted, setSubmitted]     = useState(false);
  const [responseId, setResponseId]   = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['surveys','public', surveyId],
    queryFn:  () => surveysApi.getPublic(surveyId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: loadDraft(surveyId),
  });

  // Auto-save draft on change
  const watchAll = watch();
  useEffect(() => {
    if (!submitted) saveDraft(surveyId, watchAll);
  }, [JSON.stringify(watchAll), submitted, surveyId]);

  // ── Drop-off tracking: fire when user scrolls to each question ──────────────
  const questions = survey?.SurveyVersions?.find((v) => v.is_active)?.Questions
    ?.slice().sort((a, b) => a.order_index - b.order_index) ?? [];

  useEffect(() => {
    if (!questions.length) return;
    const timers = {};

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const qId    = entry.target.dataset.qid;
        const qIndex = Number(entry.target.dataset.qindex);
        if (!qId) return;

        if (entry.isIntersecting) {
          // Start timing this question
          timers[qId] = Date.now();
        } else if (timers[qId]) {
          const secs = Math.round((Date.now() - timers[qId]) / 1000);
          delete timers[qId];
          // Fire drop-off log
          responsesApi.recordDropOff({
            survey_id:             surveyId,
            session_id:            sessionId,
            question_id:           qId,
            question_index:        qIndex,
            answered:              false, // will be overwritten on submit
            time_on_question_secs: secs,
            channel,
            device_type:           /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile'
                                 : /tablet|ipad/i.test(navigator.userAgent) ? 'tablet' : 'desktop',
          });
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-qid]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [questions.length, surveyId, sessionId, channel]);

  // ── Unload handler: record last-seen question as drop-off point ──────────────
  useEffect(() => {
    const handleUnload = () => {
      if (submitted) return;
      // best-effort beacon
      navigator.sendBeacon?.('/api/responses/drop-off',
        JSON.stringify({ survey_id: surveyId, session_id: sessionId, answered: false, channel })
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [submitted, surveyId, sessionId, channel]);

  const submitMutation = useMutation({
    mutationFn: responsesApi.submit,
    onSuccess: (data) => {
      clearDraft(surveyId);
      setResponseId(data.response_id);
      setSubmitted(true);
    },
    onError: (err) => setSubmitError(err?.error || 'Submission failed. Please try again.'),
  });

  const onSubmit = (data) => {
    setSubmitError(null);
    const activeVersion = survey?.SurveyVersions?.find((v) => v.is_active);
    const answers = Object.entries(data.answers || {}).flatMap(([question_id, val]) => {
      if (Array.isArray(val.value_json)) {
        const texts = val.value_json.filter(Boolean);
        return [{ question_id, value_json: texts, value_text: texts.join(', ') }];
      }
      return [{
        question_id,
        value_text:         val.value_text         || null,
        value_number:       val.value_number != null && val.value_number !== '' ? Number(val.value_number) : null,
        value_json:         val.value_json          || null,
        selected_option_id: val.selected_option_id  || null,
      }];
    }).filter((a) => a.value_text || a.value_number != null || a.value_json || a.selected_option_id);

    submitMutation.mutate({
      survey_id:   surveyId,
      version_id:  activeVersion?.version_id,
      answers,
      channel,
      started_at:  startedAtRef.current,
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="text-indigo-600 w-8 h-8" />
    </div>
  );

  if (error || !survey) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-4">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Survey Unavailable</h2>
        <p className="text-gray-500 mt-2">This survey is not found or is no longer accepting responses.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center max-w-sm px-4">
        <CheckCircle size={72} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900">Thank you!</h2>
        <p className="text-gray-500 mt-2">
          {survey.thank_you_message || 'Your response has been recorded successfully.'}
        </p>
        {responseId && (
          <p className="text-xs text-gray-400 mt-4 font-mono">Response ID: {responseId}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && <p className="text-gray-500 mt-2">{survey.description}</p>}
          {survey.welcome_message && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700">
              {survey.welcome_message}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>

        {questions.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>This survey has no questions yet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {questions.map((q, i) => (
              <div key={q.question_id} data-qid={q.question_id} data-qindex={i}>
                <QuestionField question={q} register={register} errors={errors} />
              </div>
            ))}

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {submitError}
              </div>
            )}

            <button type="submit" disabled={submitMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold rounded-xl">
              {submitMutation.isPending && <Spinner className="w-5 h-5" />}
              {submitMutation.isPending ? 'Submitting…' : 'Submit Response'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
