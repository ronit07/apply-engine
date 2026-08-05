import { Plus, Trash2 } from 'lucide-react'
import type { EducationEntry, ExperienceEntry, ProjectEntry, TailoredResumeContent } from '../../types'

interface ResumeEditorProps {
  resume: TailoredResumeContent
  onChange: (resume: TailoredResumeContent) => void
}

const inputClass =
  'rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
const labelClass = 'text-xs font-medium text-neutral-500 dark:text-neutral-400'

function emptyExperience(): ExperienceEntry {
  return { company: '', title: '', start_date: '', end_date: '', bullets: [''] }
}
function emptyProject(): ProjectEntry {
  return { name: '', dates: '', bullets: [''] }
}
function emptyEducation(): EducationEntry {
  return { school: '', degree: '', dates: '', details: '' }
}

export function ResumeEditor({ resume, onChange }: ResumeEditorProps) {
  const update = <K extends keyof TailoredResumeContent>(key: K, value: TailoredResumeContent[K]) =>
    onChange({ ...resume, [key]: value })

  return (
    <div className="flex flex-col gap-6 text-sm">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Summary</span>
        <textarea
          value={resume.summary}
          onChange={(e) => update('summary', e.target.value)}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Skills (comma-separated)</span>
        <input
          value={resume.skills.join(', ')}
          onChange={(e) =>
            update(
              'skills',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            )
          }
          className={inputClass}
        />
      </label>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={labelClass}>Experience</span>
          <button
            type="button"
            onClick={() => update('experience', [...resume.experience, emptyExperience()])}
            className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {resume.experience.map((entry, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <input
                  placeholder="Company"
                  value={entry.company}
                  onChange={(e) => {
                    const next = [...resume.experience]
                    next[i] = { ...entry, company: e.target.value }
                    update('experience', next)
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Title"
                  value={entry.title}
                  onChange={(e) => {
                    const next = [...resume.experience]
                    next[i] = { ...entry, title: e.target.value }
                    update('experience', next)
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Start date"
                  value={entry.start_date}
                  onChange={(e) => {
                    const next = [...resume.experience]
                    next[i] = { ...entry, start_date: e.target.value }
                    update('experience', next)
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="End date"
                  value={entry.end_date}
                  onChange={(e) => {
                    const next = [...resume.experience]
                    next[i] = { ...entry, end_date: e.target.value }
                    update('experience', next)
                  }}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => update('experience', resume.experience.filter((_, idx) => idx !== i))}
                className="mt-1 text-neutral-400 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              placeholder="Bullets, one per line"
              value={entry.bullets.join('\n')}
              onChange={(e) => {
                const next = [...resume.experience]
                next[i] = { ...entry, bullets: e.target.value.split('\n') }
                update('experience', next)
              }}
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={labelClass}>Projects</span>
          <button
            type="button"
            onClick={() => update('projects', [...resume.projects, emptyProject()])}
            className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {resume.projects.map((entry, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <input
                  placeholder="Project name"
                  value={entry.name}
                  onChange={(e) => {
                    const next = [...resume.projects]
                    next[i] = { ...entry, name: e.target.value }
                    update('projects', next)
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Dates"
                  value={entry.dates}
                  onChange={(e) => {
                    const next = [...resume.projects]
                    next[i] = { ...entry, dates: e.target.value }
                    update('projects', next)
                  }}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => update('projects', resume.projects.filter((_, idx) => idx !== i))}
                className="mt-1 text-neutral-400 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              placeholder="Bullets, one per line"
              value={entry.bullets.join('\n')}
              onChange={(e) => {
                const next = [...resume.projects]
                next[i] = { ...entry, bullets: e.target.value.split('\n') }
                update('projects', next)
              }}
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={labelClass}>Education</span>
          <button
            type="button"
            onClick={() => update('education', [...resume.education, emptyEducation()])}
            className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {resume.education.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <input
                placeholder="School"
                value={entry.school}
                onChange={(e) => {
                  const next = [...resume.education]
                  next[i] = { ...entry, school: e.target.value }
                  update('education', next)
                }}
                className={inputClass}
              />
              <input
                placeholder="Degree"
                value={entry.degree}
                onChange={(e) => {
                  const next = [...resume.education]
                  next[i] = { ...entry, degree: e.target.value }
                  update('education', next)
                }}
                className={inputClass}
              />
              <input
                placeholder="Dates"
                value={entry.dates}
                onChange={(e) => {
                  const next = [...resume.education]
                  next[i] = { ...entry, dates: e.target.value }
                  update('education', next)
                }}
                className={inputClass}
              />
              <input
                placeholder="Details"
                value={entry.details}
                onChange={(e) => {
                  const next = [...resume.education]
                  next[i] = { ...entry, details: e.target.value }
                  update('education', next)
                }}
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => update('education', resume.education.filter((_, idx) => idx !== i))}
              className="mt-1 text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </section>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Certifications (comma-separated)</span>
        <input
          value={resume.certifications.join(', ')}
          onChange={(e) =>
            update(
              'certifications',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            )
          }
          className={inputClass}
        />
      </label>
    </div>
  )
}
