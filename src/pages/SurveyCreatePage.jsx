import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { surveysApi } from '../services/api';
import { PageHeader, Spinner } from '../components/ui';

const QUESTION_TYPES = [
  { value: 'text',     label: 'Short Text' },
  { value: 'rating',   label: 'Rating (1–5)' },
  { value: 'scale',    label: 'Scale (1–10)' },
  { value: 'mcq',      label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'yes_no',   label: 'Yes / No' },
  { value: 'date',     label: 'Date' },
  { value: 'matrix',   label: 'Matrix / Grid' },
  { value: 'file',     label: 'File Upload' },
];

function QuestionCard({ index, remove, control, register, watch, errors }) {
  const { fields: options, append, remove: removeOpt } = useFieldArray({ control, name: `questions.${index}.options` });
  const qType = watch(`questions.${index}.question_type`);
  const hasOptions = ['mcq', 'checkbox', 'dropdown'].includes(qType);
  const hasRange   = ['rating', 'scale'].includes(qType);

  return (
    <div className="card border-l-4 border-l-indigo-400">
      <div className="flex items-start gap-2 sm:gap-3 mb-4">
        <GripVertical size={18} className="text-gray-300 mt-2 flex-shrink-0 hidden sm:block" />
        <div className="flex-1 space-y-3 min-w-0">

          {/* Question text + type — stacked on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <label className="label">Question {index + 1} *</label>
              <input className="input" placeholder="Enter your question…"
                {...register(`questions.${index}.question_text`, { required: true })} />
            </div>
            <div className="w-full sm:w-48">
              <label className="label">Type</label>
              <select className="input" {...register(`questions.${index}.question_type`)}>
                {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Helper text */}
          <div>
            <label className="label">Helper / Sub-text</label>
            <input className="input text-sm" placeholder="Optional hint shown below the question…"
              {...register(`questions.${index}.helper_text`)} />
          </div>

          {/* Placeholder */}
          {qType === 'text' && (
            <div>
              <label className="label">Placeholder text</label>
              <input className="input text-sm" placeholder="e.g. Type your answer here…"
                {...register(`questions.${index}.placeholder`)} />
            </div>
          )}

          {/* Min/Max — stacked on mobile */}
          {hasRange && (
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-1 sm:w-32 sm:flex-none">
                <label className="label">Min value</label>
                <input type="number" className="input" defaultValue={1} {...register(`questions.${index}.min_value`)} />
              </div>
              <div className="flex-1 sm:w-32 sm:flex-none">
                <label className="label">Max value</label>
                <input type="number" className="input" defaultValue={qType === 'scale' ? 10 : 5}
                  {...register(`questions.${index}.max_value`)} />
              </div>
            </div>
          )}

          {/* Section + Required */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="label">Section / Group</label>
              <input className="input text-sm" placeholder="e.g. Part A, Demographics…"
                {...register(`questions.${index}.section`)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer sm:mb-1 touch-manipulation">
              <input type="checkbox" className="rounded w-4 h-4" {...register(`questions.${index}.is_required`)} />
              Required
            </label>
          </div>

          {/* Options for MCQ/Checkbox/Dropdown */}
          {hasOptions && (
            <div className="space-y-2 pl-2 border-l-2 border-indigo-200">
              <p className="text-xs font-medium text-gray-500 uppercase">Answer Options</p>
              {options.map((opt, oi) => (
                <div key={opt.id} className="flex gap-2">
                  <input className="input flex-1 min-w-0" placeholder={`Option ${oi + 1}`}
                    {...register(`questions.${index}.options.${oi}.option_text`, { required: true })} />
                  <input className="input w-20 sm:w-28 text-sm text-gray-500" placeholder="Value"
                    {...register(`questions.${index}.options.${oi}.option_value`)} />
                  <button type="button" onClick={() => removeOpt(oi)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 touch-manipulation flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => append({ option_text: '', option_value: '' })}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1 touch-manipulation py-1">
                <Plus size={14} /> Add option
              </button>
            </div>
          )}
        </div>

        <button type="button" onClick={() => remove(index)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-1 p-1 touch-manipulation flex-shrink-0">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function SurveyCreatePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ['surveys', id],
    queryFn: () => surveysApi.getOne(id),
    enabled: isEdit,
  });

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', status: 'draft', language: 'en', is_anonymous: false, allow_multiple: false, show_progress: true, questions: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  useEffect(() => {
    if (existing) {
      const activeVersion = existing.SurveyVersions?.find((v) => v.is_active);
      reset({
        title: existing.title,
        description: existing.description,
        status: existing.status,
        category: existing.category,
        language: existing.language,
        welcome_message: existing.welcome_message,
        thank_you_message: existing.thank_you_message,
        is_anonymous: existing.is_anonymous,
        allow_multiple: existing.allow_multiple,
        show_progress: existing.show_progress,
        time_limit_mins: existing.time_limit_mins,
        max_responses: existing.max_responses,
        start_date: existing.start_date,
        end_date: existing.end_date,
        questions: activeVersion?.Questions?.map((q) => ({
          question_text: q.question_text,
          helper_text: q.helper_text,
          question_type: q.question_type,
          is_required: q.is_required,
          section: q.section,
          placeholder: q.placeholder,
          min_value: q.min_value,
          max_value: q.max_value,
          options: q.Options?.map((o) => ({ option_text: o.option_text, option_value: o.option_value })) || [],
        })) || [],
      });
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: surveysApi.create,
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['surveys'] }); navigate(`/app/surveys/${data.survey_id}`); },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => surveysApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['surveys'] }); navigate(`/app/surveys/${id}`); },
  });

  const onSubmit = (data) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Survey' : 'Create Survey'}
        subtitle={isEdit ? 'Changes will create a new version of the survey.' : 'Build your survey and add questions.'}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Survey Details ── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Survey Details</h2>

          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Customer Satisfaction Q4"
              {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Optional description shown to respondents…"
              {...register('description')} />
          </div>

          {/* Grid — 1 col on mobile, 2 cols on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" {...register('category')}>
                <option value="">Select category…</option>
                <option value="customer_satisfaction">Customer Satisfaction</option>
                <option value="employee_feedback">Employee Feedback</option>
                <option value="product_feedback">Product Feedback</option>
                <option value="market_research">Market Research</option>
                <option value="nps">NPS Survey</option>
                <option value="event_feedback">Event Feedback</option>
                <option value="onboarding">Onboarding</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select className="input" {...register('language')}>
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="label">Time Limit (minutes)</label>
              <input type="number" className="input" placeholder="Leave blank for no limit"
                {...register('time_limit_mins')} />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" {...register('start_date')} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" {...register('end_date')} />
            </div>
            <div className="sm:col-span-2 sm:max-w-xs">
              <label className="label">Max Responses</label>
              <input type="number" className="input" placeholder="Leave blank for unlimited"
                {...register('max_responses')} />
            </div>
          </div>

          <div>
            <label className="label">Welcome Message</label>
            <textarea className="input resize-none" rows={2}
              placeholder="Shown at the start of the survey…" {...register('welcome_message')} />
          </div>

          <div>
            <label className="label">Thank You Message</label>
            <textarea className="input resize-none" rows={2}
              placeholder="Shown after submission…" {...register('thank_you_message')} />
          </div>

          {/* Toggles — vertical on mobile */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer touch-manipulation">
              <input type="checkbox" className="rounded w-4 h-4" {...register('is_anonymous')} />
              Anonymous responses
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer touch-manipulation">
              <input type="checkbox" className="rounded w-4 h-4" {...register('allow_multiple')} />
              Allow multiple submissions
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer touch-manipulation">
              <input type="checkbox" className="rounded w-4 h-4" {...register('show_progress')} />
              Show progress bar
            </label>
          </div>
        </div>

        {/* ── Questions ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Questions ({fields.length})</h2>
          </div>

          {fields.map((field, index) => (
            <QuestionCard key={field.id} index={index} remove={remove}
              control={control} register={register} watch={watch} errors={errors} />
          ))}

          <button
            type="button"
            onClick={() => append({ question_text: '', helper_text: '', question_type: 'text', is_required: false, section: '', options: [] })}
            className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 text-gray-500 hover:text-indigo-600 rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors touch-manipulation"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>

        {/* Action buttons — stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={isPending} className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-2 touch-manipulation">
            {isPending && <Spinner size={16} />}
            {isEdit ? 'Save & Create New Version' : 'Create Survey'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary py-3 sm:py-2 touch-manipulation">Cancel</button>
        </div>
      </form>
    </div>
  );
}
