'use client';

import { useState, useEffect } from 'react';
import { Music, PlayCircle, Send, Loader2 } from 'lucide-react';
import { getMusicPicks, addMusicPick } from '@/app/actions/sparks';
import { useCoupleStore } from '@/store/useCoupleStore';
import { MusicPick } from '@/types/database';
import { motion } from 'framer-motion';
import { useI18nStore } from '@/store/useI18nStore';
import { supabase } from '@/lib/supabase';

export default function MusicToday() {
  const { currentUser } = useCoupleStore();
  const { dict } = useI18nStore();
  const [pick, setPick] = useState<MusicPick | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getMusicPicks();
      if (res.data && res.data.length > 0) {
        setPick(res.data[0]); // Get latest pick
      }
      setLoading(false);
    }
    loadData();

    // Real-time synchronization
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'music_picks' },
        (payload) => {
          if (payload.new) {
            setPick(payload.new as MusicPick);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getEmbedUrl = (url: string) => {
    // Spotify
    const spotifyRegex = /open\.spotify\.com\/(track|album|playlist|episode|artist)\/([a-zA-Z0-9]+)/;
    const spotifyMatch = url.match(spotifyRegex);
    if (spotifyMatch) {
      return {
        url: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&autoplay=1`,
        source: 'spotify'
      };
    }

    // YouTube
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const ytMatch = url.match(ytRegex);
    if (ytMatch) {
      return {
        url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`,
        source: 'youtube'
      };
    }

    return null;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !inputUrl) return;

    const embedData = getEmbedUrl(inputUrl);
    if (!embedData) {
      alert(dict.musicToday.invalidLink);
      return;
    }

    setIsSubmitting(true);
    const res = await addMusicPick(currentUser.id, inputUrl);
    if (res.success && res.data) {
      setPick(res.data as MusicPick);
      setInputUrl('');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const embedData = pick ? getEmbedUrl(pick.spotify_url) : null;

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-[#1DB954]/10 to-[#191414]/10 rounded-[2.5rem] border border-[#1DB954]/20 p-6 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#1DB954]/20 rounded-full blur-3xl -z-10" />
      
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-6 h-6 text-[#1DB954]" />
          <h2 className="text-xl font-bold text-slate-800">{dict.musicToday.title}</h2>
        </div>

        {embedData ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-2xl overflow-hidden shadow-lg ${embedData.source === 'youtube' ? 'h-[200px] md:h-[250px]' : 'h-[152px]'}`}
          >
            <iframe 
              src={embedData.url} 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              loading="lazy"
              className="bg-transparent"
            ></iframe>
          </motion.div>
        ) : (
          <div className="w-full h-[152px] flex flex-col items-center justify-center bg-white/40 rounded-2xl border-2 border-dashed border-[#1DB954]/30 text-slate-500">
            <PlayCircle className="w-10 h-10 mb-2 opacity-50" />
            <p className="font-medium">{dict.musicToday.noSong}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate} className="mt-6 flex gap-2">
        <input 
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder={dict.musicToday.placeholder}
          className="flex-1 bg-white/70 border border-[#1DB954]/30 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50 transition-all placeholder-slate-400 text-slate-700"
        />
        <button 
          disabled={!inputUrl || isSubmitting}
          type="submit"
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white p-3 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
        </button>
      </form>
    </div>
  );
}
