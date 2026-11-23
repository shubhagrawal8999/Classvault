import subjectData from './subjects.json'

export interface Unit {
  id: string
  title: string
  fileName: string
  description?: string
  questions?: string[]
  assignment?: Record<string, unknown>
}

export interface Subject {
  id: string
  name: string
  units: Unit[]
}

export const subjects: Subject[] = subjectData
