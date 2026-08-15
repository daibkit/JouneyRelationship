'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleHeart, Flame, RefreshCcw, SmilePlus, Rocket, Wine, ArrowLeft, Loader2 } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { getQuestionsByCategory } from '@/app/actions/questions';

const DECKS = {
  fun: {
    id: 'fun',
    icon: SmilePlus,
    color: 'from-blue-400 to-cyan-300',
    title: { en: 'Icebreakers & Fun', vi: 'Làm quen & Vui vẻ' },
    desc: { en: 'Light-hearted questions to spark a smile.', vi: 'Những câu hỏi nhẹ nhàng để làm nhau cười.' }
  },
  deep: {
    id: 'deep',
    icon: Flame,
    color: 'from-pink-500 to-rose-400',
    title: { en: 'Deep Connection', vi: 'Gắn kết sâu sắc' },
    desc: { en: 'Understand each other on a whole new level.', vi: 'Thấu hiểu nhau sâu sắc hơn mức bình thường.' }
  },
  future: {
    id: 'future',
    icon: Rocket,
    color: 'from-violet-500 to-purple-400',
    title: { en: 'Future Goals', vi: 'Kế hoạch tương lai' },
    desc: { en: 'Where are we heading next together?', vi: 'Chúng ta sẽ cùng hướng về đâu?' }
  },
  spicy: {
    id: 'spicy',
    icon: Wine,
    color: 'from-red-500 to-orange-400',
    title: { en: 'Spicy Secrets', vi: 'Thử thách Bí mật' },
    desc: { en: 'Get a little closer and a little bolder.', vi: 'Tiến lại gần hơn và táo bạo hơn một chút.' }
  }
};

type DeckKey = keyof typeof DECKS;

export default function DeepTalk() {
  const { dict, locale } = useI18nStore();
  const [selectedDeckId, setSelectedDeckId] = useState<DeckKey | null>(null);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentText, setCurrentText] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const handleDeckSelect = async (key: DeckKey) => {
    setSelectedDeckId(key);
    setHasDrawn(false);
    setIsFlipped(false);
    setCurrentText('');
    
    setIsLoading(true);
    const res = await getQuestionsByCategory(key);
    if (res.data) {
      setQuestions(res.data);
    }
    setIsLoading(false);
  };

  const handleBackToDecks = () => {
    setSelectedDeckId(null);
    setQuestions([]);
  };

  const drawCard = () => {
    if (!selectedDeckId || questions.length === 0) return;
    setIsFlipped(false);
    
    setTimeout(() => {
      const activeLanguage = locale === 'en' ? 'en' : 'vi';
      const randomQMsg = questions[Math.floor(Math.random() * questions.length)];
      
      let text = '';
      try {
        const parsed = JSON.parse(randomQMsg.question_text);
        text = parsed[activeLanguage] || parsed['en'];
      } catch(e) {
        text = randomQMsg.question_text; 
      }
      
      setCurrentText(text);
      setHasDrawn(true);
      setIsFlipped(true);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 md:p-6 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-pink-50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl -z-10" />

      <div className="text-center mb-8 relative z-10 w-full">
        {selectedDeckId ? (
          <div className="flex items-center justify-between w-full relative">
            <button 
              onClick={handleBackToDecks}
              className="p-2 absolute left-0 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl md:text-2xl font-serif text-slate-800 flex-1 text-center font-bold">
              {DECKS[selectedDeckId].title[locale === 'en' ? 'en' : 'vi']}
            </h2>
          </div>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-serif text-slate-800 mb-2 flex items-center justify-center gap-2 font-bold">
              <MessageCircleHeart className="w-7 h-7 text-pink-500" /> {dict.deepTalk.title}
            </h2>
            <p className="text-slate-500 font-medium">{dict.deepTalk.subtitle}</p>
          </>
        )}
      </div>

      <div className="w-full relative z-10 min-h-[350px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!selectedDeckId ? (
            <motion.div
              key="decks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
              {Object.entries(DECKS).map(([k, deck]) => (
                <button
                  key={k}
                  onClick={() => handleDeckSelect(k as DeckKey)}
                  className={`p-5 rounded-[2rem] text-left border border-white/50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-br ${deck.color} text-white group`}
                >
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <deck.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-1">{deck.title[locale === 'en' ? 'en' : 'vi']}</h3>
                  <p className="text-white/80 text-sm font-medium">{deck.desc[locale === 'en' ? 'en' : 'vi']}</p>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full max-w-sm aspect-[4/3] mb-8 relative perspective-1000">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full h-full border-2 border-dashed border-slate-300 rounded-[2.5rem] flex items-center justify-center text-slate-400 bg-slate-50/50"
                    >
                      <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                    </motion.div>
                  ) : !hasDrawn ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full h-full border-2 border-dashed border-slate-300 rounded-[2.5rem] flex items-center justify-center text-slate-400 bg-slate-50/50"
                    >
                      {questions.length === 0 ? 'No questions in this deck' : dict.deepTalk.chooseCard}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="card"
                      className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <div className={`absolute w-full h-full [backface-visibility:hidden] rounded-[2.5rem] bg-gradient-to-br ${DECKS[selectedDeckId].color} shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center border-4 border-white/40`}>
                        <div className="text-white text-center">
                          {(() => {
                            const Icon = DECKS[selectedDeckId].icon;
                            return <Icon className="w-12 h-12 mx-auto mb-3 opacity-80" />;
                          })()}
                          <span className="font-serif text-2xl font-bold tracking-wider opacity-90">
                            {DECKS[selectedDeckId].title[locale === 'en' ? 'en' : 'vi']}
                          </span>
                        </div>
                      </div>
                      
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-white border border-slate-100"
                        style={{ transform: "rotateY(180deg)" }}
                      >
                        <div className="absolute top-6 left-6 opacity-10">
                          {(() => {
                            const Icon = DECKS[selectedDeckId].icon;
                            return <Icon className="w-12 h-12 text-slate-800" />;
                          })()}
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase mb-4 text-pink-500">
                          Question
                        </span>
                        <p className="text-lg md:text-xl font-medium text-slate-800">{currentText}</p>
                        
                        <div className="absolute bottom-6 text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                          <RefreshCcw className="w-3 h-3" /> {dict.deepTalk.tapToHide}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={drawCard}
                disabled={isLoading || questions.length === 0}
                className={`w-full max-w-[250px] text-white py-4 flex justify-center items-center gap-2 rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                  selectedDeckId ? `bg-gradient-to-br ${DECKS[selectedDeckId].color}` : 'bg-pink-500'
                }`}
              >
                <Flame className="w-5 h-5" />
                {dict.deepTalk.drawBtn}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
