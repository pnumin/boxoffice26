import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post('/api/review/generate', async (req, res) => {
    try {
      const { movieName, simpleReview } = req.body;
      if (!movieName || !simpleReview) {
        return res.status(400).json({ error: 'movieName and simpleReview are required' });
      }

      const prompt = `사용자가 영화 "${movieName}"에 대해 다음과 같은 간단한 감상평을 남겼습니다:\n"${simpleReview}"\n이 간단한 감상평의 맥락과 감정을 바탕으로, 영화 "${movieName}"에 대한 상세하고 자연스러운 감상평을 작성해주세요. 출력은 상세 감상평 텍스트만 해주세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ generatedReview: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: 'Failed to generate review' });
    }
  });

  // Add robust fetching logic with fallback for development and correct API parametering
  app.get('/api/boxoffice/daily', async (req, res) => {
    try {
      const targetDt = req.query.targetDt;
      if (!targetDt) {
        return res.status(400).json({ error: 'targetDt parameter is required' });
      }

      // Allow passing key via env, fallback to process.env.KOBIS_API_KEY
      const apiKey = process.env.KOBIS_API_KEY || "2a350cfbca6c428eb04c71e21cc681e7"; 
      
      const response = await fetch(`http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${targetDt}`);
      
      if (!response.ok) {
        throw new Error(`KOBIS API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Box office fetch error:", error);
      res.status(500).json({ error: 'Failed to fetch box office data' });
    }
  });

  app.get('/api/movie/:movieCd', async (req, res) => {
    try {
      const movieCd = req.params.movieCd;
      if (!movieCd) {
         return res.status(400).json({ error: 'movieCd is required' });
      }

      const apiKey = process.env.KOBIS_API_KEY || "2a350cfbca6c428eb04c71e21cc681e7";
      
      const response = await fetch(`http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`);
      
      if (!response.ok) {
        throw new Error(`KOBIS API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Movie detail fetch error:", error);
      res.status(500).json({ error: 'Failed to fetch movie details' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
