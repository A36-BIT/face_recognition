
export interface AnalysisResult {
  gender: string;
  age: string;
  description: string;
}

export enum AnalysisState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
