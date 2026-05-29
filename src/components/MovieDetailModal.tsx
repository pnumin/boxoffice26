import { useState } from 'react';
import { X, Clock, Calendar, Film, Users, Globe, Sparkles, Send } from 'lucide-react';
import type { MovieDetail } from '../types';

interface ModalProps {
  movie: MovieDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function MovieDetailModal({ movie, isOpen, onClose, isLoading }: ModalProps) {
  const [isAiReviewOpen, setIsAiReviewOpen] = useState(false);
  const [simpleReview, setSimpleReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState('');

  const handleClose = () => {
    setIsAiReviewOpen(false);
    setSimpleReview('');
    setGeneratedReview('');
    onClose();
  };

  const handleGenerateReview = async () => {
    if (!simpleReview.trim() || !movie) return;

    setIsGenerating(true);
    setGeneratedReview('');
    
    try {
      const response = await fetch('/api/review/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieName: movie.movieNm,
          simpleReview: simpleReview,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate review');
      }

      const data = await response.json();
      setGeneratedReview(data.generatedReview);
    } catch (error) {
      console.error(error);
      setGeneratedReview('감상평 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal content */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          </div>
        ) : movie ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{movie.movieNm}</h3>
                {movie.movieNmEn && (
                  <p className="mt-1 text-sm text-slate-500">{movie.movieNmEn}</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 mb-8">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3">
                  <Calendar className="mb-2 h-5 w-5 text-slate-400" />
                  <span className="text-xs text-slate-500">개봉일</span>
                  <span className="font-medium text-slate-900">{movie.openDt || '-'}</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3">
                  <Clock className="mb-2 h-5 w-5 text-slate-400" />
                  <span className="text-xs text-slate-500">상영시간</span>
                  <span className="font-medium text-slate-900">{movie.showTm ? `${movie.showTm}분` : '-'}</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3">
                  <Globe className="mb-2 h-5 w-5 text-slate-400" />
                  <span className="text-xs text-slate-500">국가</span>
                  <span className="font-medium text-slate-900">{movie.nations[0]?.nationNm || '-'}</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3">
                  <Film className="mb-2 h-5 w-5 text-slate-400" />
                  <span className="text-xs text-slate-500">장르</span>
                  <span className="font-medium text-slate-900 text-center">{movie.genres.map(g => g.genreNm).join(', ') || '-'}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-slate-900 mb-3">
                    <Users className="mr-2 h-4 w-4 text-slate-400" />
                    감독
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.directors.length > 0 ? movie.directors.map((d, i) => (
                      <span key={i} className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        {d.peopleNm}
                      </span>
                    )) : <span className="text-sm text-slate-500">정보 없음</span>}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-semibold text-slate-900 mb-3">
                    <Users className="mr-2 h-4 w-4 text-slate-400" />
                    출연진
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.actors.length > 0 ? movie.actors.map((a, i) => (
                      <div key={i} className="inline-flex flex-col rounded-md bg-white px-3 py-1.5 ring-1 ring-inset ring-slate-200">
                        <span className="text-sm font-medium text-slate-800">{a.peopleNm}</span>
                        {a.cast && <span className="text-xs text-slate-500">{a.cast} 역</span>}
                      </div>
                    )) : <span className="text-sm text-slate-500">정보 없음</span>}
                  </div>
                </div>

                {isAiReviewOpen ? (
                  <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                    <h4 className="flex items-center text-sm font-semibold text-blue-900 mb-3">
                      <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                      AI 상세 감상평 작성
                    </h4>
                    <p className="text-xs text-blue-700 mb-3">
                      간단한 느낌을 작성해주시면 AI가 상세한 감상평으로 발전시켜 드립니다.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={simpleReview}
                        onChange={(e) => setSimpleReview(e.target.value)}
                        placeholder="예: 영상미가 너무 좋고 감동적이었어요."
                        className="flex-1 rounded-lg border-0 py-2 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-blue-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleGenerateReview();
                          }
                        }}
                      />
                      <button
                        onClick={handleGenerateReview}
                        disabled={isGenerating || !simpleReview.trim()}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {generatedReview && (
                      <div className="mt-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-blue-100">
                        <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                          {generatedReview}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setIsAiReviewOpen(true)}
                      className="flex items-center justify-center rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI 감상평 작성하기
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t flex justify-end rounded-b-2xl">
               <button
                onClick={handleClose}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
            <p className="text-lg font-medium text-slate-900">영화 정보를 불러올 수 없습니다.</p>
            <button
               onClick={handleClose}
               className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
