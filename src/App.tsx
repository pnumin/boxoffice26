import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { getYesterday, formatDateForInput, formatForApi, formatDateDisplay } from './utils';
import type { BoxOfficeResponse, BoxOfficeMovie, MovieDetailResponse, MovieDetail } from './types';
import { MovieDetailModal } from './components/MovieDetailModal';

export default function App() {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateForInput(getYesterday()));
  const [movies, setMovies] = useState<BoxOfficeMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const maxSelectableDateStr = formatDateForInput(getYesterday());

  useEffect(() => {
    fetchDailyBoxOffice(selectedDateStr);
  }, [selectedDateStr]);

  const fetchDailyBoxOffice = async (dateStr: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const targetDt = formatForApi(dateStr);
      const res = await fetch(`/api/boxoffice/daily?targetDt=${targetDt}`);
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data: BoxOfficeResponse = await res.json();
      setMovies(data.boxOfficeResult?.dailyBoxOfficeList || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieClick = async (movieCd: string) => {
    setSelectedMovieId(movieCd);
    setIsModalOpen(true);
    setIsDetailLoading(true);
    setMovieDetail(null);
    
    try {
      const res = await fetch(`/api/movie/${movieCd}`);
       if (!res.ok) {
        throw new Error('Failed to fetch movie details');
      }
      const data: MovieDetailResponse = await res.json();
      setMovieDetail(data.movieInfoResult?.movieInfo || null);
    } catch (err) {
      console.error(err);
      setMovieDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedMovieId(null);
      setMovieDetail(null);
    }, 200); // clear after animation potentially
  };

  const formatNumber = (numStr: string) => {
    return new Intl.NumberFormat('ko-KR').format(parseInt(numStr, 10));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                일일 박스오피스
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                어제까지의 영화 순위를 확인하세요.
              </p>
            </div>
            
            <div className="relative">
              <label htmlFor="date-picker" className="sr-only">날짜 선택</label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CalendarIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="date"
                id="date-picker"
                max={maxSelectableDateStr}
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-800 sm:text-sm sm:leading-6 bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-slate-900">
            {formatDateDisplay(selectedDateStr)} 기준
          </h2>
        </div>

        {isLoading ? (
          <div className="flex animate-pulse space-y-4 flex-col">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 w-full rounded-xl bg-slate-200"></div>
             ))}
          </div>
        ) : error ? (
           <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
           </div>
        ) : movies.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">데이터가 없습니다.</h3>
            <p className="mt-2 text-sm text-slate-500">선택한 날짜의 박스오피스 데이터가 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 bg-transparent">
            {movies.map((movie) => {
              const rankInten = parseInt(movie.rankInten, 10);
              return (
                <div 
                  key={movie.movieCd}
                  onClick={() => handleMovieClick(movie.movieCd)}
                  className="group relative flex cursor-pointer items-center overflow-hidden rounded-xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300 active:scale-[0.99]"
                >
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center sm:w-20">
                    <span className="text-3xl font-black italic tracking-tighter text-slate-900">{movie.rank}</span>
                    <div className="mt-1 flex items-center text-xs font-medium">
                      {movie.rankOldAndNew === 'NEW' ? (
                        <span className="text-orange-500">NEW</span>
                      ) : rankInten > 0 ? (
                        <span className="flex items-center text-red-500"><TrendingUp className="mr-0.5 h-3 w-3" />{rankInten}</span>
                      ) : rankInten < 0 ? (
                        <span className="flex items-center text-blue-500"><TrendingDown className="mr-0.5 h-3 w-3" />{Math.abs(rankInten)}</span>
                      ) : (
                        <span className="flex items-center text-slate-400"><Minus className="h-3 w-3" /></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex min-w-0 flex-1 flex-col justify-center">
                    <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-slate-700">
                      {movie.movieNm}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                      <span className="max-w-[80px] xs:max-w-none truncate sm:inline">
                        개봉: {movie.openDt}
                      </span>
                      <span className="hidden sm:inline">&middot;</span>
                      <span className="font-medium text-slate-700">
                        일일 관객 {formatNumber(movie.audiCnt)}명
                      </span>
                    </div>
                  </div>

                  <div className="ml-4 flex shrink-0 items-center">
                    <div className="hidden flex-col items-end sm:flex mr-4">
                      <span className="text-xs text-slate-500">누적 관객</span>
                      <span className="font-semibold text-slate-900">{formatNumber(movie.audiAcc)}명</span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600">
                      <Info className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MovieDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movie={movieDetail}
        isLoading={isDetailLoading}
      />
    </div>
  );
}
