import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function chunkText(text: string, maxWords = 150): string[] {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const videoId = ytdl.getURLVideoID(url);

    // Get transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map((t: any) => t.text).join(' ');
    const chunks = chunkText(fullText);

    // Get embeddings
    const embeddings = await openai.embeddings.create({
      input: chunks,
      model: 'text-embedding-3-small',
    });

    const queryEmbedding = (
      await openai.embeddings.create({
        input: ['Summarize this video transcript.'],
        model: 'text-embedding-3-small',
      })
    ).data[0].embedding;

    const scoredChunks = chunks.map((chunk, i) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, embeddings.data[i].embedding),
    }));

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3).map((s) => s.chunk);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes YouTube videos.',
        },
        {
          role: 'user',
          content: `Summarize this video:\n\n${topChunks.join('\n\n')}`,
        },
      ],
    });

    const summary = completion.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to summarize video.' }, { status: 500 });
  }
}
